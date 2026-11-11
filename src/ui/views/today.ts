/** The Today view: what to practice next, this week's plan, and what to review. */
import {
  BRIDGE_ID,
  getLesson,
  LESSONS_PER_WEEK,
  lessonNumber,
  SOUNDS,
  soundByKey,
  STEPS,
  TOTAL_LESSONS,
  unitOf,
  UNITS,
} from '../../content/course';
import type { Lesson } from '../../content/types';
import {
  isNoteDue,
  latestCheckIn,
  lessonStatus,
  lessonsToRepeat,
  passedCount,
  runsThisWeek,
  sortNotesNewestFirst,
  suggestedLesson,
  totalMinutes,
  weeklyPlan,
  weeklyStreak,
} from '../../domain/progress';
import type { AppState } from '../../state/app-state';
import { draftFor } from '../../state/drafts';
import { formatDate, plural } from '../format';
import { html, type SafeHtml } from '../html';
import { ICONS } from '../icons';
import { soundFigure } from '../illustrations';
import { symbolChips } from './lesson';

function stepsDone(s: AppState, lesson: Lesson): number {
  const draft = draftFor(s.drafts, lesson.id);
  return STEPS.filter((st) => draft.done[st.id]).length;
}

function heroView(s: AppState): SafeHtml {
  const suggested = suggestedLesson(s.runs);
  const lesson = getLesson(suggested);
  if (!lesson || suggested === BRIDGE_ID) {
    return html`<section class="hero" aria-labelledby="hero-title">
      <span class="eyebrow">Path complete</span>
      <h2 id="hero-title">You passed all ${TOTAL_LESSONS} lessons</h2>
      <p>
        Business English is next. Until it arrives, repeat your weakest lessons and keep your
        notebook check-ins going.
      </p>
      <div class="row">
        <button type="button" class="btn primary" data-action="go-lesson" data-lesson="${BRIDGE_ID}">
          See what’s next
        </button>
      </div>
    </section>`;
  }
  const done = stepsDone(s, lesson);
  const unit = unitOf(lesson.id);
  const first = lesson.sounds[0];
  return html`<section class="hero has-figure" aria-labelledby="hero-title">
    ${first ? html`<figure class="hero-figure">${soundFigure(first)}</figure>` : ''}
    <div class="hero-top">
      <div class="grow">
        <span class="eyebrow"
          >Up next · Lesson ${lessonNumber(lesson.id)} of ${TOTAL_LESSONS} · ${unit?.name ?? ''}</span
        >
        <h2 id="hero-title">${lesson.title}</h2>
      </div>
      ${symbolChips(lesson, 4)}
    </div>
    <p class="hero-goal">${lesson.goal}</p>
    <div class="row">
      <button
        type="button"
        class="btn primary"
        data-action="go-lesson"
        data-lesson="${lesson.id}"
        data-key="hero-start"
      >
        ${done ? `Continue lesson (${done} of ${STEPS.length} steps done)` : 'Start lesson'}
        ${ICONS.arrow}
      </button>
      <span class="small muted">About 15 minutes</span>
    </div>
  </section>`;
}

function weekView(s: AppState): SafeHtml {
  const plan = weeklyPlan(s.runs);
  const thisWeek = runsThisWeek(s.runs);
  const streak = weeklyStreak(s.runs);
  return html`<section class="card t-week" aria-labelledby="week-title">
    <h2 class="card-title" id="week-title">This week</h2>
    <p class="small muted">
      Aim for ${LESSONS_PER_WEEK} lessons a week, a few short sessions each. Pass a lesson by rating
      it 3 or higher.
    </p>
    <ol class="plan">
      ${plan.map(({ lesson: id, done }) => {
        const lesson = getLesson(id);
        if (!lesson) return '';
        return html`<li class="${done ? 'done' : ''}">
          <span class="plan-mark" aria-hidden="true">${done ? ICONS.check : ''}</span>
          <button type="button" class="link-btn" data-action="go-lesson" data-lesson="${id}">
            ${lesson.title}
          </button>
          <span class="sr-only">${done ? '(done)' : '(to do)'}</span>
        </li>`;
      })}
    </ol>
    <div class="mini-stats">
      <div>
        <b>${thisWeek.length}</b><span>${thisWeek.length === 1 ? 'session' : 'sessions'}</span>
      </div>
      <div><b>${totalMinutes(thisWeek)}</b><span>minutes</span></div>
      <div><b>${streak}</b><span>${streak === 1 ? 'week' : 'weeks'} in a row</span></div>
    </div>
  </section>`;
}

