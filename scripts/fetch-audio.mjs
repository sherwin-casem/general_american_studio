#!/usr/bin/env node
/**
 * Downloads real US English recordings for the words in the course from Wikimedia Commons.
 *
 *   npm run audio            fetch recordings for words that don't have one yet
 *   npm run audio -- --all   check every word again, replacing changed files
 *   npm run audio -- --dry   only report which words have recordings
 *
 * Files land in public/audio/words, and public/audio/manifest.json lists each word with its
 * speaker and license. Only freely licensed files are used (CC BY, CC BY-SA, CC0, public
 * domain). The app shows the credits on the Progress page.
 *
 * The original uploads are saved (mostly Ogg Vorbis, which Edge, Chrome and Firefox play; the app
 * checks support and uses the device voice where a format can't play).
 *
 * Wikimedia rate-limits automated downloads, so files are fetched one at a time and the pace
 * adapts to the server. The manifest is saved after every file: stop the script at any time
 * and run it again to continue. Set AUDIO_CONTACT (a URL or email) to identify yourself to
 * Wikimedia, as its User-Agent policy asks; identified clients are throttled less.
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { runnerImport } from 'vite';

const ROOT = resolve(import.meta.dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'audio');
const WORDS_DIR = join(OUT_DIR, 'words');
const MANIFEST = join(OUT_DIR, 'manifest.json');
const API = 'https://commons.wikimedia.org/w/api.php';
// Wikimedia asks automated clients to identify themselves with a descriptive User-Agent.
const CONTACT = process.env.AUDIO_CONTACT?.trim();
const USER_AGENT = `GeneralAmericanStudio-audio/2.0 (${CONTACT || 'pronunciation practice app'})`;
const FREE_LICENSE = /^(CC BY(-SA)? [\d.]+|CC0|Public domain)/i;
// The API takes at most 50 titles per request, and each word has up to 4 candidate titles.
const BATCH = 12;
// Wikimedia throttles fast clients: lookups are spaced out, and downloads run one at a time with
// a pause that grows when the server asks us to slow down and shrinks again as requests succeed.
const LOOKUP_DELAY_MS = 1000;
const MIN_DOWNLOAD_DELAY_MS = 500;
/** File types of original uploads that browsers can play, and the extension to save them with. */
const AUDIO_TYPES = {
  'application/ogg': 'ogg',
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3',
};
const MAX_DOWNLOAD_DELAY_MS = 30_000;
const MAX_ATTEMPTS = 8;
let downloadDelay = MIN_DOWNLOAD_DELAY_MS;

/**
 * Words spelled the same but said two ways (PREsent and preSENT, live and live). A recording
 * could play the wrong one, so these always use the device voice.
 */
const HETERONYMS = new Set([
  'address',
  'close',
  'conduct',
  'conflict',
  'content',
  'contract',
  'convert',
  'decrease',
  'desert',
  'estimate',
  'excuse',
  'export',
  'graduate',
  'import',
  'increase',
  'insult',
  'invalid',
  'lead',
  'live',
  'minute',
  'object',
  'permit',
  'perfect',
  'present',
  'produce',
  'progress',
  'project',
  'protest',
  'read',
  'rebel',
  'record',
  'refuse',
  'reject',
  'separate',
  'subject',
  'survey',
  'suspect',
  'tear',
  'transport',
  'upset',
  'use',
  'wind',
  'wound',
]);

const args = new Set(process.argv.slice(2));
const refreshAll = args.has('--all');
const dryRun = args.has('--dry');

