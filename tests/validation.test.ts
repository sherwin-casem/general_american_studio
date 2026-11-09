import { describe, expect, it } from 'vitest';
import { clampInt, sanitizeNote, sanitizeRun, sanitizeSnapshot } from '../src/domain/validation';
import { makeNote, makeRun } from './fixtures';

describe('sanitizeRun', () => {
  it('keeps a valid run', () => {
    expect(sanitizeRun(makeRun())).toEqual(makeRun());
  });

  it.each([
    ['missing id', { ...makeRun(), id: undefined }],
    ['bad id', { ...makeRun(), id: 'has spaces' }],
    ['unknown lesson', { ...makeRun(), lesson: 'no-such-lesson' }],
    ['no lesson', { ...makeRun(), lesson: undefined }],
    ['old week 0', { ...makeRun(), lesson: undefined, week: 0 }],
    ['old week 13', { ...makeRun(), lesson: undefined, week: 13 }],
    ['rating 6', { ...makeRun(), rating: 6 }],
    ['rating as string', { ...makeRun(), rating: '4' }],
    ['bad date', { ...makeRun(), at: 'yesterday' }],
    ['not an object', 'run'],
  ])('rejects %s', (_label, raw) => {
    expect(sanitizeRun(raw)).toBeNull();
  });

  it('migrates a version 1 or 2 week number to its lesson', () => {
    const { lesson: _lesson, ...old } = makeRun();
    expect(sanitizeRun({ ...old, week: 1 })?.lesson).toBe('th');
    expect(sanitizeRun({ ...old, week: 4 })?.lesson).toBe('american-t');
    expect(sanitizeRun({ ...old, week: 12 })?.lesson).toBe('shadowing');
    expect(sanitizeRun({ ...old, week: 1 })).not.toHaveProperty('week');
  });

  it('uses the fallback id from the database document', () => {
    const { id: _id, ...body } = makeRun();
    expect(sanitizeRun(body, 'doc-7')?.id).toBe('doc-7');
  });

  it('clamps numbers and truncates text', () => {
    const run = sanitizeRun({ ...makeRun(), minutes: 9999, note: 'x'.repeat(2000), quiz: 50 });
    expect(run?.minutes).toBe(240);
    expect(run?.note).toHaveLength(600);
    expect(run?.quiz).toBe(8);
  });
});

describe('sanitizeNote', () => {
  it('keeps a valid note', () => {
    expect(sanitizeNote(makeNote())).toEqual(makeNote());
  });

  it('maps unknown sounds to "other"', () => {
    expect(sanitizeNote({ ...makeNote(), sound: 'zzz' })?.sound).toBe('other');
  });

  it('keeps every sound key of version 2, and accepts the new sounds', () => {
    for (const sound of ['th-voiced', 'flap-t', 'stop-t', 'ih', 'uh', 'schwa', 'rhythm']) {
      expect(sanitizeNote({ ...makeNote(), sound })?.sound).toBe(sound);
    }
    for (const sound of ['zh', 'ng', 'long-oo', 'oy', 'ar', 'clusters']) {
      expect(sanitizeNote({ ...makeNote(), sound })?.sound).toBe(sound);
    }
  });

  it('migrates the week of a version 1 or 2 note to its lesson', () => {
    const { lesson: _lesson, ...old } = makeNote();
    expect(sanitizeNote({ ...old, week: 2 })?.lesson).toBe('r-l');
    expect(sanitizeNote({ ...old, week: null })?.lesson).toBeNull();
    expect(sanitizeNote({ ...old, week: 99 })?.lesson).toBeNull();
  });

  it('drops invalid check-ins and sorts the rest', () => {
    const note = sanitizeNote({
      ...makeNote(),
      checks: [
        { at: '2026-11-09T00:00:00.000Z', rating: 4, comment: 'later' },
        { at: 'nope', rating: 3 },
        { at: '2026-11-01T00:00:00.000Z', rating: 9 },
        { at: '2026-11-02T00:00:00.000Z', rating: 2 },
      ],
    });
    expect(note?.checks.map((c) => c.rating)).toEqual([2, 4]);
    expect(note?.checks[0]?.comment).toBe('');
  });

  it('rejects a note with no valid check-ins', () => {
    expect(sanitizeNote({ ...makeNote(), checks: [] })).toBeNull();
  });
});

describe('sanitizeSnapshot', () => {
  it('counts dropped records and removes duplicate ids', () => {
    const { data, dropped } = sanitizeSnapshot({
      runs: [makeRun(), makeRun({ rating: 5 }), { bad: true }],
      notes: [makeNote(), null],
    });
    expect(data.runs).toHaveLength(1);
    expect(data.runs[0]?.rating).toBe(5);
    expect(data.notes).toHaveLength(1);
    expect(dropped).toBe(3);
  });

  it('returns empty data for anything that is not an object', () => {
    expect(sanitizeSnapshot([1, 2]).data).toEqual({ runs: [], notes: [] });
  });
});

describe('clampInt', () => {
  it('handles numbers, numeric strings and junk', () => {
    expect(clampInt(7.6, 1, 10, 0)).toBe(8);
    expect(clampInt('12', 1, 10, 0)).toBe(10);
    expect(clampInt('', 1, 10, 5)).toBe(5);
    expect(clampInt(Number.NaN, 1, 10, 5)).toBe(5);
    expect(clampInt({}, 1, 10, 5)).toBe(5);
  });
});
