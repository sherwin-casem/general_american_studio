import type { SoundKey } from '../content/types';

export type Rating = 1 | 2 | 3 | 4 | 5;

/**
 * One finished practice session. Versions 1 and 2 stored a week number in `week`; reading
 * migrates it to `lesson` (see sanitizeRun).
 */
export interface SessionRun {
  id: string;
  /** Lesson id. */
  lesson: string;
  rating: Rating;
  minutes: number;
  note: string;
  stepsDone: number;
  /** Best ear-test score for that session, out of QUIZ_ROUNDS, or null. */
  quiz: number | null;
  /** ISO 8601 timestamp. */
  at: string;
}

export interface CheckIn {
  at: string;
  rating: Rating;
  comment: string;
}

export interface SoundNote {
  id: string;
  sound: SoundKey;
  example: string;
  text: string;
  createdAt: string;
  /** Lesson the note was written in, if any. */
  lesson: string | null;
  /** Ratings over time, oldest first. Always at least one. */
  checks: CheckIn[];
}

export interface DataSnapshot {
  runs: SessionRun[];
  notes: SoundNote[];
}

export type StorageMode = 'account' | 'browser' | 'memory';

export interface AdapterStatus {
  phase: 'connecting' | 'ready' | 'stale' | 'error';
  /** Something the person should know, such as recovered data. */
  notice?: string;
}

export interface ImportResult {
  added: number;
  skipped: number;
}

/**
 * Persistence boundary. Each adapter validates what it reads, so the rest of the app only ever
 * sees well-formed records. Writes use client-generated ids, so retrying a failed write is safe.
 */
export interface StorageAdapter {
  readonly mode: StorageMode;
  /** Delivers the current data now (or once loaded) and after every change. */
  subscribe(
    onData: (data: DataSnapshot) => void,
    onStatus: (status: AdapterStatus) => void,
  ): () => void;
  /** Saves a session and, optionally, the notebook note written with it. Idempotent per id. */
  saveSession(run: SessionRun, note: SoundNote | null): Promise<void>;
  /** Creates or replaces a note. */
  saveNote(note: SoundNote): Promise<void>;
  updateNoteChecks(id: string, checks: CheckIn[]): Promise<void>;
  removeRun(id: string): Promise<void>;
  removeNote(id: string): Promise<void>;
  /** Adds records whose ids are not stored yet. Existing records are kept unchanged. */
  importRecords(data: DataSnapshot): Promise<ImportResult>;
}
