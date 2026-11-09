/**
 * Validation for everything read from storage, backups or the network.
 * Stored data is treated as untrusted: invalid records are dropped, out-of-range values clamped.
 */
import { isSoundKey, lessonIdFrom, QUIZ_ROUNDS, STEPS } from '../content/course';
import type { CheckIn, DataSnapshot, Rating, SessionRun, SoundNote } from '../storage/types';

export const LIMITS = {
  note: 600,
  example: 80,
  comment: 200,
  minutesMin: 1,
  minutesMax: 240,
  checksPerNote: 200,
} as const;

const ID_PATTERN = /^[A-Za-z0-9_\-.~:@+]{1,200}$/;

type Obj = Record<string, unknown>;
const isObject = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

export function isRating(v: unknown): v is Rating {
  return v === 1 || v === 2 || v === 3 || v === 4 || v === 5;
}

export function isValidId(v: unknown): v is string {
  return typeof v === 'string' && ID_PATTERN.test(v);
}

function toIsoDate(v: unknown): string | null {
  if (typeof v !== 'string' || v.length > 40) return null;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

function text(v: unknown, max: number): string {
  return typeof v === 'string' ? v.slice(0, max) : '';
}

export function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function sanitizeRun(raw: unknown, fallbackId?: string): SessionRun | null {
  if (!isObject(raw)) return null;
  const id = isValidId(raw.id) ? raw.id : fallbackId;
  if (!id || !isValidId(id)) return null;
  // Versions 1 and 2 stored a week number; current records store a lesson id.
  const lesson = lessonIdFrom(raw.lesson ?? raw.week);
  if (!lesson) return null;
  if (!isRating(raw.rating)) return null;
  const at = toIsoDate(raw.at);
  if (!at) return null;
  return {
    id,
    lesson,
    rating: raw.rating,
    minutes: clampInt(raw.minutes, LIMITS.minutesMin, LIMITS.minutesMax, 15),
    note: text(raw.note, LIMITS.note),
    stepsDone: clampInt(raw.stepsDone, 0, STEPS.length, 0),
    quiz: raw.quiz == null ? null : clampInt(raw.quiz, 0, QUIZ_ROUNDS, 0),
    at,
  };
}

export function sanitizeCheckIn(raw: unknown): CheckIn | null {
  if (!isObject(raw) || !isRating(raw.rating)) return null;
  const at = toIsoDate(raw.at);
  if (!at) return null;
  return { at, rating: raw.rating, comment: text(raw.comment, LIMITS.comment) };
}

export function sanitizeNote(raw: unknown, fallbackId?: string): SoundNote | null {
  if (!isObject(raw)) return null;
  const id = isValidId(raw.id) ? raw.id : fallbackId;
  if (!id || !isValidId(id)) return null;
  const checks = (Array.isArray(raw.checks) ? raw.checks : [])
    .map(sanitizeCheckIn)
    .filter((c): c is CheckIn => c !== null)
    .sort((a, b) => a.at.localeCompare(b.at))
    .slice(-LIMITS.checksPerNote);
  const createdAt = toIsoDate(raw.createdAt) ?? checks[0]?.at ?? null;
  if (!createdAt || !checks.length) return null;
  return {
    id,
    sound: isSoundKey(raw.sound) ? raw.sound : 'other',
    example: text(raw.example, LIMITS.example),
    text: text(raw.text, LIMITS.note),
    createdAt,
    lesson: lessonIdFrom(raw.lesson ?? raw.week),
    checks,
  };
}

/** Validates a `{runs, notes}` object. Returns the valid records and how many were dropped. */
export function sanitizeSnapshot(raw: unknown): { data: DataSnapshot; dropped: number } {
  if (!isObject(raw)) return { data: { runs: [], notes: [] }, dropped: 0 };
  const rawRuns = Array.isArray(raw.runs) ? raw.runs : [];
  const rawNotes = Array.isArray(raw.notes) ? raw.notes : [];
  const runs = dedupe(rawRuns.map((r) => sanitizeRun(r)).filter((r): r is SessionRun => !!r));
  const notes = dedupe(rawNotes.map((n) => sanitizeNote(n)).filter((n): n is SoundNote => !!n));
  return {
    data: { runs, notes },
    dropped: rawRuns.length - runs.length + (rawNotes.length - notes.length),
  };
}

function dedupe<T extends { id: string }>(items: T[]): T[] {
  const byId = new Map<string, T>();
  for (const item of items) byId.set(item.id, item);
  return [...byId.values()];
}
