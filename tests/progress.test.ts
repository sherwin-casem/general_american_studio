import { describe, expect, it } from 'vitest';
import { BRIDGE_ID, LESSONS, LESSONS_PER_WEEK } from '../src/content/course';
import {
  isNoteDue,
  lessonStatus,
  lessonsToRepeat,
  noteLevel,
  passedCount,
  runsThisWeek,
  soundProgress,
  suggestedLesson,
  weakestLesson,
  weeklyPlan,
  weeklyStreak,
  weekStartKey,
} from '../src/domain/progress';
import { makeNote, makeRun } from './fixtures';

const localIso = (y: number, m: number, d: number, h = 12) => new Date(y, m, d, h).toISOString();
const first = LESSONS[0]!.id;
const second = LESSONS[1]!.id;

describe('lesson status and suggestions', () => {
  it('starts at the first lesson on the path', () => {
    expect(suggestedLesson([])).toBe(first);
    expect(lessonStatus([], first)).toBe('new');
  });

  it('keeps a lesson until it is rated 3 or higher', () => {
    const low = [makeRun({ id: 'a', lesson: first, rating: 2 })];
    expect(lessonStatus(low, first)).toBe('practiced');
    expect(suggestedLesson(low)).toBe(first);

    const passed = [...low, makeRun({ id: 'b', lesson: first, rating: 3 })];
    expect(lessonStatus(passed, first)).toBe('passed');
    expect(suggestedLesson(passed)).toBe(second);
  });

  it('skips lessons passed out of order', () => {
    const runs = [makeRun({ id: 'a', lesson: second, rating: 4 })];
    expect(suggestedLesson(runs)).toBe(first);
    const both = [...runs, makeRun({ id: 'b', lesson: first, rating: 4 })];
    expect(suggestedLesson(both)).toBe(LESSONS[2]!.id);
  });

  it('suggests the Business English bridge once every lesson is passed', () => {
    const runs = LESSONS.map((l) => makeRun({ id: `r-${l.id}`, lesson: l.id, rating: 4 }));
    expect(passedCount(runs)).toBe(LESSONS.length);
    expect(suggestedLesson(runs)).toBe(BRIDGE_ID);
  });

  it('finds the weakest lesson by its latest session', () => {
    const runs = [
      makeRun({ id: 'a', lesson: 'th', rating: 1, at: '2026-10-01T00:00:00.000Z' }),
      makeRun({ id: 'b', lesson: 'th', rating: 5, at: '2026-10-08T00:00:00.000Z' }),
      makeRun({ id: 'c', lesson: 'r-l', rating: 3 }),
    ];
    expect(weakestLesson(runs)).toEqual({ lesson: 'r-l', rating: 3 });
    expect(weakestLesson([])).toBeNull();
  });

  it('lists lessons to repeat, most recent first', () => {
    const runs = [
      makeRun({ id: 'a', lesson: 'th', rating: 2, at: '2026-10-01T00:00:00.000Z' }),
      makeRun({ id: 'b', lesson: 'r-l', rating: 1, at: '2026-10-05T00:00:00.000Z' }),
      makeRun({ id: 'c', lesson: 'p-b', rating: 4, at: '2026-10-06T00:00:00.000Z' }),
    ];
    expect(lessonsToRepeat(runs)).toEqual(['r-l', 'th']);
  });
});

describe('weekly plan', () => {
  const now = new Date(2026, 10, 7, 9); // Saturday 7 November 2026

  it('plans the next lessons on the path', () => {
    const plan = weeklyPlan([], now);
    expect(plan).toHaveLength(LESSONS_PER_WEEK);
    expect(plan.map((p) => p.lesson)).toEqual(LESSONS.slice(0, LESSONS_PER_WEEK).map((l) => l.id));
    expect(plan.every((p) => !p.done)).toBe(true);
  });

  it('counts lessons passed this week as done', () => {
    const runs = [makeRun({ id: 'a', lesson: first, rating: 4, at: localIso(2026, 10, 3) })];
    expect(weeklyPlan(runs, now)).toEqual([
      { lesson: first, done: true },
      { lesson: second, done: false },
    ]);
  });

  it('does not count lessons passed in earlier weeks', () => {
    const runs = [makeRun({ id: 'a', lesson: first, rating: 4, at: localIso(2026, 9, 20) })];
    expect(weeklyPlan(runs, now)[0]).toEqual({ lesson: second, done: false });
    expect(runsThisWeek(runs, now)).toEqual([]);
  });
});

