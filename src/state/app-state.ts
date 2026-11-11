import type { SoundKey } from '../content/types';
import type { QuizState } from '../domain/quiz';
import type { NoteLevel } from '../domain/progress';
import type { DataSnapshot, Rating, SessionRun, SoundNote, StorageMode } from '../storage/types';
import type { Drafts } from './drafts';

/** Animations: follow the system's reduced-motion setting, or always on or off. */
export type MotionPreference = 'system' | 'on' | 'off';
export const MOTION_PREFERENCES: readonly MotionPreference[] = ['system', 'on', 'off'];

export type View = 'home' | 'today' | 'sounds' | 'practice' | 'notebook' | 'progress';
export const VIEWS: readonly View[] = [
  'home',
  'today',
  'sounds',
  'practice',
  'notebook',
  'progress',
];

export interface StorageStatus {
  mode: StorageMode | null;
  phase: 'connecting' | 'ready' | 'stale' | 'error';
  notice?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
}

export interface SpeechStatus {
  supported: boolean;
  /** True once the browser has reported its voices, or after a short wait. */
  checked: boolean;
  voices: VoiceOption[];
  selected: string | null;
}

export interface AudioStatus {
  /** The learner's choice: real recordings for single words when available. */
  recordings: boolean;
  /** 'loading' until the recordings list is fetched; 'missing' when it could not be. */
  phase: 'loading' | 'ready' | 'missing';
  /** Number of words with a recording. */
  count: number;
}

export interface ImportPreview {
  fileName: string;
  data: DataSnapshot;
  dropped: number;
}

export interface AppState {
  view: View;
  /** Selected lesson id, or BRIDGE_ID for the Business English card. */
  lesson: string;
  /** True once the person picked a lesson; otherwise the app follows the suggested lesson. */
  lessonPinned: boolean;
  /** Sound open in the sound chart's detail panel. */
  sound: SoundKey | null;
  runs: SessionRun[];
  notes: SoundNote[];
  drafts: Drafts;
  storage: StorageStatus;
  speech: SpeechStatus;
  audio: AudioStatus;
  quiz: QuizState | null;
  justFinished: { lesson: string; rating: Rating } | null;
  notebook: {
    filter: 'all' | `${NoteLevel}`;
    formRating: Rating;
    checkInFor: string | null;
    checkInRating: Rating | null;
    checkInComment: string;
    confirmDelete: string | null;
  };
  history: { confirmDelete: string | null };
  importPreview: ImportPreview | null;
  /** Bumped on window resize so the chart re-measures. */
  layoutTick: number;
  motion: MotionPreference;
}

export function initialState(overrides: Partial<AppState> = {}): AppState {
  return {
    view: 'home',
    lesson: 'p-b',
    lessonPinned: false,
    sound: null,
    runs: [],
    notes: [],
    drafts: {},
    storage: { mode: null, phase: 'connecting' },
    speech: { supported: false, checked: false, voices: [], selected: null },
    audio: { recordings: true, phase: 'loading', count: 0 },
    quiz: null,
    justFinished: null,
    notebook: {
      filter: 'all',
      formRating: 2,
      checkInFor: null,
      checkInRating: null,
      checkInComment: '',
      confirmDelete: null,
    },
    history: { confirmDelete: null },
    importPreview: null,
    layoutTick: 0,
    motion: 'system',
    ...overrides,
  };
}
