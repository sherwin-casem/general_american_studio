/** In-memory implementation of the Web Storage interface, used when localStorage is blocked. */
export class MemoryStorage implements Storage {
  private readonly items = new Map<string, string>();

  get length(): number {
    return this.items.size;
  }

  clear(): void {
    this.items.clear();
  }

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.items.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.items.delete(key);
  }

  setItem(key: string, value: string): void {
    this.items.set(key, String(value));
  }
}

/** Returns localStorage when it can actually be written to, otherwise null. */
export function usableLocalStorage(): Storage | null {
  try {
    const storage = window.localStorage;
    const probe = 'gas:v2:probe';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}
