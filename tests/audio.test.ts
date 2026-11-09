import { describe, expect, it, vi } from 'vitest';
import { AudioService, parseManifest, recordingKey, type Recording } from '../src/services/audio';
import type { SpeechService } from '../src/services/speech';
import { settle } from './fixtures';

const rec = (word: string, author = 'Speaker A'): Recording => ({
  file: `audio/words/${word}.mp3`,
  title: `File:En-us-${word}.ogg`,
  author,
  license: 'CC BY-SA 3.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  page: `https://commons.wikimedia.org/wiki/File:En-us-${word}.ogg`,
});

function fakeSpeech() {
  return { speak: vi.fn(), stop: vi.fn() } as unknown as SpeechService & {
    speak: ReturnType<typeof vi.fn>;
  };
}

/** A fake <audio> that succeeds or fails to play. */
function fakeAudio(outcome: 'ends' | 'fails') {
  const created: string[] = [];
  const createAudio = (src: string) => {
    created.push(src);
    const target = new EventTarget();
    const element = Object.assign(target, {
      play: () => {
        setTimeout(() => target.dispatchEvent(new Event(outcome === 'ends' ? 'ended' : 'error')));
        return Promise.resolve();
      },
      pause: vi.fn(),
    });
    return element as unknown as HTMLAudioElement;
  };
  return { created, createAudio };
}

async function loaded(words: Record<string, Recording>, options = {}) {
  const speech = fakeSpeech();
  const audio = new AudioService(speech, () => {}, {
    recordings: true,
    baseUrl: 'https://example.test/app/',
    canPlay: () => true,
    fetchImpl: (async () =>
      new Response(
        JSON.stringify({ source: 'Wikimedia Commons', generated: '', words }),
      )) as typeof fetch,
    ...options,
  });
  await audio.load();
  return { audio, speech };
}

describe('recordingKey', () => {
  it('accepts single words and normalizes them', () => {
    expect(recordingKey('Think')).toBe('think');
    expect(recordingKey('three.')).toBe('three');
    expect(recordingKey('who’d')).toBe("who'd");
    expect(recordingKey('well-known')).toBe('well-known');
  });

  it('rejects phrases and sentences', () => {
    expect(recordingKey('get ready')).toBeNull();
    expect(recordingKey('Are you ready?')).toBeNull();
    expect(recordingKey('')).toBeNull();
  });
});

describe('parseManifest', () => {
  it('keeps well-formed entries', () => {
    const manifest = parseManifest({ words: { think: rec('think') } });
    expect(manifest?.words.think).toEqual(rec('think'));
  });

  it('drops entries with unsafe paths, links or keys', () => {
    const manifest = parseManifest({
      words: {
        a: { ...rec('a'), file: '../secret.mp3' },
        b: { ...rec('b'), file: 'https://evil.test/b.mp3' },
        c: { ...rec('c'), page: 'javascript:alert(1)' },
        d: { ...rec('d'), licenseUrl: 'data:text/html,<b>hi</b>' },
        'Two Words': rec('two'),
        ok: rec('ok'),
      },
    });
    expect(Object.keys(manifest?.words ?? {})).toEqual(['ok']);
  });

  it('accepts plain http license links, as Commons reports some that way', () => {
    const http = { ...rec('cc'), licenseUrl: 'http://creativecommons.org/licenses/by-sa/3.0/' };
    expect(parseManifest({ words: { cc: http } })?.words.cc).toEqual(http);
  });

  it('rejects anything that is not a manifest', () => {
    expect(parseManifest(null)).toBeNull();
    expect(parseManifest({ words: 'nope' })).toBeNull();
  });
});

