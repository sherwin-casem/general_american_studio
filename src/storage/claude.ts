/**
 * Claude account storage, used only when the app runs as a published claude.ai Artifact.
 * Records live under learners/<viewer id>/{runs,notes}; the artifact's access rules keep each
 * viewer's records private. Outside claude.ai `window.claude` does not exist and this is skipped.
 */
import { APP_ID } from '../content/course';
import { sanitizeNote, sanitizeRun } from '../domain/validation';
import { describeStorageError, toStorageError } from './errors';
import type {
  AdapterStatus,
  CheckIn,
  DataSnapshot,
  ImportResult,
  SessionRun,
  SoundNote,
  StorageAdapter,
} from './types';

interface DocSnapshot {
  id: string;
  data(): Record<string, unknown> | undefined;
}
interface QuerySnapshot {
  docs: DocSnapshot[];
  metadata: { fromCache: boolean };
}
interface DocRef {
  set(data: Record<string, unknown>): Promise<void>;
  update(data: Record<string, unknown>): Promise<void>;
  delete(): Promise<void>;
}
interface CollectionRef {
  doc(id?: string): DocRef;
  onSnapshot(next: (snap: QuerySnapshot) => void, error?: (e: unknown) => void): () => void;
}
export interface ClaudeDb {
  doc(path: string): DocRef;
  collection(path: string): CollectionRef;
}
export interface ClaudeUser {
  id(): Promise<string | null>;
  can(capability: string): Promise<boolean | null>;
}
export interface ClaudeRuntime {
  use(name: 'db'): Promise<ClaudeDb | null>;
  use(name: 'user'): Promise<ClaudeUser | null>;
}

export function getClaudeRuntime(): ClaudeRuntime | null {
  const candidate = (window as unknown as { claude?: { use?: unknown } }).claude;
  return candidate && typeof candidate.use === 'function' ? (candidate as ClaudeRuntime) : null;
}

const SEGMENT = /^[A-Za-z0-9_\-.~:@+]{1,200}$/;
const LOAD_TIMEOUT_MS = 10_000;

function withoutId<T extends { id: string }>(record: T): Omit<T, 'id'> {
  const { id: _id, ...body } = record;
  return body;
}

export class ClaudeAccountAdapter implements StorageAdapter {
  readonly mode = 'account' as const;
  private chain: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly db: ClaudeDb,
    private readonly uid: string,
  ) {}

  private get base(): string {
    return `learners/${this.uid}`;
  }

  subscribe(
    onData: (data: DataSnapshot) => void,
    onStatus: (status: AdapterStatus) => void,
  ): () => void {
    let runs: SessionRun[] = [];
    let notes: SoundNote[] = [];
    const loaded = { runs: false, notes: false };
    onStatus({ phase: 'connecting' });

    const timer = window.setTimeout(() => {
      if (!loaded.runs || !loaded.notes) {
        onStatus({ phase: 'stale', notice: 'Your saved progress can’t be reached yet.' });
      }
    }, LOAD_TIMEOUT_MS);
    const markLoaded = (key: keyof typeof loaded, snap: QuerySnapshot) => {
      if (loaded[key] || snap.metadata.fromCache) return;
      loaded[key] = true;
      if (loaded.runs && loaded.notes) {
        window.clearTimeout(timer);
        onStatus({ phase: 'ready' });
      }
    };
    const fail = (error: unknown) => {
      window.clearTimeout(timer);
      onStatus({ phase: 'error', notice: describeStorageError(error) });
    };

    const stopRuns = this.db.collection(`${this.base}/runs`).onSnapshot((snap) => {
      runs = snap.docs
        .map((d) => sanitizeRun(d.data(), d.id))
        .filter((r): r is SessionRun => r !== null);
      markLoaded('runs', snap);
      onData({ runs, notes });
    }, fail);
    const stopNotes = this.db.collection(`${this.base}/notes`).onSnapshot((snap) => {
      notes = snap.docs
        .map((d) => sanitizeNote(d.data(), d.id))
        .filter((n): n is SoundNote => n !== null);
      markLoaded('notes', snap);
      onData({ runs, notes });
    }, fail);

    return () => {
      window.clearTimeout(timer);
      stopRuns();
      stopNotes();
    };
  }

  /** Serializes writes: the store asks for one write at a time per document. */
  private write<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.chain.then(operation);
    this.chain = result.catch(() => undefined);
    return result.catch((error: unknown) => {
      throw toStorageError(error);
    });
  }

  /** Records the viewer's profile document so their data can be found later. */
  private touch(): void {
    void this.write(() =>
      this.db.doc(this.base).set({ lastActive: new Date().toISOString(), app: APP_ID }),
    ).catch(() => undefined);
  }

  private doc(kind: 'runs' | 'notes', id: string): DocRef {
    return this.db.collection(`${this.base}/${kind}`).doc(id);
  }

  async saveSession(run: SessionRun, note: SoundNote | null): Promise<void> {
    await this.write(async () => {
      await this.doc('runs', run.id).set(withoutId(run));
      if (note) await this.doc('notes', note.id).set(withoutId(note));
    });
    this.touch();
  }

  async saveNote(note: SoundNote): Promise<void> {
    await this.write(() => this.doc('notes', note.id).set(withoutId(note)));
    this.touch();
  }

  async updateNoteChecks(id: string, checks: CheckIn[]): Promise<void> {
    await this.write(() => this.doc('notes', id).update({ checks }));
  }

  async removeRun(id: string): Promise<void> {
    await this.write(() => this.doc('runs', id).delete());
  }

  async removeNote(id: string): Promise<void> {
    await this.write(() => this.doc('notes', id).delete());
  }

  async importRecords(incoming: DataSnapshot): Promise<ImportResult> {
    // Ids are client-generated, so re-importing the same backup overwrites rather than duplicates.
    await this.write(async () => {
      for (const run of incoming.runs) await this.doc('runs', run.id).set(withoutId(run));
      for (const note of incoming.notes) await this.doc('notes', note.id).set(withoutId(note));
    });
    this.touch();
    return { added: incoming.runs.length + incoming.notes.length, skipped: 0 };
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: number | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = window.setTimeout(() => resolve(null), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    window.clearTimeout(timer);
  }
}

/** Connects to Claude account storage, or resolves null when it is not available or not allowed. */
export async function connectClaudeStorage(timeoutMs = 12_000): Promise<StorageAdapter | null> {
  const runtime = getClaudeRuntime();
  if (!runtime) return null;
  try {
    const services = await withTimeout(
      Promise.all([runtime.use('db'), runtime.use('user')]),
      timeoutMs,
    );
    if (!services) return null;
    const [db, user] = services;
    if (!db || !user) return null;
    const uid = await user.id();
    if (!uid || !SEGMENT.test(uid)) return null;
    const canWrite = await user.can('data.write').catch(() => null);
    if (canWrite === false) return null;
    return new ClaudeAccountAdapter(db, uid);
  } catch {
    return null;
  }
}
