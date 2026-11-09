import type { SessionRun, SoundNote } from '../src/storage/types';

export function makeRun(overrides: Partial<SessionRun> = {}): SessionRun {
  return {
    id: 'run-1',
    lesson: 'th',
    rating: 3,
    minutes: 15,
    note: '',
    stepsDone: 6,
    quiz: null,
    at: '2026-11-02T10:00:00.000Z',
    ...overrides,
  };
}

export function makeNote(overrides: Partial<SoundNote> = {}): SoundNote {
  return {
    id: 'note-1',
    sound: 'th-voiceless',
    example: 'three',
    text: 'Sounds like tree',
    createdAt: '2026-11-01T10:00:00.000Z',
    lesson: 'th',
    checks: [{ at: '2026-11-01T10:00:00.000Z', rating: 2, comment: '' }],
    ...overrides,
  };
}

/** Lets pending promises and zero-delay timers run. */
export const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
