import { BACK_VOWEL_LESSONS } from './units/back-vowels';
import { FLOW_LESSONS } from './units/flow';
import { FRICATIVE_LESSONS } from './units/fricatives';
import { FRONT_VOWEL_LESSONS } from './units/front-vowels';
import { GLIDE_R_LESSONS } from './units/glides-r';
import { SONORANT_LESSONS } from './units/sonorants';
import { STOP_LESSONS } from './units/stops';
import { STRESS_LESSONS } from './units/stress';
import { soundByKey } from './sounds';
import type {
  DrillRow,
  IpaWord,
  Lesson,
  QuizSpec,
  SoundCard,
  SoundKey,
  StepId,
  Unit,
} from './types';

export {
  CATEGORY_HINTS,
  CATEGORY_LABELS,
  KIND_LABELS,
  SOUNDS,
  isSoundKey,
  soundByKey,
  soundsByCategory,
} from './sounds';

export const APP_ID = 'general-american-studio';

/**
 * The learning path, easiest first: consonants that most learners already half-know, then the
 * harder consonants, the vowels, and finally stress, rhythm and melody.
 */
const ALL_UNITS: Unit[] = [
  {
    key: 'stops',
    name: 'Stops',
    summary: 'P, B, T, D, K and G, and how Americans change T.',
    lessons: STOP_LESSONS,
  },
  {
    key: 'fricatives',
    name: 'Fricatives',
    summary: 'F and V, the two TH sounds, S and Z, SH and ZH, CH and J.',
    lessons: FRICATIVE_LESSONS,
  },
  {
    key: 'sonorants',
    name: 'Nasals, R, L, W, Y and H',
    summary: 'M, N and NG, the American R and L, and the gliding consonants.',
    lessons: SONORANT_LESSONS,
  },
  {
    key: 'front-vowels',
    name: 'Front vowels',
    summary: 'Sheep and ship, day and bed, cat and cup.',
    lessons: FRONT_VOWEL_LESSONS,
  },
  {
    key: 'back-vowels',
    name: 'Central and back vowels',
    summary: 'Schwa, the ER vowel, food and book, home, hot and law.',
    lessons: BACK_VOWEL_LESSONS,
  },
  {
    key: 'glides-r',
    name: 'Gliding vowels and R',
    summary: 'Time, now and boy, and the vowels before R.',
    lessons: GLIDE_R_LESSONS,
  },
  {
    key: 'stress',
    name: 'Word stress',
    summary: 'Which syllable is strong, in short and long words.',
    lessons: STRESS_LESSONS,
  },
  {
    key: 'flow',
    name: 'Rhythm and melody',
    summary: 'Linking, intonation, consonant clusters and shadowing.',
    lessons: FLOW_LESSONS,
  },
];

/** Units that have lessons, in path order. */
export const UNITS: Unit[] = ALL_UNITS.filter((unit) => unit.lessons.length > 0);

/** Every lesson in path order. */
export const LESSONS: Lesson[] = UNITS.flatMap((unit) => unit.lessons);
export const TOTAL_LESSONS = LESSONS.length;

/** Pseudo-lesson shown after the path: the Business English bridge card. */
export const BRIDGE_ID = 'business-english';

/**
 * Version 1 and 2 stored the week number (1 to 12) with sessions, notes and drafts.
 * Never change this table: it is how old data finds its lesson.
 */
export const LEGACY_WEEK_IDS: Readonly<Record<number, string>> = {
  1: 'th',
  2: 'r-l',
  3: 'v-w-b',
  4: 'american-t',
  5: 'i-ih',
  6: 'ae-eh-uh',
  7: 'schwa',
  8: 'stress-two',
  9: 'stress-long',
  10: 'rhythm',
  11: 'intonation',
  12: 'shadowing',
};

/** A session counts as passing once it is rated at least this. */
export const PASS_RATING = 3;
export const REPS_PER_LEVEL = 5;
export const QUIZ_ROUNDS = 8;
/** A notebook sound comes back for a check-in after this many days. */
export const CHECK_IN_DAYS = 7;
/** Lessons suggested per calendar week on the Today page. */
export const LESSONS_PER_WEEK = 2;

export const STEPS: { id: StepId; minutes: number }[] = [
  { id: 'warmup', minutes: 1 },
  { id: 'learn', minutes: 3 },
  { id: 'listen', minutes: 3 },
  { id: 'twister', minutes: 3 },
  { id: 'shadow', minutes: 4 },
  { id: 'reflect', minutes: 1 },
];
export const SESSION_MINUTES = STEPS.reduce((sum, s) => sum + s.minutes, 0);

