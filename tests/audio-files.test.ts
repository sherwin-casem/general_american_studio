/**
 * Guards the downloaded recordings (`npm run audio`): every manifest entry must pass the app's
 * own validation and point to a file that exists. Skipped when no recordings are installed.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseManifest } from '../src/services/audio';

const MANIFEST = resolve(process.cwd(), 'public/audio/manifest.json');
const installed = existsSync(MANIFEST);

describe.skipIf(!installed)('installed recordings', () => {
  const raw = installed ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : { words: {} };
  const manifest = parseManifest(raw);

  it('is a manifest the app accepts in full', () => {
    expect(manifest).not.toBeNull();
    expect(Object.keys(manifest?.words ?? {})).toEqual(Object.keys(raw.words));
  });

  it('points every word to a real audio file', () => {
    for (const [word, recording] of Object.entries(manifest?.words ?? {})) {
      const path = resolve(process.cwd(), 'public', recording.file);
      expect(existsSync(path), word).toBe(true);
      expect(statSync(path).size, word).toBeGreaterThan(500);
    }
  });

  it('credits a speaker and a free license for every recording', () => {
    for (const [word, r] of Object.entries(manifest?.words ?? {})) {
      expect(r.author.trim(), word).not.toBe('');
      expect(r.license, word).toMatch(/^(CC BY(-SA)? [\d.]+|CC0|Public domain)/i);
    }
  });

  it('leaves out words with two pronunciations', () => {
    for (const word of ['present', 'record', 'live', 'minute', 'object']) {
      expect(manifest?.words[word], word).toBeUndefined();
    }
  });
});
