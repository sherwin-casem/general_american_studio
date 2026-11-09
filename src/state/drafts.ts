/**
 * Per-lesson work in progress: ticked steps, twister reps, shadowing passes and the unsaved rating.
 * Kept in this browser only; a draft becomes a SessionRun when the session is finished.
 */
import {
  lessonIdFrom,
  QUIZ_ROUNDS,
  SESSION_MINUTES,
  SHADOW_PASSES,
  STEPS,
} from '../content/course';
import type { StepId } from '../content/types';
import { clampInt, isRating, isValidId, LIMITS } from '../domain/validation';
import type { Rating } from '../storage/types';

export const DRAFT_KEYS = { drafts: 'gas:v2:drafts', legacy: 'gas.draft.v1' } as const;

export interface LessonDraft {
  done: Partial<Record<StepId, true>>;
  reps: [number, number, number];
  passes: boolean[];
  rating: Rating | null;
  note: string;
  addToNotebook: boolean;
  minutes: number;
  quizBest: number | null;
  /** Ids reserved by a save attempt, reused on retry so a retried save never duplicates. */
  pendingRunId: string | null;
  pendingNoteId: string | null;
}

/** Keyed by lesson id. Versions 1 and 2 keyed drafts by week number; loading migrates them. */
export type Drafts = Record<string, LessonDraft>;

export function emptyDraft(): LessonDraft {
  return {
    done: {},
    reps: [0, 0, 0],
    passes: SHADOW_PASSES.map(() => false),
    rating: null,
    note: '',
    addToNotebook: true,
    minutes: SESSION_MINUTES,
    quizBest: null,
    pendingRunId: null,
    pendingNoteId: null,
  };
}

const STEP_IDS = new Set<string>(STEPS.map((s) => s.id));

function sanitizeDraft(raw: unknown): LessonDraft {
  const d = emptyDraft();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;

  if (typeof r.done === 'object' && r.done !== null) {
    for (const [key, value] of Object.entries(r.done)) {
      if (value && STEP_IDS.has(key)) d.done[key as StepId] = true;
    }
  }
  if (Array.isArray(r.reps)) {
    const reps: unknown[] = r.reps;
    d.reps = [
      clampInt(reps[0], 0, 99, 0),
      clampInt(reps[1], 0, 99, 0),
      clampInt(reps[2], 0, 99, 0),
    ];
  }
  // Version 1 stored passes as an object keyed by index; version 2 as an array.
  if (typeof r.passes === 'object' && r.passes !== null) {
    const passes = r.passes as Record<string, unknown>;
    d.passes = d.passes.map((_, i) => Boolean(passes[i]));
  }
  if (isRating(r.rating)) d.rating = r.rating;
  if (typeof r.note === 'string') d.note = r.note.slice(0, LIMITS.note);
  const addToNotebook = r.addToNotebook ?? r.addNote;
  if (typeof addToNotebook === 'boolean') d.addToNotebook = addToNotebook;
  d.minutes = clampInt(r.minutes, LIMITS.minutesMin, LIMITS.minutesMax, SESSION_MINUTES);
  d.quizBest = r.quizBest == null ? null : clampInt(r.quizBest, 0, QUIZ_ROUNDS, 0);
  d.pendingRunId = isValidId(r.pendingRunId) ? r.pendingRunId : null;
  d.pendingNoteId = isValidId(r.pendingNoteId) ? r.pendingNoteId : null;
  return d;
}

function sanitizeDrafts(raw: unknown): Drafts {
  const out: Drafts = {};
  if (typeof raw !== 'object' || raw === null) return out;
  for (const [key, value] of Object.entries(raw)) {
    const lesson = lessonIdFrom(key);
    if (lesson) out[lesson] = sanitizeDraft(value);
  }
  return out;
}

export function loadDrafts(storage: Storage | null): Drafts {
  if (!storage) return {};
  try {
    const current = storage.getItem(DRAFT_KEYS.drafts);
    if (current != null) return sanitizeDrafts(JSON.parse(current));
    const legacy = storage.getItem(DRAFT_KEYS.legacy);
    if (legacy != null) {
      const parsed = JSON.parse(legacy) as { weeks?: unknown };
      const drafts = sanitizeDrafts(parsed.weeks);
      if (saveDrafts(storage, drafts)) storage.removeItem(DRAFT_KEYS.legacy);
      return drafts;
    }
  } catch {
    /* unreadable drafts are not worth blocking the app for */
  }
  return {};
}

export function saveDrafts(storage: Storage | null, drafts: Drafts): boolean {
  if (!storage) return false;
  try {
    storage.setItem(DRAFT_KEYS.drafts, JSON.stringify(drafts));
    return true;
  } catch {
    return false;
  }
}

export function draftFor(drafts: Drafts, lesson: string): LessonDraft {
  return drafts[lesson] ?? emptyDraft();
}

/** Stable key of which steps are done, for change detection. */
export function doneKey(draft: LessonDraft): string {
  return STEPS.map((s) => (draft.done[s.id] ? '1' : '0')).join('');
}
