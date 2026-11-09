/** Guards the course content: a typo in a lesson fails CI instead of breaking the app. */
import { describe, expect, it } from 'vitest';
import {
  cardForSound,
  drillRows,
  getLesson,
  LEGACY_WEEK_IDS,
  LESSONS,
  lessonsForSound,
  resolveQuiz,
  SOUNDS,
  STEPS,
  stepTitle,
  UNITS,
} from '../src/content/course';
import { isSoundKey, soundByKey } from '../src/content/sounds';
import type { Lesson } from '../src/content/types';
import { markupProblems, stressWordProblems } from '../src/domain/markup';

/** The planned path. A lesson missing here, or out of order, fails the "path" test. */
const PATH = [
  ['stops', ['p-b', 't-d', 'k-g', 'american-t']],
  ['fricatives', ['f-v', 'th', 's-z', 'sh-zh', 'ch-j']],
  ['sonorants', ['m-n-ng', 'r-l', 'v-w-b', 'y-h']],
  ['front-vowels', ['i-ih', 'ay-eh', 'ae-eh-uh']],
  ['back-vowels', ['schwa', 'er', 'oo', 'oh', 'ah-aw']],
  ['glides-r', ['diphthongs', 'r-vowels']],
  ['stress', ['stress-two', 'stress-long']],
  ['flow', ['rhythm', 'intonation', 'clusters', 'shadowing']],
] as const;

/**
 * Characters allowed in a broad General American transcription. R is written "r", the
 * stressed and unstressed R vowels "ɝ" and "ɚ", and G is the IPA letter "ɡ" (U+0261).
 */
const IPA_CHARS = /^(?:[abdefhijklmnoprstuvwzæɑɔəɚɛɝɪʊʌθðʃʒŋɾʔɡˈˌ ‿.]|\u031A)+$/u;
/** e, o and a appear only inside the diphthongs eɪ, oʊ, aɪ and aʊ. */
const LONE_DIPHTHONG_PART = /e(?!ɪ)|o(?!ʊ)|a(?![ɪʊ])/u;

/** Card IPA that may differ from the inventory symbol. */
const CARD_IPA_ALIASES: Record<string, string[]> = { er: ['ɚ'] };

function markupStrings(lesson: Lesson): string[] {
  const strings = [
    ...drillRows(lesson).flatMap((r) => r.cells),
    ...lesson.twister.levels,
    ...lesson.shadow.lines,
  ];
  if (lesson.learn.kind === 'rules') {
    for (const rule of lesson.learn.rules) strings.push(rule.heading, ...rule.examples);
  }
  return strings;
}

describe('course structure', () => {
  it('follows the planned path', () => {
    expect(UNITS.map((u) => [u.key, u.lessons.map((l) => l.id)])).toEqual(
      PATH.map(([key, ids]) => [key, [...ids]]),
    );
  });

  it('has unique, URL-safe lesson ids', () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9-]{0,30}$/);
  });

  it('maps every version 1 and 2 week to a lesson', () => {
    for (const id of Object.values(LEGACY_WEEK_IDS)) expect(getLesson(id), id).toBeDefined();
  });

  it('has unique sound keys', () => {
    expect(new Set(SOUNDS.map((s) => s.key)).size).toBe(SOUNDS.length);
  });

  it('teaches every consonant, vowel and skill in at least one lesson', () => {
    const untaught = SOUNDS.filter((s) => s.kind !== 'other' && !lessonsForSound(s.key).length);
    expect(untaught.map((s) => s.key)).toEqual([]);
  });

  it('has a sound card for every consonant and vowel', () => {
    const missing = SOUNDS.filter(
      (s) => (s.kind === 'consonant' || s.kind === 'vowel') && !cardForSound(s.key),
    );
    expect(missing.map((s) => s.key)).toEqual([]);
  });

  it('gives every step a title', () => {
    for (const lesson of LESSONS) {
      for (const step of STEPS) expect(stepTitle(lesson, step.id)).toBeTruthy();
    }
  });
});