describe('AudioService', () => {
  it('reports the number of recordings once loaded', async () => {
    const { audio } = await loaded({ think: rec('think'), three: rec('three') });
    expect(audio.status()).toEqual({ recordings: true, phase: 'ready', count: 2 });
  });

  it('calls the global fetch the way browsers require', async () => {
    // Like a real browser: fetch must not be called as a method of another object.
    const browserFetch = vi.fn(function (this: unknown) {
      if (this !== undefined && this !== globalThis) throw new TypeError('Illegal invocation');
      return Promise.resolve(new Response(JSON.stringify({ words: { think: rec('think') } })));
    });
    vi.stubGlobal('fetch', browserFetch);
    try {
      const audio = new AudioService(fakeSpeech(), () => {}, {
        recordings: true,
        baseUrl: 'https://example.test/',
        canPlay: () => true,
      });
      await audio.load();
      expect(browserFetch).toHaveBeenCalledWith(
        'https://example.test/audio/manifest.json',
        undefined,
      );
      expect(audio.status()).toEqual({ recordings: true, phase: 'ready', count: 1 });
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('works without a manifest, using the device voice', async () => {
    const speech = fakeSpeech();
    const audio = new AudioService(speech, () => {}, {
      recordings: true,
      fetchImpl: (async () => new Response('', { status: 404 })) as typeof fetch,
      baseUrl: 'https://example.test/',
    });
    await audio.load();
    expect(audio.status().phase).toBe('missing');
    expect(audio.say('think')).toBe('voice');
    expect(speech.speak).toHaveBeenCalledWith('think', {});
  });

  it('plays a recording for a word, and the device voice for a sentence', async () => {
    const { created, createAudio } = fakeAudio('ends');
    const { audio, speech } = await loaded({ think: rec('think') }, { createAudio });
    const onEnd = vi.fn();
    expect(audio.say('think', { onEnd })).toBe('recording');
    expect(created).toEqual(['https://example.test/app/audio/words/think.mp3']);
    await settle();
    expect(onEnd).toHaveBeenCalledTimes(1);

    expect(audio.say('I think so.')).toBe('voice');
    expect(speech.speak).toHaveBeenCalledWith('I think so.', {});
  });

  it('falls back to the device voice when a recording fails to load', async () => {
    const { createAudio } = fakeAudio('fails');
    const { audio, speech } = await loaded({ think: rec('think') }, { createAudio });
    audio.say('think', { rate: 0.8 });
    await settle();
    expect(speech.speak).toHaveBeenCalledWith('think', expect.objectContaining({ rate: 0.8 }));
  });

  it('uses the device voice when the learner turns recordings off', async () => {
    const { created, createAudio } = fakeAudio('ends');
    const { audio } = await loaded({ think: rec('think') }, { createAudio });
    audio.setRecordings(false);
    expect(audio.willUseRecording('think')).toBe(false);
    expect(audio.say('think')).toBe('voice');
    expect(created).toEqual([]);
  });

  it('skips recordings in a format this browser cannot play', async () => {
    const { created, createAudio } = fakeAudio('ends');
    const { audio } = await loaded(
      { think: { ...rec('think'), file: 'audio/words/think.ogg' }, three: rec('three') },
      { createAudio, canPlay: (type: string) => type === 'audio/mpeg' },
    );
    expect(audio.status().count).toBe(1);
    expect(audio.willUseRecording('think')).toBe(false);
    expect(audio.say('think')).toBe('voice');
    expect(audio.say('three')).toBe('recording');
    expect(created).toEqual(['https://example.test/app/audio/words/three.mp3']);
  });

  it('uses recordings for an ear-test pair only when one speaker recorded both words', async () => {
    const { audio } = await loaded({
      ship: rec('ship', 'A'),
      sheep: rec('sheep', 'A'),
      chip: rec('chip', 'B'),
    });
    expect(audio.sourceFor(['ship', 'sheep'])).toBe('recording');
    expect(audio.sourceFor(['ship', 'chip'])).toBe('voice');
    expect(audio.sourceFor(['ship', 'cheap'])).toBe('voice');
  });

  it('never treats two recordings with no named speaker as the same speaker', async () => {
    const { audio } = await loaded({
      bin: rec('bin', 'Unknown'),
      pin: rec('pin', 'Unknown'),
    });
    expect(audio.sourceFor(['bin', 'pin'])).toBe('voice');
  });

  it('lists credits sorted by word', async () => {
    const { audio } = await loaded({ think: rec('think'), ant: rec('ant') });
    expect(audio.credits().map(([word]) => word)).toEqual(['ant', 'think']);
  });
});
