/** Per-browser preferences: the selected lesson, the chosen voice and the audio source. */
import { BRIDGE_ID, lessonIdFrom } from '../content/course';
import { MOTION_PREFERENCES, type MotionPreference } from './app-state';

export const PREF_KEYS = {
  prefs: 'gas:v2:prefs',
  legacyWeek: 'gas.week',
  legacyVoice: 'gas.voice',
} as const;

export interface Prefs {
  /** Lesson the person picked, or null to follow the suggested lesson. */
  lesson: string | null;
  /** A voice the person chose for sentences, or null for the best available. */
  voice: string | null;
  /** Play real recordings of single words when available (default), or always the device voice. */
  recordings: boolean;
  /** Animations: follow the system setting (default), or always on or off. */
  motion: MotionPreference;
}

const DEFAULT_PREFS: Prefs = { lesson: null, voice: null, recordings: true, motion: 'system' };

const validMotion = (v: unknown): MotionPreference =>
  MOTION_PREFERENCES.includes(v as MotionPreference) ? (v as MotionPreference) : 'system';

/** A lesson id, or a version 1 or 2 week number (13 was the Business English card). */
function validLesson(v: unknown): string | null {
  if (v === BRIDGE_ID || v === 13 || v === '13') return BRIDGE_ID;
  return lessonIdFrom(v);
}

function parseJson(text: string | null): unknown {
  if (text == null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function loadPrefs(storage: Storage | null): Prefs {
  if (!storage) return { ...DEFAULT_PREFS };
  try {
    const stored = parseJson(storage.getItem(PREF_KEYS.prefs)) as Record<string, unknown> | null;
    if (stored && typeof stored === 'object') {
      return {
        lesson: validLesson(stored.lesson ?? stored.week),
        voice: typeof stored.voice === 'string' ? stored.voice.slice(0, 300) : null,
        recordings: stored.recordings !== false,
        motion: validMotion(stored.motion),
      };
    }
    const legacyVoice = parseJson(storage.getItem(PREF_KEYS.legacyVoice));
    return {
      ...DEFAULT_PREFS,
      lesson: validLesson(parseJson(storage.getItem(PREF_KEYS.legacyWeek))),
      voice: typeof legacyVoice === 'string' ? legacyVoice.slice(0, 300) : null,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(storage: Storage | null, prefs: Prefs): void {
  if (!storage) return;
  try {
    storage.setItem(PREF_KEYS.prefs, JSON.stringify(prefs));
  } catch {
    /* preferences are a convenience; ignore write failures */
  }
}
