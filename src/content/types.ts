/**
 * Shapes of the course content. `tests/content.test.ts` checks every lesson against these rules.
 *
 * The course is a path of units. Each unit is a list of lessons, and each lesson teaches one or
 * more sounds (or a stress and melody skill) in six repeatable steps.
 */

/** Every sound and skill the app knows. Keys are stable: they are stored in notebook notes. */
export type SoundKey =
  // Consonants
  | 'p'
  | 'b'
  | 't'
  | 'd'
  | 'k'
  | 'g'
  | 'f'
  | 'v'
  | 'th-voiceless'
  | 'th-voiced'
  | 's'
  | 'z'
  | 'sh'
  | 'zh'
  | 'h'
  | 'ch'
  | 'j'
  | 'm'
  | 'n'
  | 'ng'
  | 'l'
  | 'r'
  | 'w'
  | 'y'
  | 'flap-t'
  | 'stop-t'
  // Vowels
  | 'i'
  | 'ih'
  | 'ay'
  | 'eh'
  | 'ae'
  | 'uh'
  | 'schwa'
  | 'er'
  | 'long-oo'
  | 'short-oo'
  | 'oh'
  | 'aw'
  | 'ah'
  | 'eye'
  | 'ow'
  | 'oy'
  | 'ear'
  | 'air'
  | 'ar'
  | 'or'
  // Stress, melody and fluency
  | 'word-stress'
  | 'rhythm'
  | 'intonation'
  | 'clusters'
  | 'other';

export type SoundKind = 'consonant' | 'vowel' | 'skill' | 'other';

/** Groups used by the sound chart, in display order. */
export type SoundCategory =
  | 'stop'
  | 'fricative'
  | 'affricate'
  | 'nasal'
  | 'approximant'
  | 't-variant'
  | 'front'
  | 'central'
  | 'back'
  | 'diphthong'
  | 'r-colored'
  | 'skill'
  | 'other';

export interface Sound {
  key: SoundKey;
  kind: SoundKind;
  category: SoundCategory;
  /** IPA symbol without slashes, or a symbol for a skill. */
  ipa: string;
  /** "TH as in think". */
  name: string;
  /** A common word with the sound; used on the chart and for "hear real speakers" links. */
  keyword: string;
  /** Consonants only. */
  voiced?: boolean;
  /** Consonants: where the sound is made, in plain words ("tongue between teeth"). */
  place?: string;
}

/** A word with its General American IPA transcription (without slashes). */
export type IpaWord = [word: string, ipa: string];

export interface SoundCard {
  /** The inventory sound this card teaches. The sound chart shows this card. */
  sound: SoundKey;
  ipa: string;
  name: string;
  /** Two to four short steps for making the sound. */
  how: string[];
  /** Common spellings, for example ['ee', 'ea', 'e']. */
  spellings?: string[];
  /** Four to eight example words. */
  words: IpaWord[];
}

export interface RuleCard {
  heading: string;
  text: string;
  /** Examples in text markup (see markup.ts). */
  examples: string[];
}

export interface StressGroup {
  label: string;
  /** Syllables split by "·", stressed syllable in capitals: "in·for·MA·tion". */
  words: string[];
}

export type Learn =
  | { kind: 'sounds'; sounds: SoundCard[]; mistake: string }
  | { kind: 'stress'; rules: string[]; groups: StressGroup[]; mistake: string }
  | { kind: 'rules'; rules: RuleCard[]; mistake: string };

export type Pair = [string, string];
export type Tone = 'rise' | 'fall';

export interface DrillRow {
  /** One or more items in text markup, played left to right. */
  cells: string[];
  /** Sound-alike spelling or a short label. */
  hint?: string;
}

export type QuizSpec =
  | { type: 'pairs'; items: Pair[] }
  | { type: 'stress'; items: string[] }
  | { type: 'tone'; items: [sentence: string, answer: Tone][] };

/** Where a lesson's ear test comes from. "mixed-pairs" reuses the minimal pairs of other lessons. */
export type QuizSource = QuizSpec | { type: 'mixed-pairs'; fromLessons: string[] };

export interface Listen {
  title: string;
  intro: string;
  /** Shown between cells of a drill row. Defaults to "vs". */
  separator?: string;
  /** Minimal pairs. When set, the drill rows and a "pairs" ear test are derived from them. */
  pairs?: Pair[];
  rows?: DrillRow[];
  quiz?: QuizSource;
}

export interface Twister {
  title?: string;
  /** Exactly three levels, easiest first. */
  levels: [string, string, string];
}

export interface Shadow {
  context: string;
  lines: string[];
  tip: string;
}

export interface Lesson {
  /** Stable id, stored with every session. Never change it once released. */
  id: string;
  title: string;
  /** Completes "How clear was … today?" */
  focus: string;
  /** The sounds this lesson teaches. The first is the default sound for notebook notes. */
  sounds: SoundKey[];
  goal: string;
  warmup: string;
  learn: Learn;
  listen: Listen;
  twister: Twister;
  shadow: Shadow;
}

export type UnitKey =
  | 'stops'
  | 'fricatives'
  | 'sonorants'
  | 'front-vowels'
  | 'back-vowels'
  | 'glides-r'
  | 'stress'
  | 'flow';

export interface Unit {
  key: UnitKey;
  name: string;
  /** One line shown under the unit name. */
  summary: string;
  lessons: Lesson[];
}

export type StepId = 'warmup' | 'learn' | 'listen' | 'twister' | 'shadow' | 'reflect';