describe.each(LESSONS.map((l) => [l.id, l] as const))('lesson %s', (_id, lesson) => {
  it('teaches known sounds', () => {
    expect(lesson.sounds.length).toBeGreaterThan(0);
    for (const key of lesson.sounds) expect(isSoundKey(key), key).toBe(true);
    expect(lesson.sounds).not.toContain('other');
  });

  it('has the required text', () => {
    for (const text of [
      lesson.title,
      lesson.focus,
      lesson.goal,
      lesson.warmup,
      lesson.learn.mistake,
      lesson.listen.title,
      lesson.listen.intro,
      lesson.shadow.context,
      lesson.shadow.tip,
    ]) {
      expect(text.trim().length).toBeGreaterThan(0);
    }
    expect(lesson.shadow.lines.length).toBeGreaterThanOrEqual(3);
    expect(lesson.twister.levels).toHaveLength(3);
  });

  it('has well-formed markup', () => {
    for (const text of markupStrings(lesson)) {
      expect(markupProblems(text), text).toEqual([]);
    }
  });

  it('has drill rows to listen to', () => {
    const rows = drillRows(lesson);
    expect(rows.length).toBeGreaterThanOrEqual(3);
    for (const row of rows) expect(row.cells.length).toBeGreaterThan(0);
  });

  it('has sound cards that match the inventory', () => {
    if (lesson.learn.kind !== 'sounds') return;
    for (const card of lesson.learn.sounds) {
      const sound = soundByKey(card.sound);
      expect(isSoundKey(card.sound), card.sound).toBe(true);
      expect(['consonant', 'vowel']).toContain(sound.kind);
      expect([sound.ipa, ...(CARD_IPA_ALIASES[card.sound] ?? [])], card.name).toContain(card.ipa);
      expect(card.how.length, card.name).toBeGreaterThanOrEqual(2);
      expect(card.words.length, card.name).toBeGreaterThanOrEqual(4);
      expect(card.words.length, card.name).toBeLessThanOrEqual(8);
    }
  });

  it('writes clean IPA', () => {
    if (lesson.learn.kind !== 'sounds') return;
    for (const card of lesson.learn.sounds) {
      for (const [word, ipa] of card.words) {
        expect(ipa, word).toMatch(IPA_CHARS);
        expect(ipa, word).not.toMatch(LONE_DIPHTHONG_PART);
        expect(ipa.trim(), word).toBe(ipa);
        expect(word.trim(), word).toBe(word);
      }
    }
  });

  it('marks exactly one stressed syllable in every stress word', () => {
    const words = lesson.learn.kind === 'stress' ? lesson.learn.groups.flatMap((g) => g.words) : [];
    const quiz = resolveQuiz(lesson);
    if (quiz?.type === 'stress') words.push(...quiz.items);
    for (const word of words) expect(stressWordProblems(word), word).toEqual([]);
  });

  it('uses minimal pairs of two different words, without repeats', () => {
    const pairs = lesson.listen.pairs ?? [];
    const keys = pairs.map(([a, b]) => `${a}|${b}`.toLowerCase());
    expect(new Set(keys).size).toBe(keys.length);
    for (const [a, b] of pairs) {
      expect(a.toLowerCase()).not.toBe(b.toLowerCase());
      expect(a).toMatch(/^[A-Za-z' -]+$/);
      expect(b).toMatch(/^[A-Za-z' -]+$/);
    }
  });

  it('has a valid ear test when it has one', () => {
    const source = lesson.listen.quiz;
    if (source?.type === 'mixed-pairs') {
      for (const id of source.fromLessons) expect(getLesson(id), id).toBeDefined();
    }
    const quiz = resolveQuiz(lesson);
    if (!quiz) return;
    expect(quiz.items.length).toBeGreaterThanOrEqual(4);
    if (quiz.type === 'pairs') {
      for (const [a, b] of quiz.items) expect(a).not.toBe(b);
    }
    if (quiz.type === 'tone') {
      for (const [sentence, answer] of quiz.items) {
        expect(sentence).toMatch(/[.?]$/);
        expect(['rise', 'fall']).toContain(answer);
      }
    }
  });
});
