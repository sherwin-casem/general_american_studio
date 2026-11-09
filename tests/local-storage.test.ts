import { describe, expect, it, vi } from 'vitest';
import { StorageError } from '../src/storage/errors';
import { LocalStorageAdapter, SCHEMA_VERSION, STORAGE_KEYS } from '../src/storage/local';
import { MemoryStorage } from '../src/storage/memory-storage';
import type { DataSnapshot } from '../src/storage/types';
import { makeNote, makeRun } from './fixtures';

function connect(storage: Storage, events?: EventTarget) {
  const adapter = new LocalStorageAdapter(storage, events as never);
  const onData = vi.fn<(data: DataSnapshot) => void>();
  const onStatus = vi.fn();
  const stop = adapter.subscribe(onData, onStatus);
  const latest = () => onData.mock.calls.at(-1)?.[0] as DataSnapshot;
  return { adapter, onData, onStatus, stop, latest };
}

describe('LocalStorageAdapter', () => {
  it('starts empty and reports ready', () => {
    const { latest, onStatus } = connect(new MemoryStorage());
    expect(latest()).toEqual({ runs: [], notes: [] });
    expect(onStatus).toHaveBeenCalledWith({ phase: 'ready', notice: undefined });
  });

  it('saves a session with its note in one versioned write', async () => {
    const storage = new MemoryStorage();
    const { adapter, latest } = connect(storage);
    await adapter.saveSession(makeRun(), makeNote());
    expect(latest().runs).toHaveLength(1);
    expect(latest().notes).toHaveLength(1);
    const stored = JSON.parse(storage.getItem(STORAGE_KEYS.data) ?? '{}');
    expect(stored.schemaVersion).toBe(SCHEMA_VERSION);
    expect(stored.app).toBe('general-american-studio');
  });

  it('is idempotent when a save is retried with the same ids', async () => {
    const { adapter, latest } = connect(new MemoryStorage());
    await adapter.saveSession(makeRun(), makeNote());
    await adapter.saveSession(makeRun({ rating: 4 }), makeNote());
    expect(latest().runs).toHaveLength(1);
    expect(latest().runs[0]?.rating).toBe(4);
    expect(latest().notes).toHaveLength(1);
  });

  it('updates check-ins and removes records', async () => {
    const { adapter, latest } = connect(new MemoryStorage());
    await adapter.saveSession(makeRun(), makeNote());
    const checks = [
      ...makeNote().checks,
      { at: '2026-11-08T00:00:00.000Z', rating: 4 as const, comment: 'better' },
    ];
    await adapter.updateNoteChecks('note-1', checks);
    expect(latest().notes[0]?.checks).toHaveLength(2);
    await adapter.removeNote('note-1');
    await adapter.removeRun('run-1');
    expect(latest()).toEqual({ runs: [], notes: [] });
    await expect(adapter.updateNoteChecks('missing', checks)).rejects.toBeInstanceOf(StorageError);
  });

  it('migrates version 1 data and removes the old key', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      STORAGE_KEYS.legacyData,
      JSON.stringify({ runs: [makeRun()], notes: [makeNote()] }),
    );
    const { latest } = connect(storage);
    expect(latest().runs).toHaveLength(1);
    expect(storage.getItem(STORAGE_KEYS.legacyData)).toBeNull();
    expect(storage.getItem(STORAGE_KEYS.data)).not.toBeNull();
  });

  it('quarantines unreadable data instead of overwriting it', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEYS.data, '{not json');
    const { latest, onStatus } = connect(storage);
    expect(latest()).toEqual({ runs: [], notes: [] });
    expect(onStatus.mock.calls[0]?.[0].notice).toMatch(/could not be read/);
    const kept = Array.from({ length: storage.length }, (_, i) => storage.key(i)).find((k) =>
      k?.startsWith(STORAGE_KEYS.corruptPrefix),
    );
    expect(kept && storage.getItem(kept)).toBe('{not json');
  });

  it('drops damaged records and says how many', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      STORAGE_KEYS.data,
      JSON.stringify({ runs: [makeRun(), { week: 'x' }], notes: [] }),
    );
    const { latest, onStatus } = connect(storage);
    expect(latest().runs).toHaveLength(1);
    expect(onStatus.mock.calls[0]?.[0].notice).toMatch(/1 saved record was damaged/);
  });

  it('throws a quota error and keeps the previous state when storage is full', async () => {
    const storage = new MemoryStorage();
    const { adapter, latest } = connect(storage);
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    await expect(adapter.saveSession(makeRun(), null)).rejects.toMatchObject({ code: 'quota' });
    expect(latest().runs).toHaveLength(0);
  });

  it('imports only records it does not already have', async () => {
    const { adapter, latest } = connect(new MemoryStorage());
    await adapter.saveSession(makeRun(), null);
    const result = await adapter.importRecords({
      runs: [makeRun(), makeRun({ id: 'run-2' })],
      notes: [makeNote()],
    });
    expect(result).toEqual({ added: 2, skipped: 1 });
    expect(latest().runs).toHaveLength(2);
  });

  it('picks up changes made in another tab', () => {
    const storage = new MemoryStorage();
    const events = new EventTarget();
    const { latest } = connect(storage, events);
    storage.setItem(STORAGE_KEYS.data, JSON.stringify({ runs: [makeRun()], notes: [] }));
    events.dispatchEvent(Object.assign(new Event('storage'), { key: STORAGE_KEYS.data }));
    expect(latest().runs).toHaveLength(1);
  });
});
