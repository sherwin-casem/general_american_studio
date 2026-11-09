/** Export and import of practice data as a JSON backup file. */
import { APP_ID } from '../content/course';
import { sanitizeSnapshot } from '../domain/validation';
import { SCHEMA_VERSION } from './local';
import type { DataSnapshot } from './types';

export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

export interface BackupFile {
  app: typeof APP_ID;
  schemaVersion: number;
  exportedAt: string;
  runs: DataSnapshot['runs'];
  notes: DataSnapshot['notes'];
}

export function createBackup(data: DataSnapshot, now = new Date()): string {
  const file: BackupFile = {
    app: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    runs: data.runs,
    notes: data.notes,
  };
  return JSON.stringify(file, null, 2);
}

export function backupFileName(now = new Date()): string {
  return `general-american-studio-backup-${now.toISOString().slice(0, 10)}.json`;
}

export type ParsedBackup =
  { ok: true; data: DataSnapshot; dropped: number } | { ok: false; error: string };

/** Accepts backups from this version and plain `{runs, notes}` data from version 1. */
export function parseBackup(text: string): ParsedBackup {
  if (text.length > MAX_BACKUP_BYTES)
    return { ok: false, error: 'That file is too large to be a backup.' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      ok: false,
      error: 'That file isn’t valid JSON. Choose a backup exported from this app.',
    };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: 'That file isn’t a backup from this app.' };
  }
  const record = parsed as Record<string, unknown>;
  if ('app' in record && record.app !== APP_ID) {
    return { ok: false, error: 'That backup is from a different app.' };
  }
  if (typeof record.schemaVersion === 'number' && record.schemaVersion > SCHEMA_VERSION) {
    return {
      ok: false,
      error: 'That backup is from a newer version of the app. Update the app first.',
    };
  }
  if (!Array.isArray(record.runs) && !Array.isArray(record.notes)) {
    return { ok: false, error: 'That file has no sessions or notes in it.' };
  }
  const { data, dropped } = sanitizeSnapshot(record);
  return { ok: true, data, dropped };
}

/** Saves text as a file through a temporary download link. */
export function downloadText(text: string, fileName: string, type = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