function reviewView(s: AppState): SafeHtml {
  const due = sortNotesNewestFirst(s.notes)
    .filter((n) => isNoteDue(n))
    .slice(0, 3);
  const repeat = lessonsToRepeat(s.runs).slice(0, 3);
  const items: SafeHtml[] = [
    ...due.map((note) => {
      const sound = soundByKey(note.sound);
      const last = latestCheckIn(note);
      return html`<li>
        <span class="sym" aria-hidden="true">${sound.ipa}</span>
        <span class="grow"
          ><b>${sound.name}</b>${note.example ? ` · “${note.example}”` : ''}<br /><span
            class="small muted"
            >Notebook check-in · last ${last?.rating ?? '–'}/5 on ${formatDate(last?.at ?? '')}</span
          ></span
        >
        <button
          type="button"
          class="btn sm"
          data-action="go-checkin"
          data-id="${note.id}"
          data-key="today-ck-${note.id}"
        >
          Check in
        </button>
      </li>`;
    }),
    ...repeat.map((id) => {
      const lesson = getLesson(id);
      if (!lesson) return html``;
      return html`<li>
        <span class="sym" aria-hidden="true">${soundByKey(lesson.sounds[0] ?? 'other').ipa}</span>
        <span class="grow"
          ><b>${lesson.title}</b><br /><span class="small muted"
            >Practiced but not passed yet</span
          ></span
        >
        <button
          type="button"
          class="btn sm"
          data-action="go-lesson"
          data-lesson="${id}"
          data-key="today-rp-${id}"
        >
          Repeat
        </button>
      </li>`;
    }),
  ];
  return html`<section class="card t-review" aria-labelledby="review-title">
    <h2 class="card-title" id="review-title">Review</h2>
    ${
      items.length
        ? html`<ul class="review">${items}</ul>`
        : html`<p class="small muted">
            Nothing to review right now. Sounds you log in the notebook come back here for a
            check-in after a week, and so do lessons you rate below 3.
          </p>`
    }
  </section>`;
}

function pathProgressView(s: AppState): SafeHtml {
  const passed = passedCount(s.runs);
  return html`<section class="card t-path" aria-labelledby="path-title">
    <div class="card-head">
      <h2 class="card-title" id="path-title">Your path</h2>
      <span class="small muted">${passed} of ${TOTAL_LESSONS} lessons passed</span>
    </div>
    <ul class="units">
      ${UNITS.map((unit) => {
        const done = unit.lessons.filter((l) => lessonStatus(s.runs, l.id) === 'passed').length;
        const target =
          unit.lessons.find((l) => lessonStatus(s.runs, l.id) !== 'passed') ?? unit.lessons[0];
        const pct = Math.round((done / unit.lessons.length) * 100);
        return html`<li>
          <button
            type="button"
            class="unit-btn"
            data-action="go-lesson"
            data-lesson="${target?.id ?? ''}"
            data-key="today-unit-${unit.key}"
          >
            <span class="unit-line"
              ><b>${unit.name}</b><span class="small muted">${done}/${unit.lessons.length}</span></span
            >
            <span class="meter thin" aria-hidden="true"><i data-pct="${pct}"></i></span>
            <span class="small muted">${unit.summary}</span>
          </button>
        </li>`;
      })}
    </ul>
  </section>`;
}

function chartTeaserView(): SafeHtml {
  const sample = ['θ', 'ð', 'r', 'l', 'æ', 'ʌ', 'ɝ', 'oʊ', 'aɪ', 'ɾ'];
  const count = SOUNDS.filter((x) => x.kind === 'consonant' || x.kind === 'vowel').length;
  return html`<section class="card teaser t-teaser" aria-labelledby="teaser-title">
    <h2 class="card-title" id="teaser-title">All ${count} sounds of American English</h2>
    <p class="small muted">
      Every consonant and vowel in one chart, with how to make it and real recordings of
      American speakers.
    </p>
    <div class="teaser-syms" aria-hidden="true">
      ${sample.map((sym) => html`<span class="sym">${sym}</span>`)}
    </div>
    <a class="btn sm" href="#sounds">Open the sound chart ${ICONS.arrow}</a>
  </section>`;
}

export function todayView(s: AppState): SafeHtml {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const sessions = s.runs.length;
  return html`<div class="today-head">
      <p class="eyebrow">${date}</p>
      <h1 class="page-title">${sessions ? 'Welcome back' : 'Welcome to General American Studio'}</h1>
      <p class="muted">
        ${sessions ? `${plural(sessions, 'session')} so far. One short lesson today keeps the sounds fresh.` : 'Short lessons, one sound at a time. Start with the first lesson below, or explore the sound chart.'}
      </p>
    </div>
    <div class="today-grid">
      <div class="today-main">${heroView(s)}${reviewView(s)}${pathProgressView(s)}</div>
      <div class="today-side">${weekView(s)}${chartTeaserView()}</div>
    </div>`;
}