const WORD = /^[A-Za-z]+(?:['-][A-Za-z]+)*$/;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Every single word the app can play: card words, pairs, stress words, drill cells, keywords. */
async function collectWords() {
  const { module: course } = await runnerImport('/src/content/course.ts', {
    root: ROOT,
    logLevel: 'error',
  });
  const { module: markup } = await runnerImport('/src/domain/markup.ts', {
    root: ROOT,
    logLevel: 'error',
  });
  const words = new Set();
  const add = (text) => {
    const word = markup
      .toSpeech(String(text))
      .trim()
      .replace(/[.,!?;:]+$/, '');
    if (WORD.test(word)) words.add(word.toLowerCase());
  };
  // Stress words seen with more than one stressed syllable are heteronyms too.
  const stressPatterns = new Map();
  const addStress = (w) => {
    const parsed = markup.parseStressWord(w);
    const key = parsed.text.toLowerCase();
    stressPatterns.set(key, new Set([...(stressPatterns.get(key) ?? []), parsed.stressIndex]));
    add(parsed.text);
  };
  // In path order, so a partial download covers the first lessons first.
  for (const lesson of course.LESSONS) {
    if (lesson.learn.kind === 'sounds') {
      for (const card of lesson.learn.sounds) for (const [word] of card.words) add(word);
    }
    if (lesson.learn.kind === 'stress') {
      for (const group of lesson.learn.groups) group.words.forEach(addStress);
    }
    for (const row of course.drillRows(lesson)) for (const cell of row.cells) add(cell);
    for (const pair of lesson.listen.pairs ?? []) pair.forEach(add);
    const quiz = course.resolveQuiz(lesson);
    if (quiz?.type === 'pairs') quiz.items.flat().forEach(add);
    if (quiz?.type === 'stress') quiz.items.forEach(addStress);
  }
  for (const sound of course.SOUNDS) add(sound.keyword);
  const ambiguous = [...stressPatterns].filter(([, set]) => set.size > 1).map(([w]) => w);
  const skip = new Set([...HETERONYMS, ...ambiguous]);
  return [...words].filter((w) => !skip.has(w));
}

/**
 * Lookup results are cached between runs (in node_modules/.cache, never committed), so an
 * interrupted download resumes straight away. `--all` ignores the cache.
 */
const LOOKUP_CACHE = join(
  ROOT,
  'node_modules',
  '.cache',
  'general-american-studio',
  'audio-lookup.json',
);

async function readLookupCache() {
  if (refreshAll) return {};
  try {
    return JSON.parse(await readFile(LOOKUP_CACHE, 'utf8'));
  } catch {
    return {};
  }
}

async function writeLookupCache(cache) {
  await mkdir(dirname(LOOKUP_CACHE), { recursive: true });
  await writeFile(LOOKUP_CACHE, JSON.stringify(cache));
}

async function api(params) {
  const url = new URL(API);
  for (const [k, v] of Object.entries({ format: 'json', formatversion: '2', ...params })) {
    url.searchParams.set(k, v);
  }
  const data = await (await request(url)).json();
  if (data.error) throw new Error(`Commons API: ${data.error.code}: ${data.error.info}`);
  return data;
}

async function request(url, attempt = 1) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (response.ok) {
    downloadDelay = Math.max(MIN_DOWNLOAD_DELAY_MS, Math.round(downloadDelay * 0.85));
    return response;
  }
  if ((response.status === 429 || response.status >= 500) && attempt < MAX_ATTEMPTS) {
    downloadDelay = Math.min(MAX_DOWNLOAD_DELAY_MS, downloadDelay * 2);
    const retryAfter = Number(response.headers.get('retry-after')) * 1000;
    await sleep(Math.max(retryAfter || 0, downloadDelay) + 500);
    return request(url, attempt + 1);
  }
  throw new Error(`${response.status} ${response.statusText} for ${url}`);
}

/** Commons reports some links as http:// or protocol-relative; serve them over https. */
const toHttps = (url) => url.replace(/^(?:https?:)?[/][/]/, 'https://');

const stripHtml = (s) =>
  String(s ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

/** Commons title candidates for a word, best first. */
function candidates(word) {
  const cap = word[0].toUpperCase() + word.slice(1);
  const forms = word === cap ? [word] : [word, cap];
  return forms.flatMap((w) => [`File:En-us-${w}.ogg`, `File:En-us-${w}.oga`]);
}

/** Looks up recordings for a batch of words. Returns word → recording info (without a file). */
async function lookup(words) {
  const titles = words.flatMap(candidates);
  const data = await api({
    action: 'query',
    redirects: '1',
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl',
    titles: titles.join('|'),
  });
  const alias = new Map();
  for (const n of [...(data.query?.normalized ?? []), ...(data.query?.redirects ?? [])]) {
    alias.set(n.to, alias.get(n.from) ?? n.from);
  }
  const pages = new Map();
  for (const page of data.query?.pages ?? []) {
    if (page.missing || !page.imageinfo?.[0]) continue;
    pages.set(page.title, page);
    const from = alias.get(page.title);
    if (from) pages.set(from, page);
  }
  const found = new Map();
  for (const word of words) {
    for (const title of candidates(word)) {
      const page = pages.get(title);
      if (!page) continue;
      const info = page.imageinfo[0];
      const meta = info.extmetadata ?? {};
      const license = stripHtml(meta.LicenseShortName?.value);
      if (!FREE_LICENSE.test(license)) continue;
      // The original upload, not Wikimedia's converted copies, which are heavily rate-limited.
      const ext = AUDIO_TYPES[info.mime];
      if (!ext || !info.url) continue;
      found.set(word, {
        src: info.url,
        ext,
        title: page.title,
        author: stripHtml(meta.Artist?.value) || 'Unknown',
        license,
        licenseUrl: toHttps(stripHtml(meta.LicenseUrl?.value)) || 'https://commons.wikimedia.org/',
        page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_')).replace(/%3A/g, ':')}`,
      });
      break;
    }
  }
  return found;
}

const slug = (word) => word.toLowerCase().replace(/[^a-z0-9-]/g, '_');

async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8'));
  } catch {
    return { words: {} };
  }
}

