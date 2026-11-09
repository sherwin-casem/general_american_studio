/** Ear-test engine. Immutable state transitions with an injectable random source for testing. */
import { QUIZ_ROUNDS } from '../content/course';
import type { Pair, QuizSpec, Tone } from '../content/types';
import { parseStressWord, type StressWord } from './markup';

export type Random = () => number;

export type QuizRound =
  | { type: 'pairs'; pair: Pair; answer: 0 | 1; picked: 0 | 1 | null }
  | { type: 'stress'; word: string; parsed: StressWord; options: number[]; picked: number | null }
  | { type: 'tone'; sentence: string; answer: Tone; picked: Tone | null };

export interface QuizState {
  /** Lesson id. */
  lesson: string;
  spec: QuizSpec;
  total: number;
  round: number;
  score: number;
  current: QuizRound | null;
  answered: boolean;
  done: boolean;
  /** Remaining item indexes, drawn from the end. Refilled when empty. */
  queue: number[];
}

export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

function itemCount(spec: QuizSpec): number {
  return spec.items.length;
}

function buildRound(spec: QuizSpec, index: number, random: Random): QuizRound {
  switch (spec.type) {
    case 'pairs': {
      const pair = spec.items[index] as Pair;
      return { type: 'pairs', pair, answer: random() < 0.5 ? 0 : 1, picked: null };
    }
    case 'stress': {
      const word = spec.items[index] as string;
      const parsed = parseStressWord(word);
      const all = parsed.syllables.map((_, i) => i);
      const options =
        all.length > 3
          ? [
              parsed.stressIndex,
              ...shuffle(
                all.filter((i) => i !== parsed.stressIndex),
                random,
              ).slice(0, 2),
            ].sort((a, b) => a - b)
          : all;
      return { type: 'stress', word, parsed, options, picked: null };
    }
    case 'tone': {
      const [sentence, answer] = spec.items[index] as [string, Tone];
      return { type: 'tone', sentence, answer, picked: null };
    }
  }
}

export function startQuiz(
  lesson: string,
  spec: QuizSpec,
  random: Random = Math.random,
  total = QUIZ_ROUNDS,
): QuizState {
  const initial: QuizState = {
    lesson,
    spec,
    total,
    round: 0,
    score: 0,
    current: null,
    answered: false,
    done: false,
    queue: [],
  };
  return nextRound(initial, random);
}

export function nextRound(state: QuizState, random: Random = Math.random): QuizState {
  if (state.done) return state;
  if (state.round >= state.total || itemCount(state.spec) === 0) {
    return { ...state, done: true, current: null, answered: false };
  }
  const queue = state.queue.length
    ? [...state.queue]
    : shuffle(
        Array.from({ length: itemCount(state.spec) }, (_, i) => i),
        random,
      );
  const index = queue.pop() as number;
  return {
    ...state,
    queue,
    round: state.round + 1,
    current: buildRound(state.spec, index, random),
    answered: false,
  };
}

export function isCorrect(round: QuizRound): boolean {
  switch (round.type) {
    case 'pairs':
      return round.picked === round.answer;
    case 'stress':
      return round.picked === round.parsed.stressIndex;
    case 'tone':
      return round.picked === round.answer;
  }
}

/** Records an answer. Ignored when the round is already answered or the choice is invalid. */
export function answerRound(state: QuizState, choice: string): QuizState {
  const round = state.current;
  if (!round || state.answered) return state;
  let picked: QuizRound;
  if (round.type === 'pairs') {
    if (choice !== '0' && choice !== '1') return state;
    picked = { ...round, picked: choice === '0' ? 0 : 1 };
  } else if (round.type === 'stress') {
    const n = Number(choice);
    if (!round.options.includes(n)) return state;
    picked = { ...round, picked: n };
  } else {
    if (choice !== 'rise' && choice !== 'fall') return state;
    picked = { ...round, picked: choice };
  }
  return {
    ...state,
    current: picked,
    answered: true,
    score: state.score + (isCorrect(picked) ? 1 : 0),
  };
}

/** What the speech engine should say for the round, or null when the person reads first. */
export function roundSpeech(round: QuizRound | null): string | null {
  if (!round) return null;
  if (round.type === 'pairs') return round.pair[round.answer];
  if (round.type === 'stress') return round.parsed.text;
  return null;
}

export function toneExplanation(sentence: string): string {
  if (/^(what|where|when|who|why|how)\b/i.test(sentence)) return 'Wh-questions usually fall.';
  if (/\?$/.test(sentence)) return 'Yes/no questions usually rise.';
  return 'Statements usually fall.';
}
