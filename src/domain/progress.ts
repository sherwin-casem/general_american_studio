/** Pure progress rules. No DOM, no storage: easy to test. */
import {
  BRIDGE_ID,
  CHECK_IN_DAYS,
  LESSONS,
  lessonsForSound,
  LESSONS_PER_WEEK,
  PASS_RATING,
} from '../content/course';
import type { SoundKey } from '../content/types';
import type { CheckIn, SessionRun, SoundNote } from '../storage/types';

export type LessonStatus = 'new' | 'practiced' | 'passed';
export type NoteLevel = 1 | 2 | 3;

export const NOTE_LEVEL_NAMES: Record<NoteLevel, string> = {
  1: 'Working on it',
  2: 'Improving',
  3: 'Comfortable',
};

export const LESSON_STATUS_NAMES: Record<LessonStatus, string> = {
  new: 'Not started',
  practiced: 'Practiced, repeat suggested',
  passed: 'Passed',
};

const DAY_MS = 86_400_000;

export function runsForLesson(runs: readonly SessionRun[], lessonId: string): SessionRun[] {
  return runs.filter((r) => r.lesson === lessonId);
}

export function sortRunsOldestFirst(runs: readonly SessionRun[]): SessionRun[] {
  return [...runs].sort((a, b) => a.at.localeCompare(b.at));
}

export function lessonStatus(runs: readonly SessionRun[], lessonId: string): LessonStatus {
  const forLesson = runsForLesson(runs, lessonId);
  if (!forLesson.length) return 'new';
  return forLesson.some((r) => r.rating >= PASS_RATING) ? 'passed' : 'practiced';
}

export function bestRating(runs: readonly SessionRun[], lessonId: string): number | null {
  const forLesson = runsForLesson(runs, lessonId);
  return forLesson.length ? Math.max(...forLesson.map((r) => r.rating)) : null;
}

/** The first lesson on the path not passed yet, or the Business English bridge when all are. */
export function suggestedLesson(runs: readonly SessionRun[]): string {
  for (const lesson of LESSONS) if (lessonStatus(runs, lesson.id) !== 'passed') return lesson.id;
  return BRIDGE_ID;
}

export function passedCount(runs: readonly SessionRun[]): number {
  return LESSONS.filter((l) => lessonStatus(runs, l.id) === 'passed').length;
}

export function totalMinutes(runs: readonly SessionRun[]): number {
  return runs.reduce((sum, r) => sum + r.minutes, 0);
}

/** The practiced lesson whose most recent session has the lowest rating. */
export function weakestLesson(
  runs: readonly SessionRun[],
): { lesson: string; rating: number } | null {
  let weakest: { lesson: string; rating: number } | null = null;
  for (const l of LESSONS) {
    const last = sortRunsOldestFirst(runsForLesson(runs, l.id)).pop();
    if (last && (!weakest || last.rating < weakest.rating)) {
      weakest = { lesson: l.id, rating: last.rating };
    }
  }
  return weakest;
}

/** Local-time key of the Monday that starts the week containing `date`. */
export function weekStartKey(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * Calendar weeks in a row with at least one session. The current week counts if practiced;
 * if not, the streak is still alive when last week was practiced.
 */
export function weeklyStreak(runs: readonly SessionRun[], now = new Date()): number {
  const weeks = new Set(runs.map((r) => weekStartKey(new Date(r.at))));
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!weeks.has(weekStartKey(cursor))) cursor.setDate(cursor.getDate() - 7);
  let streak = 0;
  while (weeks.has(weekStartKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

/** Sessions saved in the current calendar week (Monday to Sunday, local time). */
export function runsThisWeek(runs: readonly SessionRun[], now = new Date()): SessionRun[] {
  const key = weekStartKey(now);
  return runs.filter((r) => weekStartKey(new Date(r.at)) === key);
}

/**
 * This week's plan: lessons passed this week count as done, then the next lessons on the path
 * fill the plan up to LESSONS_PER_WEEK.
 */
export function weeklyPlan(
  runs: readonly SessionRun[],
  now = new Date(),
): { lesson: string; done: boolean }[] {
  const thisWeek = runsThisWeek(runs, now);
  const doneIds = LESSONS.filter((l) =>
    thisWeek.some((r) => r.lesson === l.id && r.rating >= PASS_RATING),
  ).map((l) => l.id);
  const plan = doneIds.slice(0, LESSONS_PER_WEEK).map((lesson) => ({ lesson, done: true }));
  for (const l of LESSONS) {
    if (plan.length >= LESSONS_PER_WEEK) break;
    if (doneIds.includes(l.id) || lessonStatus(runs, l.id) === 'passed') continue;
    plan.push({ lesson: l.id, done: false });
  }
  return plan;
}

export function latestCheckIn(note: SoundNote): CheckIn | null {
  return note.checks[note.checks.length - 1] ?? null;
}

export function noteLevel(note: SoundNote): NoteLevel {
  const rating = latestCheckIn(note)?.rating ?? 1;
  if (rating <= 2) return 1;
  return rating === 3 ? 2 : 3;
}

/** Due when not yet fully clear and the last check-in is at least CHECK_IN_DAYS old. */
export function isNoteDue(note: SoundNote, now = new Date()): boolean {
  const last = latestCheckIn(note);
  if (!last || last.rating >= 5) return false;
  return (now.getTime() - new Date(last.at).getTime()) / DAY_MS >= CHECK_IN_DAYS;
}

export function sortNotesNewestFirst(notes: readonly SoundNote[]): SoundNote[] {
  return [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface SoundProgress {
  /** Status of the first lesson that teaches the sound. */
  status: LessonStatus;
  /** Lowest notebook level among notes for this sound, or null without notes. */
  noteLevel: NoteLevel | null;
}

export function soundProgress(
  key: SoundKey,
  runs: readonly SessionRun[],
  notes: readonly SoundNote[],
): SoundProgress {
  const lessons = lessonsForSound(key);
  const statuses = lessons.map((l) => lessonStatus(runs, l.id));
  const status: LessonStatus = statuses.includes('passed')
    ? 'passed'
    : statuses.includes('practiced')
      ? 'practiced'
      : 'new';
  const levels = notes.filter((n) => n.sound === key).map(noteLevel);
  return { status, noteLevel: levels.length ? (Math.min(...levels) as NoteLevel) : null };
}

/** Lessons practiced but not passed yet, most recently practiced first. */
export function lessonsToRepeat(runs: readonly SessionRun[]): string[] {
  const latest = new Map<string, string>();
  for (const r of runs) {
    const at = latest.get(r.lesson);
    if (!at || r.at > at) latest.set(r.lesson, r.at);
  }
  return [...latest.entries()]
    .filter(([lesson]) => lessonStatus(runs, lesson) === 'practiced')
    .sort((a, b) => b[1].localeCompare(a[1]))
    .map(([lesson]) => lesson);
}
