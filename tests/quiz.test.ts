import { describe, expect, it } from 'vitest';
import type { QuizSpec } from '../src/content/types';
import {
  answerRound,
  isCorrect,
  nextRound,
  roundSpeech,
  shuffle,
  startQuiz,
  toneExplanation,
  type QuizState,
} from '../src/domain/quiz';

/** Deterministic random source cycling through the given values. */
function sequence(...values: number[]) {
  let i = 0;
  return () => values[i++ % values.length] as number;
}

const pairs: QuizSpec = {
  type: 'pairs',
  items: [
    ['thin', 'tin'],
    ['three', 'tree'],
  ],
};

function correctChoice(state: QuizState): string {
  const round = state.current;
  if (!round) throw new Error('no round');
  if (round.type === 'pairs') return String(round.answer);
  if (round.type === 'stress') return String(round.parsed.stressIndex);
  return round.answer;
}

describe('quiz engine', () => {
  it('runs the configured number of rounds and keeps score', () => {
    const random = sequence(0.1, 0.7, 0.4);
    let state = startQuiz('th', pairs, random, 4);
    expect(state.round).toBe(1);
    for (let round = 1; round <= 4; round++) {
      state = answerRound(
        state,
        round % 2 ? correctChoice(state) : String(1 - Number(correctChoice(state))),
      );
      expect(state.answered).toBe(true);
      state = nextRound(state, random);
    }
    expect(state.done).toBe(true);
    expect(state.score).toBe(2);
    expect(nextRound(state)).toBe(state);
  });

  it('ignores a second answer and invalid choices', () => {
    let state = startQuiz('th', pairs, sequence(0.2), 2);
    expect(answerRound(state, 'banana')).toBe(state);
    state = answerRound(state, correctChoice(state));
    expect(answerRound(state, '0')).toBe(state);
    expect(state.score).toBe(1);
  });

  it('speaks the target word for pairs and stress rounds only', () => {
    const state = startQuiz('th', pairs, sequence(0.9), 1);
    const round = state.current;
    expect(round?.type).toBe('pairs');
    if (round?.type === 'pairs') expect(roundSpeech(round)).toBe(round.pair[round.answer]);
    const tone = startQuiz('th', { type: 'tone', items: [['Is it?', 'rise']] }, sequence(0.5), 1);
    expect(roundSpeech(tone.current)).toBeNull();
  });

  it('offers the right syllable among at most three stress options', () => {
    const spec: QuizSpec = { type: 'stress', items: ['op·por·TU·ni·ty'] };
    const state = startQuiz('th', spec, sequence(0.3, 0.8, 0.5), 1);
    const round = state.current;
    if (round?.type !== 'stress') throw new Error('expected a stress round');
    expect(round.options).toContain(2);
    expect(round.options).toHaveLength(3);
    expect([...round.options].sort((a, b) => a - b)).toEqual(round.options);
    expect(isCorrect(answerRound(state, '2').current as NonNullable<QuizState['current']>)).toBe(
      true,
    );
  });

  it('cycles through every item before repeating', () => {
    const spec: QuizSpec = {
      type: 'tone',
      items: [
        ['A?', 'rise'],
        ['B.', 'fall'],
        ['C?', 'rise'],
      ],
    };
    const seen = new Set<string>();
    let state = startQuiz('th', spec, Math.random, 3);
    for (let i = 0; i < 3; i++) {
      if (state.current?.type === 'tone') seen.add(state.current.sentence);
      state = nextRound(answerRound(state, 'rise'));
    }
    expect(seen.size).toBe(3);
  });

  it('ends immediately when there are no items', () => {
    expect(startQuiz('th', { type: 'pairs', items: [] }).done).toBe(true);
  });
});

describe('helpers', () => {
  it('shuffle keeps every item', () => {
    expect(shuffle([1, 2, 3, 4], sequence(0.9, 0.1, 0.5)).sort()).toEqual([1, 2, 3, 4]);
  });

  it('explains intonation', () => {
    expect(toneExplanation('Where is the office?')).toMatch(/Wh-questions/);
    expect(toneExplanation('Are you ready?')).toMatch(/Yes\/no/);
    expect(toneExplanation('I’m ready.')).toMatch(/Statements/);
  });
});
