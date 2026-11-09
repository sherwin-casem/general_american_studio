import { describe, expect, it } from 'vitest';
import { createBackup, parseBackup } from '../src/storage/backup';
import { MemoryStorage } from '../src/storage/memory-storage';
import { DRAFT_KEYS, emptyDraft, loadDrafts } from '../src/state/drafts';
import { loadPrefs, PREF_KEYS } from '../src/state/prefs';
import { makeNote, makeRun } from './fixtures';

describe('backups', () => {
  it('round-trips data', () => {
    const data = { runs: [makeRun()], notes: [makeNote()] };
    const parsed = parseBackup(createBackup(data));
    expect(parsed).toEqual({ ok: true, data, dropped: 0 });
  });

  it('accepts plain version 1 data', () => {
    const parsed = parseBackup(JSON.stringify({ runs: [makeRun()], notes: [] }));
    expect(parsed.ok && parsed.data.runs).toHaveLength(1);
  });

  it.each([
    ['not JSON', '{oops', /valid JSON/],
    ['another app', JSON.stringify({ app: 'other', runs: [] }), /different app/],
    [
      'a newer schema',
      JSON.stringify({ app: 'general-american-studio', schemaVersion: 99, runs: [] }),
      /newer version/,
    ],
    ['no records', JSON.stringify({ hello: 1 }), /no sessions or notes/],
    ['an array', '[]', /isn’t a backup/],
  ])('rejects %s', (_label, text, message) => {
    const parsed = parseBackup(text);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.error).toMatch(message);
  });

  it('counts damaged records', () => {
    const parsed = parseBackup(JSON.stringify({ runs: [makeRun(), { nope: 1 }], notes: [] }));
    expect(parsed.ok && parsed.dropped).toBe(1);
  });
});

describe('drafts', () => {
  it('migrates version 1 drafts', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      DRAFT_KEYS.legacy,
      JSON.stringify({
        weeks: {
          '3': {
            done: { warmup: true, bogus: true },
            reps: [2, 9, 0],
            passes: { 0: true },
            rating: 4,
            note: 'hi',
            addNote: false,
            minutes: 20,
            quizBest: 6,
          },
          '99': { done: { warmup: true } },
        },
      }),
    );
    const drafts = loadDrafts(storage);
    // Week 3 was "V, W and B"; it is the lesson 'v-w-b' now.
    expect(Object.keys(drafts)).toEqual(['v-w-b']);
    expect(drafts['v-w-b']).toMatchObject({
      done: { warmup: true },
      reps: [2, 9, 0],
      rating: 4,
      note: 'hi',
      addToNotebook: false,
      minutes: 20,
      quizBest: 6,
    });
    expect(drafts['v-w-b']?.passes[0]).toBe(true);
    expect(storage.getItem(DRAFT_KEYS.legacy)).toBeNull();
  });

  it('migrates version 2 drafts keyed by week number, and keeps lesson ids', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      DRAFT_KEYS.drafts,
      JSON.stringify({ '1': { rating: 2 }, 'p-b': { rating: 5 }, nope: { rating: 3 } }),
    );
    const drafts = loadDrafts(storage);
    expect(Object.keys(drafts).sort()).toEqual(['p-b', 'th']);
    expect(drafts.th?.rating).toBe(2);
    expect(drafts['p-b']?.rating).toBe(5);
  });

  it('ignores unreadable drafts', () => {
    const storage = new MemoryStorage();
    storage.setItem(DRAFT_KEYS.drafts, 'nope');
    expect(loadDrafts(storage)).toEqual({});
  });

  it('starts with sensible defaults', () => {
    expect(emptyDraft()).toMatchObject({ rating: null, addToNotebook: true, minutes: 15 });
  });
});

describe('prefs', () => {
  it('reads version 1 keys', () => {
    const storage = new MemoryStorage();
    storage.setItem(PREF_KEYS.legacyWeek, '4');
    storage.setItem(PREF_KEYS.legacyVoice, JSON.stringify('voice-1'));
    expect(loadPrefs(storage)).toEqual({
      lesson: 'american-t',
      voice: 'voice-1',
      recordings: true,
    });
  });

  it('migrates a version 2 week, including the Business English card', () => {
    const storage = new MemoryStorage();
    storage.setItem(PREF_KEYS.prefs, JSON.stringify({ week: 5, voice: null }));
    expect(loadPrefs(storage).lesson).toBe('i-ih');
    storage.setItem(PREF_KEYS.prefs, JSON.stringify({ week: 13, voice: null }));
    expect(loadPrefs(storage).lesson).toBe('business-english');
  });

  it('rejects unknown lessons and bad values', () => {
    const storage = new MemoryStorage();
    storage.setItem(PREF_KEYS.prefs, JSON.stringify({ lesson: 'nope', voice: 7 }));
    expect(loadPrefs(storage)).toEqual({ lesson: null, voice: null, recordings: true });
  });

  it('remembers turning recordings off', () => {
    const storage = new MemoryStorage();
    storage.setItem(PREF_KEYS.prefs, JSON.stringify({ lesson: 'p-b', recordings: false }));
    expect(loadPrefs(storage)).toEqual({ lesson: 'p-b', voice: null, recordings: false });
  });
});
