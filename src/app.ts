/**
 * Application controller: wires state, storage, audio, rendering and user events.
 *
 * Rendering is region-based: each region declares the state it depends on, and is re-rendered
 * only when that state changes. This keeps typing, focus and open <details> stable.
 */
import {
  BRIDGE_ID,
  getLesson,
  isLessonId,
  isSoundKey,
  REPS_PER_LEVEL,
  resolveQuiz,
  STEPS,
} from './content/course';
import type { SoundKey, StepId } from './content/types';
import { newId } from './domain/ids';
import { toSpeech } from './domain/markup';
import { suggestedLesson } from './domain/progress';
import { answerRound, nextRound, roundSpeech, startQuiz } from './domain/quiz';
import { clampInt, LIMITS } from './domain/validation';
import { AudioService } from './services/audio';
import { SpeechService } from './services/speech';
import { initialState, VIEWS, type AppState, type View } from './state/app-state';
import {
  doneKey,
  draftFor,
  emptyDraft,
  loadDrafts,
  saveDrafts,
  type LessonDraft,
} from './state/drafts';
import { loadPrefs, savePrefs } from './state/prefs';
import { createStore, type Store } from './state/store';
import { backupFileName, createBackup, downloadText, parseBackup } from './storage/backup';
import { describeStorageError } from './storage/errors';
import { createStorage } from './storage/index';
import { usableLocalStorage } from './storage/memory-storage';
import type { DataSnapshot, Rating, SessionRun, SoundNote, StorageAdapter } from './storage/types';
import { announce, toast } from './ui/feedback';
import { mount, type SafeHtml } from './ui/html';
import { renderChart } from './ui/views/chart';
import { audioPanelView, noticeView, notebookCountView, statusView } from './ui/views/header';
import { lessonHeadView, pathSummaryView, pathView } from './ui/views/lesson';
import {
  dueView,
  filtersView,
  noteFormRatingView,
  notesListView,
  soundOptionsView,
} from './ui/views/notebook';
import { reflectRatingView, stepsView, twisterLevelsView } from './ui/views/practice';
import { creditsView, dataPanelView, historyView, mapView, statsView } from './ui/views/progress';
import { quizAnnouncement, quizView } from './ui/views/quiz';
import { soundChartView, soundDetailView } from './ui/views/sounds';
import { todayView } from './ui/views/today';

export interface AppHandle {
  store: Store<AppState>;
  /** Resolves once storage is connected. */
  ready: Promise<void>;
  /** Resolves once the list of word recordings is loaded (or known to be missing). */
  audioReady: Promise<void>;
  destroy(): void;
}

interface Region {
  selector: string;
  deps: (s: AppState) => readonly unknown[];
  view?: (s: AppState) => SafeHtml;
  effect?: (el: HTMLElement, s: AppState) => void;
}

