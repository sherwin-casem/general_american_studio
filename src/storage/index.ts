import { connectClaudeStorage } from './claude';
import { LocalStorageAdapter } from './local';
import { MemoryStorage, usableLocalStorage } from './memory-storage';
import type { StorageAdapter } from './types';

export type { StorageAdapter } from './types';

/**
 * Picks the best available storage:
 * 1. the Claude account, when running as a published claude.ai Artifact;
 * 2. this browser's localStorage;
 * 3. memory only (nothing survives a reload), when storage is blocked.
 */
export async function createStorage(): Promise<StorageAdapter> {
  const account = await connectClaudeStorage();
  if (account) return account;
  const local = usableLocalStorage();
  if (local) return new LocalStorageAdapter(local, window);
  return new LocalStorageAdapter(new MemoryStorage(), undefined, 'memory');
}
