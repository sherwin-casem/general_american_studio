export type StorageErrorCode =
  'quota' | 'forbidden' | 'unavailable' | 'revoked' | 'invalid' | 'unknown';

export class StorageError extends Error {
  readonly code: StorageErrorCode;

  constructor(code: StorageErrorCode, message?: string, options?: { cause?: unknown }) {
    super(message ?? code, options);
    this.name = 'StorageError';
    this.code = code;
  }
}

/** Maps browser and Claude database errors onto StorageError codes. */
export function toStorageError(error: unknown): StorageError {
  if (error instanceof StorageError) return error;
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
  switch (code) {
    case 'quota_exceeded':
    case 'resource_exhausted':
      return new StorageError('quota', undefined, { cause: error });
    case 'invalid_argument':
    case 'not_granted':
      return new StorageError('forbidden', undefined, { cause: error });
    case 'revoked':
      return new StorageError('revoked', undefined, { cause: error });
    case 'unavailable':
    case 'capability_disabled':
    case 'capability_removed':
      return new StorageError('unavailable', undefined, { cause: error });
    default:
      return new StorageError('unknown', undefined, { cause: error });
  }
}

export function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22)
  );
}

/** A message for the person, saying what happened and what to do. */
export function describeStorageError(error: unknown): string {
  switch (toStorageError(error).code) {
    case 'quota':
      return 'Storage is full. Export a backup, delete some old sessions or notes, then try again.';
    case 'forbidden':
      return 'This view can’t save changes. Ask the owner for Contributor access.';
    case 'revoked':
      return 'Saving was turned off for this view. Reload the page to try again.';
    case 'invalid':
      return 'That data isn’t valid, so nothing was saved.';
    case 'unavailable':
      return 'Saving isn’t available right now. Check your connection and try again.';
    default:
      return 'Couldn’t save. Check your connection and try again.';
  }
}