export function parseView(hash: string): View | null {
  const name = hash.replace(/^#/, '');
  return (VIEWS as readonly string[]).includes(name) ? (name as View) : null;
}

const shallowEqual = (a: readonly unknown[], b: readonly unknown[]) =>
  a.length === b.length && a.every((v, i) => Object.is(v, b[i]));

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

const current = (s: AppState): LessonDraft => draftFor(s.drafts, s.lesson);

export function startApp(): AppHandle {
  const browser = usableLocalStorage();
  const prefs = loadPrefs(browser);
  const store = createStore<AppState>(
    initialState({
      view: parseView(location.hash) ?? 'today',
      lesson: prefs.lesson ?? suggestedLesson([]),
      lessonPinned: prefs.lesson != null,
      drafts: loadDrafts(browser),
      audio: { recordings: prefs.recordings, phase: 'loading', count: 0 },
    }),
  );
  const controller = new AbortController();
  const { signal } = controller;
  let adapter: StorageAdapter | null = null;
  let unsubscribeStorage: (() => void) | null = null;
  const busy = new Set<string>();

  const speech = new SpeechService((status) => store.set({ speech: status }), prefs.voice);
  // Only a voice the learner picked is remembered. The automatic choice is not saved, so a
  // better voice installed later (or a smarter default) still takes effect.
  let chosenVoice = prefs.voice;
  const audio = new AudioService(speech, (status) => store.set({ audio: status }), {
    recordings: prefs.recordings,
  });

  /* ---------- State helpers ---------- */

  function updateDraft(lesson: string, patch: (d: LessonDraft) => Partial<LessonDraft>): void {
    store.set((s) => {
      const d = draftFor(s.drafts, lesson);
      return { drafts: { ...s.drafts, [lesson]: { ...d, ...patch(d) } } };
    });
  }

  function applyData(data: DataSnapshot): void {
    store.set((s) => {
      const patch: Partial<AppState> = { runs: data.runs, notes: data.notes };
      if (!s.lessonPinned) {
        const suggested = suggestedLesson(data.runs);
        if (suggested !== s.lesson) {
          patch.lesson = suggested;
          patch.quiz = null;
        }
      }
      if (s.notebook.checkInFor && !data.notes.some((n) => n.id === s.notebook.checkInFor)) {
        patch.notebook = { ...s.notebook, checkInFor: null };
      }
      return patch;
    });
  }

  function selectLesson(id: string | undefined): boolean {
    if (!id || (!isLessonId(id) && id !== BRIDGE_ID)) return false;
    audio.stop();
    store.set({ lesson: id, lessonPinned: true, justFinished: null, quiz: null });
    return true;
  }

  function showView(view: View): void {
    if (location.hash !== `#${view}`) location.hash = `#${view}`;
    store.set({ view });
  }

  function requireAdapter(): StorageAdapter | null {
    if (!adapter) toast('Still connecting to your saved progress. Try again in a moment.');
    return adapter;
  }

  async function guarded(name: string, task: () => Promise<void>): Promise<void> {
    if (busy.has(name)) return;
    busy.add(name);
    try {
      await task();
    } finally {
      busy.delete(name);
    }
  }

  function focus(selector: string): void {
    document.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true });
  }

  function highlightLine(index: number): void {
    document
      .querySelectorAll('#script .sline')
      .forEach((el, i) => el.classList.toggle('on', i === index));
  }

  /** Marks speak buttons that will play a real recording, so the learner can tell. */
  function markRecordings(root: ParentNode): void {
    root.querySelectorAll<HTMLElement>('[data-say]').forEach((el) => {
      const recorded = audio.willUseRecording(el.dataset.say ?? '');
      el.classList.toggle('rec', recorded);
      if (recorded) el.title = 'Recording of an American speaker';
      else el.removeAttribute('title');
    });
  }

  /* ---------- Rendering ---------- */

  let draftTimer: number | undefined;
  const regions: Region[] = [
    {
      selector: 'main',
      deps: (s) => [s.view],
      effect: (_el, s) => {
        for (const v of VIEWS) {
          const section = document.getElementById(`view-${v}`);
          if (section) section.hidden = v !== s.view;
        }
        document.querySelectorAll<HTMLElement>('.nav-item').forEach((tab) => {
          tab.setAttribute('aria-current', tab.dataset.view === s.view ? 'page' : 'false');
        });
        if (s.view !== 'practice' && s.view !== 'sounds') audio.stop();
      },
    },
    { selector: '#status', deps: (s) => [s.storage], view: statusView },
    { selector: '#storage-notice', deps: (s) => [s.storage.notice], view: noticeView },
    { selector: '#nb-count', deps: (s) => [s.notes.length], view: notebookCountView },
    { selector: '#audio-panel', deps: (s) => [s.speech, s.audio], view: audioPanelView },
    {
      selector: '#today',
      // Drafts change on every keystroke in a lesson; only follow them while Today is shown.
      deps: (s) => [s.runs, s.notes, s.view === 'today' ? s.drafts : null],
      view: todayView,
    },
    { selector: '#sound-chart', deps: (s) => [s.runs, s.notes, s.sound], view: soundChartView },
    { selector: '#sound-detail', deps: (s) => [s.runs, s.notes, s.sound], view: soundDetailView },
    { selector: '#path', deps: (s) => [s.lesson, s.runs], view: pathView },
    { selector: '#path-summary', deps: (s) => [s.lesson], view: pathSummaryView },
    {
      selector: '#lesson-head',
      deps: (s) => [s.lesson, s.runs, doneKey(current(s))],
      view: lessonHeadView,
    },
    {
      selector: '#steps',
      deps: (s) => [s.lesson, s.justFinished, doneKey(current(s))],
      view: stepsView,
    },
    {
      selector: '#quiz',
      deps: (s) => [s.lesson, s.quiz, current(s).quizBest, s.speech.supported],
      view: quizView,
    },
    {
      selector: '#twister-levels',
      deps: (s) => [s.lesson, current(s).reps.join()],
      view: twisterLevelsView,
    },
    {
      selector: '#reflect-rating',
      deps: (s) => [s.lesson, current(s).rating],
      view: reflectRatingView,
    },
    { selector: '#nf-rate', deps: (s) => [s.notebook.formRating], view: noteFormRatingView },
    { selector: '#nb-due', deps: (s) => [s.notes], view: dueView },
    { selector: '#nb-filters', deps: (s) => [s.notes, s.notebook.filter], view: filtersView },
    {
      selector: '#nb-list',
      deps: (s) => [
        s.notes,
        s.notebook.filter,
        s.notebook.checkInFor,
        s.notebook.checkInRating,
        s.notebook.confirmDelete,
      ],
      view: notesListView,
    },
    { selector: '#pg-stats', deps: (s) => [s.runs, s.notes], view: statsView },
    {
      selector: '#pg-chart',
      deps: (s) => [s.runs, s.view === 'progress', s.layoutTick],
      effect: (el, s) => {
        if (s.view === 'progress') renderChart(el, s.runs);
      },
    },
    { selector: '#pg-map', deps: (s) => [s.runs], view: mapView },
    { selector: '#pg-history', deps: (s) => [s.runs, s.history.confirmDelete], view: historyView },
    {
      selector: '#pg-data',
      deps: (s) => [s.storage.mode, s.runs.length, s.notes.length, s.importPreview],
      view: dataPanelView,
    },
    {
      selector: '#pg-credits',
      deps: (s) => [s.audio.phase, s.audio.count],
      view: () => creditsView(audio.credits()),
    },
    {
      selector: 'body',
      deps: (s) => [s.audio.phase, s.audio.recordings],
      effect: () => markRecordings(document),
    },
    {
      selector: 'body',
      deps: (s) => [s.drafts],
      effect: (_el, s) => {
        window.clearTimeout(draftTimer);
        draftTimer = window.setTimeout(() => saveDrafts(browser, s.drafts), 300);
      },
    },
    {
      selector: 'body',
      deps: (s) => [s.lesson, s.lessonPinned, s.speech.selected, s.audio.recordings],
      effect: (_el, s) =>
        savePrefs(browser, {
          lesson: s.lessonPinned ? s.lesson : null,
          voice: chosenVoice,
          recordings: s.audio.recordings,
        }),
    },
  ];

  const memo = new Map<Region, { el: Element; deps: readonly unknown[] }>();
  function render(s: AppState): void {
    for (const region of regions) {
      const el = document.querySelector<HTMLElement>(region.selector);
      if (!el) {
        memo.delete(region);
        continue;
      }
      const deps = region.deps(s);
      const previous = memo.get(region);
      if (previous && previous.el === el && shallowEqual(previous.deps, deps)) continue;
      memo.set(region, { el, deps });
      if (region.view) {
        mount(el, region.view(s));
        markRecordings(el);
      }
      region.effect?.(el, s);
    }
  }

  function flushDrafts(): void {
    window.clearTimeout(draftTimer);
    saveDrafts(browser, store.get().drafts);
  }

  /* ---------- Actions ---------- */

  async function finishSession(button: HTMLElement): Promise<void> {
    const s = store.get();
    const lesson = getLesson(s.lesson);
    if (!lesson) return;
    const draft = current(s);
    if (!draft.rating) {
      toast('Choose a clarity rating from 1 to 5 first.');
      focus('[data-key="rf-1"]');
      return;
    }
    const storage = requireAdapter();
    if (!storage) return;

    const noteText = draft.note.trim().slice(0, LIMITS.note);
    const wantsNote = Boolean(noteText && draft.addToNotebook);
    const runId = draft.pendingRunId ?? newId();
    const noteId = wantsNote ? (draft.pendingNoteId ?? newId()) : null;
    updateDraft(lesson.id, () => ({ pendingRunId: runId, pendingNoteId: noteId }));
    flushDrafts();

    const now = new Date().toISOString();
    const rating: Rating = draft.rating;
    const run: SessionRun = {
      id: runId,
      lesson: lesson.id,
      rating,
      minutes: clampInt(draft.minutes, LIMITS.minutesMin, LIMITS.minutesMax, 15),
      note: noteText,
      stepsDone: STEPS.filter((st) => draft.done[st.id] || st.id === 'reflect').length,
      quiz: draft.quizBest,
      at: now,
    };
    const note: SoundNote | null =
      wantsNote && noteId
        ? {
            id: noteId,
            sound: lesson.sounds[0] ?? 'other',
            example: '',
            text: noteText,
            createdAt: now,
            lesson: lesson.id,
            checks: [{ at: now, rating, comment: '' }],
          }
        : null;

    if (button instanceof HTMLButtonElement) button.disabled = true;
    // Stay on this lesson after saving, so the result banner is shown here instead of the app
    // jumping straight to the next suggested lesson.
    store.set({ lessonPinned: true });
    try {
      await storage.saveSession(run, note);
    } catch (error) {
      if (button instanceof HTMLButtonElement) button.disabled = false;
      toast(describeStorageError(error));
      return;
    }
    store.set((st) => ({
      drafts: { ...st.drafts, [lesson.id]: emptyDraft() },
      justFinished: { lesson: lesson.id, rating },
      quiz: null,
    }));
    flushDrafts();
    toast('Session saved');
    const banner = document.querySelector<HTMLElement>('#steps .banner');
    banner?.scrollIntoView?.({ block: 'start', behavior: scrollBehavior() });
    focus('#steps .banner button');
  }

  /**
   * Plays the hidden answer of the current ear-test round. For a minimal pair, both words come
   * from the same source and speaker, so the voice itself never gives the answer away.
   */
  function speakQuizRound(): void {
    const round = store.get().quiz?.current ?? null;
    const text = roundSpeech(round);
    if (!text) return;
    const source = round?.type === 'pairs' ? audio.sourceFor(round.pair) : undefined;
    audio.say(text, { rate: 0.8, source });
  }

  function openCheckIn(id: string | null): void {
    store.set((s) => ({
      notebook: {
        ...s.notebook,
        filter: 'all',
        checkInFor: id,
        checkInRating: null,
        checkInComment: '',
        confirmDelete: null,
      },
    }));
    const card = document.querySelector<HTMLElement>(`[data-note="${id}"]`);
    card?.scrollIntoView?.({ block: 'nearest', behavior: scrollBehavior() });
    focus('[data-key="ck-1"]');
  }

  const actions: Record<string, (el: HTMLElement) => void | Promise<void>> = {
    'pick-lesson': (el) => {
      if (!selectLesson(el.dataset.lesson)) return;
      const head = document.getElementById('lesson-head');
      if (head && head.getBoundingClientRect().top < 0) {
        head.scrollIntoView?.({ block: 'start', behavior: scrollBehavior() });
      }
      focus('#lesson-head .lh-title');
    },
    'go-lesson': (el) => {
      if (!selectLesson(el.dataset.lesson)) return;
      showView('practice');
      window.scrollTo?.({ top: 0, behavior: scrollBehavior() });
      focus('#lesson-head .lh-title');
    },
    'open-sound': (el) => {
      const key = el.dataset.sound;
      if (!isSoundKey(key)) return;
      audio.stop();
      store.set({ sound: key });
      const detail = document.getElementById('sound-detail');
      if (detail && window.matchMedia?.('(max-width: 899px)').matches) {
        detail.scrollIntoView?.({ block: 'start', behavior: scrollBehavior() });
      }
      focus('#sound-detail-title');
    },
    'close-sound': () => {
      const key = store.get().sound;
      store.set({ sound: null });
      focus(`[data-key="tile-${key}"]`);
    },
    'note-sound': (el) => {
      const key = el.dataset.sound;
      showView('notebook');
      const select = document.getElementById('nf-sound');
      if (select instanceof HTMLSelectElement && isSoundKey(key)) select.value = key;
      window.scrollTo?.({ top: 0, behavior: scrollBehavior() });
      focus('#nf-example');
    },
    'go-checkin': (el) => {
      showView('notebook');
      openCheckIn(el.dataset.id ?? null);
    },
    'step-done': (el) => {
      const step = el.dataset.step as StepId;
      audio.stop();
      updateDraft(store.get().lesson, (d) => ({ done: { ...d.done, [step]: true } }));
      const summary = document.querySelector<HTMLElement>('#steps details[open] > summary');
      summary?.focus({ preventScroll: true });
      summary?.parentElement?.scrollIntoView?.({ block: 'nearest', behavior: scrollBehavior() });
    },
    'step-undo': (el) => {
      const step = el.dataset.step as StepId;
      updateDraft(store.get().lesson, (d) => {
        const done = { ...d.done };
        delete done[step];
        return { done };
      });
      focus(`[data-key="sum-${step}"]`);
    },
    'reset-steps': () => {
      const id = store.get().lesson;
      store.set((s) => ({ drafts: { ...s.drafts, [id]: emptyDraft() }, quiz: null }));
      toast(`Ticks cleared for ${getLesson(id)?.title ?? 'this lesson'}`);
    },
    'dismiss-done': () => store.set({ justFinished: null }),
    'q-start': () => {
      const lesson = getLesson(store.get().lesson);
      const spec = lesson ? resolveQuiz(lesson) : null;
      if (!lesson || !spec) return;
      store.set({ quiz: startQuiz(lesson.id, spec) });
      speakQuizRound();
      focus('#quiz .q-opt');
    },
    'q-replay': () => speakQuizRound(),
    'q-pick': (el) => {
      const quiz = store.get().quiz;
      if (!quiz) return;
      store.set({ quiz: answerRound(quiz, el.dataset.v ?? '') });
      announce(quizAnnouncement(store.get()));
      focus('[data-key="q-next"]');
    },
    'q-next': () => {
      const quiz = store.get().quiz;
      if (!quiz) return;
      const next = nextRound(quiz);
      store.set({ quiz: next });
      if (next.done) {
        updateDraft(next.lesson, (d) => ({ quizBest: Math.max(d.quizBest ?? 0, next.score) }));
        announce(`Ear test finished. You scored ${next.score} of ${next.total}.`);
        focus('[data-key="q-start"]');
      } else {
        speakQuizRound();
        focus('#quiz .q-opt');
      }
    },
    'rep-plus': (el) => changeReps(Number(el.dataset.level), 1),
    'rep-minus': (el) => changeReps(Number(el.dataset.level), -1),
    'play-script': (el) => {
      const lesson = getLesson(store.get().lesson);
      if (!lesson) return;
      audio.stop();
      speech.playSequence(
        lesson.shadow.lines.map(toSpeech),
        Number(el.dataset.rate) || 0.8,
        highlightLine,
      );
    },
    'stop-audio': () => {
      audio.stop();
      highlightLine(-1);
    },
    'rf-rate': (el) => {
      const v = Number(el.dataset.v) as Rating;
      updateDraft(store.get().lesson, () => ({ rating: v }));
    },
    finish: (el) => guarded('finish', () => finishSession(el)),
    'nf-rate': (el) => {
      const v = Number(el.dataset.v) as Rating;
      store.set((s) => ({ notebook: { ...s.notebook, formRating: v } }));
    },
    'nb-filter': (el) => {
      const filter = (el.dataset.f ?? 'all') as AppState['notebook']['filter'];
      store.set((s) => ({ notebook: { ...s.notebook, filter } }));
    },
    'ck-open': (el) => openCheckIn(el.dataset.id ?? null),
    'ck-rate': (el) => {
      const v = Number(el.dataset.v) as Rating;
      store.set((s) => ({ notebook: { ...s.notebook, checkInRating: v } }));
    },
    'ck-cancel': () => {
      const id = store.get().notebook.checkInFor;
      store.set((s) => ({ notebook: { ...s.notebook, checkInFor: null } }));
      focus(`[data-key="ck-open-${id}"]`);
    },
    'ck-save': (el) =>
      guarded('ck-save', async () => {
        const s = store.get();
        const note = s.notes.find((n) => n.id === el.dataset.id);
        const rating = s.notebook.checkInRating;
        const storage = requireAdapter();
        if (!note || !rating || !storage) return;
        const checks = [
          ...note.checks,
          {
            at: new Date().toISOString(),
            rating,
            comment: s.notebook.checkInComment.trim().slice(0, LIMITS.comment),
          },
        ].slice(-LIMITS.checksPerNote);
        try {
          await storage.updateNoteChecks(note.id, checks);
          store.set((st) => ({
            notebook: { ...st.notebook, checkInFor: null, checkInComment: '' },
          }));
          toast('Check-in saved');
          focus(`[data-key="ck-open-${note.id}"]`);
        } catch (error) {
          toast(describeStorageError(error));
        }
      }),
    'nb-del': (el) => {
      const id = el.dataset.id ?? null;
      store.set((s) => ({ notebook: { ...s.notebook, confirmDelete: id, checkInFor: null } }));
      focus(`[data-key="nb-del-no-${id}"]`);
    },
    'nb-del-no': () => {
      const id = store.get().notebook.confirmDelete;
      store.set((s) => ({ notebook: { ...s.notebook, confirmDelete: null } }));
      focus(`[data-key="nb-del-${id}"]`);
    },
    'nb-del-yes': (el) =>
      guarded('nb-del', async () => {
        const storage = requireAdapter();
        const id = el.dataset.id;
        if (!storage || !id) return;
        try {
          await storage.removeNote(id);
          store.set((s) => ({ notebook: { ...s.notebook, confirmDelete: null } }));
          toast('Note deleted');
          focus('#nf-sound');
        } catch (error) {
          toast(describeStorageError(error));
        }
      }),
    'run-del': (el) => {
      const id = el.dataset.id ?? null;
      store.set({ history: { confirmDelete: id } });
      focus(`[data-key="run-del-no-${id}"]`);
    },
    'run-del-no': () => {
      const id = store.get().history.confirmDelete;
      store.set({ history: { confirmDelete: null } });
      focus(`[data-key="run-del-${id}"]`);
    },
    'run-del-yes': (el) =>
      guarded('run-del', async () => {
        const storage = requireAdapter();
        const id = el.dataset.id;
        if (!storage || !id) return;
        try {
          await storage.removeRun(id);
          store.set({ history: { confirmDelete: null } });
          toast('Session deleted');
        } catch (error) {
          toast(describeStorageError(error));
        }
      }),
    export: () => {
      const s = store.get();
      try {
        downloadText(createBackup({ runs: s.runs, notes: s.notes }), backupFileName());
        toast('Backup exported');
      } catch {
        toast('This browser blocked the download. Try another browser.');
      }
    },
    'import-confirm': () =>
      guarded('import', async () => {
        const preview = store.get().importPreview;
        const storage = requireAdapter();
        if (!preview || !storage) return;
        try {
          const result = await storage.importRecords(preview.data);
          store.set({ importPreview: null });
          toast(
            result.skipped
              ? `Imported ${result.added} records. ${result.skipped} were already here.`
              : `Imported ${result.added} records.`,
          );
        } catch (error) {
          toast(describeStorageError(error));
        }
      }),
    'import-cancel': () => store.set({ importPreview: null }),
  };

  function changeReps(level: number, delta: number): void {
    if (level < 0 || level > 2) return;
    const lesson = store.get().lesson;
    const before = draftFor(store.get().drafts, lesson).reps[level] ?? 0;
    const after = Math.max(0, Math.min(99, before + delta));
    updateDraft(lesson, (d) => {
      const reps: [number, number, number] = [...d.reps];
      reps[level] = after;
      return { reps };
    });
    if (delta > 0 && after === REPS_PER_LEVEL) {
      toast(
        level < 2
          ? `Level ${level + 1} done. Try level ${level + 2}.`
          : 'Full challenge done. Great work.',
      );
    }
  }

  /* ---------- Events ---------- */

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const skip = target.closest('.skip-link');
      if (skip) {
        event.preventDefault();
        document.getElementById('main')?.focus();
        return;
      }

      const sayEl = target.closest<HTMLElement>('[data-say]');
      if (sayEl) {
        event.preventDefault();
        highlightLine(-1);
        document.querySelectorAll('.speaking').forEach((el) => el.classList.remove('speaking'));
        sayEl.classList.add('speaking');
        audio.say(sayEl.dataset.say ?? '', {
          rate: Number(sayEl.dataset.rate) || 0.85,
          onEnd: () => sayEl.classList.remove('speaking'),
        });
        return;
      }

      const actionEl = target.closest<HTMLElement>('[data-action]');
      const handler = actionEl ? actions[actionEl.dataset.action ?? ''] : undefined;
      if (actionEl && handler) {
        event.preventDefault();
        void handler(actionEl);
      }
    },
    { signal },
  );

  document.addEventListener(
    'input',
    (event) => {
      const t = event.target;
      const lesson = store.get().lesson;
      if (t instanceof HTMLTextAreaElement && t.id === 'rf-note') {
        const note = t.value.slice(0, LIMITS.note);
        updateDraft(lesson, () => ({ note }));
      } else if (t instanceof HTMLInputElement && t.id === 'rf-min') {
        const minutes = clampInt(t.value, LIMITS.minutesMin, LIMITS.minutesMax, 15);
        updateDraft(lesson, () => ({ minutes }));
      } else if (t instanceof HTMLInputElement && t.id === 'ck-comment') {
        const comment = t.value;
        store.set((s) => ({ notebook: { ...s.notebook, checkInComment: comment } }));
      }
    },
    { signal },
  );

  let recordingUrl: string | null = null;
  document.addEventListener(
    'change',
    (event) => {
      const t = event.target;
      if (t instanceof HTMLSelectElement && t.id === 'voice-sel') {
        chosenVoice = t.value;
        speech.selectVoice(t.value);
        return;
      }
      if (!(t instanceof HTMLInputElement)) return;
      if (t.id === 'rec-toggle') {
        audio.setRecordings(t.checked);
        announce(
          t.checked ? 'Words play real recordings when available.' : 'Words use the device voice.',
        );
      } else if (t.id === 'rec-file') {
        const file = t.files?.[0];
        const player = document.getElementById('rec-audio');
        if (file && player instanceof HTMLAudioElement) {
          if (recordingUrl) URL.revokeObjectURL(recordingUrl);
          recordingUrl = URL.createObjectURL(file);
          player.src = recordingUrl;
          player.hidden = false;
        }
      } else if (t.id === 'import-file') {
        const file = t.files?.[0];
        t.value = '';
        if (file) void readImport(file);
      } else if (t.dataset.pass != null) {
        const index = Number(t.dataset.pass);
        const checked = t.checked;
        updateDraft(store.get().lesson, (d) => {
          const passes = [...d.passes];
          passes[index] = checked;
          return { passes };
        });
      } else if (t.id === 'rf-add') {
        const addToNotebook = t.checked;
        updateDraft(store.get().lesson, () => ({ addToNotebook }));
      }
    },
    { signal },
  );

  async function readImport(file: File): Promise<void> {
    let text: string;
    try {
      text = await file.text();
    } catch {
      toast('That file couldn’t be read.');
      return;
    }
    const parsed = parseBackup(text);
    if (!parsed.ok) {
      toast(parsed.error);
      return;
    }
    if (!parsed.data.runs.length && !parsed.data.notes.length) {
      toast('That backup has no valid sessions or notes.');
      return;
    }
    store.set({
      importPreview: { fileName: file.name, data: parsed.data, dropped: parsed.dropped },
    });
    focus('[data-key="import-confirm"]');
  }

  const noteForm = document.getElementById('note-form');
  noteForm?.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      void guarded('note-form', async () => {
        const storage = requireAdapter();
        if (!storage) return;
        const sound = (document.getElementById('nf-sound') as HTMLSelectElement | null)?.value;
        const exampleEl = document.getElementById('nf-example') as HTMLInputElement | null;
        const textEl = document.getElementById('nf-text') as HTMLTextAreaElement | null;
        const example = (exampleEl?.value ?? '').trim().slice(0, LIMITS.example);
        const text = (textEl?.value ?? '').trim().slice(0, LIMITS.note);
        if (!example && !text) {
          toast('Add the word where it happens, or a short note about what goes wrong.');
          exampleEl?.focus();
          return;
        }
        const now = new Date().toISOString();
        const lesson = store.get().lesson;
        const note: SoundNote = {
          id: newId(),
          sound: isSoundKey(sound) ? sound : 'other',
          example,
          text,
          createdAt: now,
          lesson: isLessonId(lesson) ? lesson : null,
          checks: [{ at: now, rating: store.get().notebook.formRating, comment: '' }],
        };
        const button = document.getElementById('nf-save') as HTMLButtonElement | null;
        if (button) button.disabled = true;
        try {
          await storage.saveNote(note);
          if (exampleEl) exampleEl.value = '';
          if (textEl) textEl.value = '';
          store.set((s) => ({ notebook: { ...s.notebook, filter: 'all' } }));
          toast('Saved to your notebook');
        } catch (error) {
          toast(describeStorageError(error));
        } finally {
          if (button) button.disabled = false;
        }
      });
    },
    { signal },
  );

  window.addEventListener(
    'hashchange',
    () => {
      const view = parseView(location.hash);
      if (view) store.set({ view });
    },
    { signal },
  );

  let resizeTimer: number | undefined;
  window.addEventListener(
    'resize',
    () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(
        () => store.set((s) => ({ layoutTick: s.layoutTick + 1 })),
        150,
      );
    },
    { signal },
  );
  window.addEventListener('pagehide', flushDrafts, { signal });

  /* ---------- Boot ---------- */

  // The lesson path is a collapsible drawer on small screens and always open beside the lesson
  // on wide ones. A closed <details> can't be opened from CSS, so keep it in sync here.
  const pathToggle = document.getElementById('path-toggle');
  const widePath = window.matchMedia?.('(min-width: 1140px)');
  if (pathToggle instanceof HTMLDetailsElement && widePath) {
    const syncPath = () => {
      if (widePath.matches) pathToggle.open = true;
    };
    syncPath();
    widePath.addEventListener?.('change', syncPath, { signal });
  }

  const soundSelect = document.getElementById('nf-sound');
  if (soundSelect) {
    const first: SoundKey = getLesson(store.get().lesson)?.sounds[0] ?? 'th-voiceless';
    mount(soundSelect, soundOptionsView(first));
  }

  store.subscribe((s) => render(s));
  render(store.get());
  speech.init();
  const audioReady = audio.load();

  const ready = createStorage().then((storage) => {
    if (signal.aborted) return;
    adapter = storage;
    store.set((s) => ({ storage: { ...s.storage, mode: storage.mode } }));
    unsubscribeStorage = storage.subscribe(applyData, (status) =>
      store.set({ storage: { mode: storage.mode, phase: status.phase, notice: status.notice } }),
    );
  });

  return {
    store,
    ready,
    audioReady,
    destroy() {
      controller.abort();
      unsubscribeStorage?.();
      audio.stop();
      flushDrafts();
    },
  };
}