async function saveManifest(words, recorded) {
  const sorted = Object.fromEntries(
    Object.keys(recorded)
      .sort()
      .map((w) => [
        w,
        {
          ...recorded[w],
          licenseUrl: toHttps(recorded[w].licenseUrl),
          page: recorded[w].page.replace(/%3A/g, ':'),
        },
      ]),
  );
  const missing = words.filter((w) => !sorted[w]);
  const manifest = {
    source: 'Wikimedia Commons',
    generated: new Date().toISOString(),
    words: sorted,
    missing,
  };
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  return { sorted, missing };
}

const hasFile = (path) => existsSync(path) && statSync(path).size >= 500;

async function main() {
  const words = await collectWords();
  const previous = await readManifest();
  const kept = {};
  for (const word of words) {
    const entry = previous.words?.[word];
    if (!refreshAll && entry && existsSync(join(ROOT, 'public', entry.file))) kept[word] = entry;
  }
  const todo = words.filter((w) => !kept[w]);
  console.log(`${words.length} words in the course, ${Object.keys(kept).length} already recorded.`);
  const cache = await readLookupCache();
  const uncached = todo.filter((w) => !(w in cache));
  console.log(
    `Looking up ${uncached.length} words on Wikimedia Commons` +
      ` (${todo.length - uncached.length} known from an earlier run)…`,
  );
  for (let i = 0; i < uncached.length; i += BATCH) {
    const batch = uncached.slice(i, i + BATCH);
    const results = await lookup(batch);
    for (const word of batch) cache[word] = results.get(word) ?? null;
    await writeLookupCache(cache);
    process.stdout.write(`\r  ${Math.min(i + BATCH, uncached.length)}/${uncached.length}`);
    await sleep(LOOKUP_DELAY_MS);
  }
  process.stdout.write('\n');
  // In path order: the first lessons get their recordings first.
  const found = new Map(todo.filter((w) => cache[w]).map((w) => [w, cache[w]]));

  if (dryRun) {
    console.log(`Would download ${found.size} recordings.`);
    const missing = todo.filter((w) => !found.has(w));
    if (missing.length) console.log(`No recording: ${missing.join(', ')}`);
    return;
  }

  await mkdir(WORDS_DIR, { recursive: true });
  const recorded = { ...kept };
  let added = 0;
  let failed = 0;
  let done = 0;
  for (const [word, info] of found) {
    const { src, ext, ...meta } = info;
    let name = `${slug(word)}.${ext}`;
    const path = join(WORDS_DIR, name);
    done++;
    // A file left by an interrupted run is reused; its details come from the lookup above.
    // Earlier versions saved MP3 copies; those are kept too.
    const earlier = [name, `${slug(word)}.mp3`].find((n) => hasFile(join(WORDS_DIR, n)));
    if (!refreshAll && earlier) {
      name = earlier;
      recorded[word] = { file: `audio/words/${name}`, ...meta };
      continue;
    }
    try {
      const response = await request(src);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < 500 || bytes.length > 2_000_000) throw new Error('unexpected size');
      await writeFile(path, bytes);
      recorded[word] = { file: `audio/words/${name}`, ...meta };
      added++;
      await saveManifest(words, recorded);
    } catch (error) {
      failed++;
      console.warn(`\n  could not download "${word}": ${error.message}`);
    }
    const pause = (downloadDelay / 1000).toFixed(1);
    process.stdout.write(`\r  downloaded ${done}/${found.size} (pause ${pause}s)  `);
    await sleep(downloadDelay);
  }
  process.stdout.write('\n');
  const { sorted, missing } = await saveManifest(words, recorded);

  // Remove recordings for words no longer in the course.
  const used = new Set(Object.values(sorted).map((e) => e.file.split('/').pop()));
  let pruned = 0;
  for (const file of await readdir(WORDS_DIR)) {
    if (!used.has(file)) {
      await rm(join(WORDS_DIR, file));
      pruned++;
    }
  }

  const count = Object.keys(sorted).length;
  console.log(
    `Recorded: ${count} of ${words.length} words (${Math.round((count / words.length) * 100)}%).` +
      ` Added ${added}, removed ${pruned}${failed ? `, ${failed} failed (run again to retry)` : ''}.`,
  );
  if (missing.length) console.log(`No recording yet (device voice is used): ${missing.join(', ')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