describe('sound progress', () => {
  it('follows the lessons that teach the sound', () => {
    expect(soundProgress('th-voiceless', [], []).status).toBe('new');
    const runs = [makeRun({ lesson: 'th', rating: 4 })];
    expect(soundProgress('th-voiceless', runs, []).status).toBe('passed');
    expect(soundProgress('th-voiced', runs, []).status).toBe('passed');
    expect(soundProgress('r', runs, []).status).toBe('new');
  });

  it('reports the weakest notebook level for the sound', () => {
    const notes = [
      makeNote({
        id: 'a',
        sound: 'r',
        checks: [{ at: '2026-11-01T00:00:00.000Z', rating: 4, comment: '' }],
      }),
      makeNote({
        id: 'b',
        sound: 'r',
        checks: [{ at: '2026-11-01T00:00:00.000Z', rating: 2, comment: '' }],
      }),
    ];
    expect(soundProgress('r', [], notes).noteLevel).toBe(1);
    expect(soundProgress('l', [], notes).noteLevel).toBeNull();
  });
});

describe('weeklyStreak', () => {
  const now = new Date(2026, 10, 7, 9); // Saturday 7 November 2026

  it('uses Monday as the start of the week', () => {
    expect(weekStartKey(new Date(2026, 10, 7))).toBe('2026-11-02');
    expect(weekStartKey(new Date(2026, 10, 2))).toBe('2026-11-02');
    expect(weekStartKey(new Date(2026, 10, 1))).toBe('2026-10-26');
  });

  it('counts consecutive weeks including this one', () => {
    const runs = [
      makeRun({ id: 'a', at: localIso(2026, 10, 3) }),
      makeRun({ id: 'b', at: localIso(2026, 9, 28) }),
      makeRun({ id: 'c', at: localIso(2026, 9, 14) }),
    ];
    expect(weeklyStreak(runs, now)).toBe(2);
  });

  it('keeps the streak alive when only last week was practiced', () => {
    expect(weeklyStreak([makeRun({ at: localIso(2026, 9, 28) })], now)).toBe(1);
  });

  it('is zero after a missed week', () => {
    expect(weeklyStreak([makeRun({ at: localIso(2026, 9, 20) })], now)).toBe(0);
    expect(weeklyStreak([], now)).toBe(0);
  });
});

describe('notebook rules', () => {
  const now = new Date('2026-11-10T12:00:00.000Z');
  const withCheck = (rating: 1 | 2 | 3 | 4 | 5, at: string) =>
    makeNote({ checks: [{ at, rating, comment: '' }] });

  it('derives the level from the latest check-in', () => {
    expect(noteLevel(withCheck(2, '2026-11-01T00:00:00.000Z'))).toBe(1);
    expect(noteLevel(withCheck(3, '2026-11-01T00:00:00.000Z'))).toBe(2);
    expect(noteLevel(withCheck(4, '2026-11-01T00:00:00.000Z'))).toBe(3);
  });

  it('is due a week after the last check-in, unless fully clear', () => {
    expect(isNoteDue(withCheck(3, '2026-11-02T12:00:00.000Z'), now)).toBe(true);
    expect(isNoteDue(withCheck(3, '2026-11-07T12:00:00.000Z'), now)).toBe(false);
    expect(isNoteDue(withCheck(5, '2026-10-01T12:00:00.000Z'), now)).toBe(false);
  });
});