export const RATING_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'Hard to make',
  2: 'Getting there',
  3: 'OK when slow',
  4: 'Clear most times',
  5: 'Clear at natural speed',
};

export const TWISTER_LEVEL_LABELS = [
  'Level 1 · Slow and clear',
  'Level 2 · Short sentence',
  'Level 3 · Full challenge',
] as const;

export const SHADOW_PASSES: [title: string, detail: string][] = [
  ['Listen only', 'Don’t speak yet. Notice the stress and the melody.'],
  ['Read along', 'Follow the text silently while it plays.'],
  ['Mumble', 'Speak quietly along with it, copying the rhythm.'],
  ['Shadow', 'Speak out loud, about half a second behind the voice.'],
  ['Record and compare', 'Record yourself on your phone, then play it next to the model.'],
];

const LESSON_MAP = new Map(LESSONS.map((lesson) => [lesson.id, lesson]));
const UNIT_OF = new Map(UNITS.flatMap((unit) => unit.lessons.map((l) => [l.id, unit] as const)));

export function getLesson(id: string | null | undefined): Lesson | undefined {
  return id ? LESSON_MAP.get(id) : undefined;
}

export function isLessonId(id: unknown): id is string {
  return typeof id === 'string' && LESSON_MAP.has(id);
}

export function unitOf(lessonId: string): Unit | undefined {
  return UNIT_OF.get(lessonId);
}

/** 1-based position on the path, for "Lesson 7 of 29". */
export function lessonNumber(lessonId: string): number {
  return LESSONS.findIndex((lesson) => lesson.id === lessonId) + 1;
}

export function nextLesson(lessonId: string): Lesson | undefined {
  const i = LESSONS.findIndex((lesson) => lesson.id === lessonId);
  return i >= 0 ? LESSONS[i + 1] : undefined;
}

/** A lesson id from current data, or from a version 1 or 2 week number. */
export function lessonIdFrom(value: unknown): string | null {
  if (isLessonId(value)) return value;
  const week = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  if (typeof week === 'number' && Number.isInteger(week)) return LEGACY_WEEK_IDS[week] ?? null;
  return null;
}

/** Lessons that teach a sound, in path order. */
export function lessonsForSound(key: SoundKey): Lesson[] {
  return LESSONS.filter((lesson) => lesson.sounds.includes(key));
}

/** The card that introduces a sound: the first one on the path. */
export function cardForSound(key: SoundKey): { card: SoundCard; lesson: Lesson } | null {
  for (const lesson of LESSONS) {
    if (lesson.learn.kind !== 'sounds') continue;
    const card = lesson.learn.sounds.find((c) => c.sound === key);
    if (card) return { card, lesson };
  }
  return null;
}

/** Example words for a sound, from its card. */
export function wordsForSound(key: SoundKey): IpaWord[] {
  return cardForSound(key)?.card.words ?? [];
}

export function lessonLabel(lesson: Lesson): string {
  return `Lesson ${lessonNumber(lesson.id)}`;
}

/** IPA symbols of a lesson's sounds, for chips and headings. */
export function lessonSymbols(lesson: Lesson): string[] {
  return lesson.sounds.map((key) => soundByKey(key).ipa);
}

export function stepTitle(lesson: Lesson, id: StepId): string {
  switch (id) {
    case 'warmup':
      return 'Warm up';
    case 'learn':
      return lesson.learn.kind === 'sounds'
        ? 'Meet the sounds'
        : lesson.learn.kind === 'stress'
          ? 'Meet the pattern'
          : 'Learn the rules';
    case 'listen':
      return lesson.listen.title;
    case 'twister':
      return lesson.twister.title ?? 'Tongue-twister drill';
    case 'shadow':
      return 'Shadow the script';
    case 'reflect':
      return 'Rate and note';
  }
}

export function drillRows(lesson: Lesson): DrillRow[] {
  if (lesson.listen.pairs) return lesson.listen.pairs.map((p) => ({ cells: [...p] }));
  return lesson.listen.rows ?? [];
}

/** The ear test for a lesson, with "mixed-pairs" resolved to concrete pairs. */
export function resolveQuiz(lesson: Lesson): QuizSpec | null {
  const q = lesson.listen.quiz;
  if (q?.type === 'mixed-pairs') {
    const items = q.fromLessons.flatMap((id) => getLesson(id)?.listen.pairs ?? []);
    return items.length ? { type: 'pairs', items } : null;
  }
  if (q) return q;
  if (lesson.listen.pairs?.length) return { type: 'pairs', items: lesson.listen.pairs };
  return null;
}
