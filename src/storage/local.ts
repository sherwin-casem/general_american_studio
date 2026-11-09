/**
 * Browser storage adapter (localStorage, or MemoryStorage when that is blocked).
 *
 * - Versioned envelope with migration from the version 1 key.
 * - Corrupt data is quarantined under a separate key, never silently overwritten.
 * - Write failures (quota) throw and leave the in-memory state unchanged.
 * - Changes from other tabs arrive through the `storage` event.
 */
import { APP_ID } from '../content/course';
import { sanitizeSnapshot } from '../domain/validation';
import { isQuotaError, StorageError } from './errors';
import type {
  AdapterStatus,
  CheckIn,
  DataSnapshot,
  ImportResult,
  SessionRun,
  SoundNote,
  StorageAdapter,
  StorageMode,
} from './types';

export const STORAGE_KEYS = {
  data: 'gas:v2:data',
  legacyData: 'gas.data.v1',
  corruptPrefix: 'gas:v2:corrupt:',
} as const;

export const SCHEMA_VERSION = 2;

interface Envelope {
  app: typeof APP_ID;
  schemaVersion: number;
  savedAt: string;
  runs: SessionRun[];
  notes: SoundNote[];
}

type EventTarget = Pick<Window, 'addEventListener' | 'removeEventListener'>;

const EMPTY: DataSnapshot = { runs: [], notes: [] };

function upsert<T extends { id: string }>(items: readonly T[], item: T): T[] {
  const index = items.findIndex((x) => x.id === item.id);
  if (index === -1) return [...items, item];
  const next = [...items];
  next[index] = item;
  return next;
}

export class LocalStorageAdapter implements StorageAdapter {
  private data: DataSnapshot = EMPTY;
  private notice: string | undefined;
  private readonly listeners = new Set<(data: DataSnapshot) => void>();

  constructor(
    private readonly storage: Storage,
    private readonly events?: EventTarget,
    readonly mode: StorageMode = 'browser',
  ) {
    this.data = this.read();
  }

  private readonly onStorageEvent = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEYS.data && event.key !== null) return;
    this.data = this.read();
    this.emit();
  };

  subscribe(
    onData: (data: DataSnapshot) => void,
    onStatus: (status: AdapterStatus) => void,
  ): () => void {
    if (!this.listeners.size) this.events?.addEventListener('storage', this.onStorageEvent);
    this.listeners.add(onData);
    onData(this.data);
    onStatus({ phase: 'ready', notice: this.notice });
    return () => {
      this.listeners.delete(onData);
      if (!this.listeners.size) this.events?.removeEventListener('storage', this.onStorageEvent);
    };
  }

  async saveSession(run: SessionRun, note: SoundNote | null): Promise<void> {
    this.write({
      runs: upsert(this.data.runs, run),
      notes: note ? upsert(this.data.notes, note) : this.data.notes,
    });
  }

  async saveNote(note: SoundNote): Promise<void> {
    this.write({ ...this.data, notes: upsert(this.data.notes, note) });
  }

  async updateNoteChecks(id: string, checks: CheckIn[]): Promise<void> {
    if (!this.data.notes.some((n) => n.id === id))
      throw new StorageError('invalid', 'Note not found');
    this.write({
      ...this.data,
      notes: this.data.notes.map((n) => (n.id === id ? { ...n, checks } : n)),
    });
  }

  async removeRun(id: string): Promise<void> {
    this.write({ ...this.data, runs: this.data.runs.filter((r) => r.id !== id) });
  }

  async removeNote(id: string): Promise<void> {
    this.write({ ...this.data, notes: this.data.notes.filter((n) => n.id !== id) });
  }

  async importRecords(incoming: DataSnapshot): Promise<ImportResult> {
    const runIds = new Set(this.data.runs.map((r) => r.id));
    const noteIds = new Set(this.data.notes.map((n) => n.id));
    const runs = incoming.runs.filter((r) => !runIds.has(r.id));
    const notes = incoming.notes.filter((n) => !noteIds.has(n.id));
    const added = runs.length + notes.length;
    if (added)
      this.write({ runs: [...this.data.runs, ...runs], notes: [...this.data.notes, ...notes] });
    return { added, skipped: incoming.runs.length + incoming.notes.length - added };
  }

  private emit(): void {
    for (const listener of this.listeners) listener(this.data);
  }

  private write(next: DataSnapshot): void {
    const envelope: Envelope = {
      app: APP_ID,
      schemaVersion: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      runs: next.runs,
      notes: next.notes,
    };
    try {
      this.storage.setItem(STORAGE_KEYS.data, JSON.stringify(envelope));
    } catch (error) {
      throw new StorageError(isQuotaError(error) ? 'quota' : 'unavailable', undefined, {
        cause: error,
      });
    }
    this.data = next;
    this.emit();
  }

  private read(): DataSnapshot {
    let text: string | null;
    try {
      text = this.storage.getItem(STORAGE_KEYS.data);
    } catch {
      return EMPTY;
    }
    if (text == null) return this.migrateLegacy();
    try {
      const { data, dropped } = sanitizeSnapshot(JSON.parse(text));
      if (dropped) {
        this.notice = `${dropped} saved ${dropped === 1 ? 'record was' : 'records were'} damaged and could not be loaded.`;
      }
      return data;
    } catch {
      this.quarantine(text);
      this.notice =
        'Your saved data could not be read, so the app started fresh. A copy of the old data was kept in this browser.';
      return EMPTY;
    }
  }

  /** Version 1 stored `{runs, notes}` under "gas.data.v1". */
  private migrateLegacy(): DataSnapshot {
    let legacy: string | null;
    try {
      legacy = this.storage.getItem(STORAGE_KEYS.legacyData);
    } catch {
      return EMPTY;
    }
    if (legacy == null) return EMPTY;
    let data: DataSnapshot;
    try {
      data = sanitizeSnapshot(JSON.parse(legacy)).data;
    } catch {
      this.quarantine(legacy);
      return EMPTY;
    }
    try {
      this.write(data);
      this.storage.removeItem(STORAGE_KEYS.legacyData);
    } catch {
      /* keep the legacy key; migration retries on the next load */
    }
    return data;
  }

  private quarantine(text: string): void {
    try {
      this.storage.setItem(`${STORAGE_KEYS.corruptPrefix}${Date.now()}`, text);
    } catch {
      /* nothing more we can do */
    }
  }
}
