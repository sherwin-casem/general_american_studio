/**
 * Plays single words as real recordings by native speakers, and everything else with the
 * device's speech voice.
 *
 * Recordings come from Wikimedia Commons (US English pronunciations, mostly recorded for
 * Wiktionary). `npm run audio` downloads them into public/audio and writes the manifest this
 * service reads. Without a manifest, or for a word with no recording, the device voice is used.
 */
import type { AudioStatus } from '../state/app-state';
import type { SpeakOptions, SpeechService } from './speech';

export interface Recording {
  /** Path relative to the app root, for example "audio/words/think.mp3". */
  file: string;
  /** Commons file title, for example "File:En-us-think.ogg". */
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  /** Commons page of the file. */
  page: string;
}

export interface AudioManifest {
  source: string;
  generated: string;
  /** Keyed by lowercase word. */
  words: Record<string, Recording>;
}

export type AudioSource = 'recording' | 'voice';

const WORD = /^[a-z]+(?:['’-][a-z]+)*$/i;

/** The manifest key for a text, or null when it is not a single word. */
export function recordingKey(text: string): string | null {
  const word = text.trim().replace(/[.,!?;:]+$/, '');
  return WORD.test(word) ? word.toLowerCase().replace(/’/g, "'") : null;
}

const SAFE_FILE = /^audio\/[A-Za-z0-9_\-/]+\.(mp3|ogg|oga|m4a|wav)$/;
const isText = (v: unknown, max = 500): v is string => typeof v === 'string' && v.length <= max;
/** Web links only: never javascript:, data: or other schemes. */
const WEB_URL = /^https?:\/\/[^\s"<>]+$/;
const isWebUrl = (v: unknown): v is string => isText(v) && WEB_URL.test(v);

/** Validates a manifest from the network. Entries that are not well-formed are dropped. */
export function parseManifest(raw: unknown): AudioManifest | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.words !== 'object' || r.words === null) return null;
  const words: Record<string, Recording> = {};
  for (const [key, value] of Object.entries(r.words as Record<string, unknown>)) {
    if (recordingKey(key) !== key || typeof value !== 'object' || value === null) continue;
    const v = value as Record<string, unknown>;
    if (!isText(v.file) || !SAFE_FILE.test(v.file) || v.file.includes('..')) continue;
    if (![v.title, v.author, v.license].every((x) => isText(x))) continue;
    if (!isWebUrl(v.licenseUrl) || !isWebUrl(v.page)) continue;
    words[key] = {
      file: v.file,
      title: v.title as string,
      author: v.author as string,
      license: v.license as string,
      licenseUrl: v.licenseUrl as string,
      page: v.page as string,
    };
  }
  return {
    source: isText(r.source, 200) ? r.source : 'Wikimedia Commons',
    generated: isText(r.generated, 40) ? r.generated : '',
    words,
  };
}

export interface AudioServiceOptions {
  recordings: boolean;
  /** Where the app is served from; recordings and the manifest are resolved against it. */
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  createAudio?: (src: string) => HTMLAudioElement;
  /** Whether this browser can play a MIME type. Defaults to asking an <audio> element. */
  canPlay?: (type: string) => boolean;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  oga: 'audio/ogg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
};

/** Asks an <audio> element once per type. Most browsers play Ogg; some Safari versions don't. */
function browserCanPlay(): (type: string) => boolean {
  const known = new Map<string, boolean>();
  return (type) => {
    let result = known.get(type);
    if (result === undefined) {
      try {
        result = document.createElement('audio').canPlayType(type) !== '';
      } catch {
        result = false;
      }
      known.set(type, result);
    }
    return result;
  };
}

export class AudioService {
  private manifest: AudioManifest | null = null;
  private phase: AudioStatus['phase'] = 'loading';
  private recordings: boolean;
  private playing: HTMLAudioElement | null = null;
  private playId = 0;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch | undefined;
  private readonly createAudio: (src: string) => HTMLAudioElement;
  private readonly canPlay: (type: string) => boolean;

  constructor(
    private readonly speech: SpeechService,
    private readonly onChange: (status: AudioStatus) => void,
    options: AudioServiceOptions,
  ) {
    this.recordings = options.recordings;
    this.baseUrl = options.baseUrl ?? document.baseURI;
    // Browsers throw "Illegal invocation" when fetch is called as a method of another object,
    // so the global is wrapped instead of stored.
    this.fetchImpl =
      options.fetchImpl ??
      (typeof fetch === 'function' ? (input, init) => fetch(input, init) : undefined);
    this.createAudio = options.createAudio ?? ((src) => new Audio(src));
    this.canPlay = options.canPlay ?? browserCanPlay();
  }

  /** Whether this browser can play the file's format. */
  private playable(recording: Recording): boolean {
    const type = MIME_BY_EXTENSION[recording.file.split('.').pop() ?? ''];
    return type !== undefined && this.canPlay(type);
  }

  status(): AudioStatus {
    return {
      recordings: this.recordings,
      phase: this.phase,
      count: Object.values(this.manifest?.words ?? {}).filter((r) => this.playable(r)).length,
    };
  }

  async load(): Promise<void> {
    try {
      if (!this.fetchImpl) throw new Error('fetch is not available');
      const response = await this.fetchImpl(new URL('audio/manifest.json', this.baseUrl).href);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.manifest = parseManifest(await response.json());
      this.phase = this.manifest ? 'ready' : 'missing';
    } catch {
      this.manifest = null;
      this.phase = 'missing';
    }
    this.onChange(this.status());
  }

  setRecordings(on: boolean): void {
    this.recordings = on;
    this.onChange(this.status());
  }

  /** A recording of a single word that this browser can play, regardless of the setting. */
  recordingFor(text: string): Recording | null {
    const key = recordingKey(text);
    const recording = (key && this.manifest?.words[key]) || null;
    return recording && this.playable(recording) ? recording : null;
  }

  /** Whether `say` would play a real recording for this text. */
  willUseRecording(text: string): boolean {
    return this.recordings && this.recordingFor(text) !== null;
  }

  /**
   * One source for a set of words that are compared with each other, such as an ear-test pair.
   * Recordings are used only when every word has one by the same, named speaker; otherwise a
   * voice difference could give the answer away.
   */
  sourceFor(words: readonly string[]): AudioSource {
    if (!this.recordings || !words.length) return 'voice';
    const authors = words.map((w) => this.recordingFor(w)?.author ?? null);
    const first = authors[0];
    const known = first !== null && first !== undefined && first !== 'Unknown';
    return known && authors.every((a) => a === first) ? 'recording' : 'voice';
  }

  /** All recordings, sorted by word, for the credits list. */
  credits(): [word: string, recording: Recording][] {
    return Object.entries(this.manifest?.words ?? {}).sort((a, b) => a[0].localeCompare(b[0]));
  }

  /** Plays a word recording when there is one (and recordings are on), else speaks the text. */
  say(text: string, options: SpeakOptions & { source?: AudioSource } = {}): AudioSource {
    const source = options.source ?? (this.willUseRecording(text) ? 'recording' : 'voice');
    const recording = source === 'recording' ? this.recordingFor(text) : null;
    this.stop();
    if (!recording) {
      this.speech.speak(text, options);
      return 'voice';
    }
    const id = ++this.playId;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (id === this.playId) this.playing = null;
      options.onEnd?.();
    };
    let audio: HTMLAudioElement;
    try {
      audio = this.createAudio(new URL(recording.file, this.baseUrl).href);
    } catch {
      this.speech.speak(text, options);
      return 'voice';
    }
    this.playing = audio;
    audio.addEventListener('ended', finish, { once: true });
    // A missing file or a failed load (offline, for example) falls back to the device voice.
    audio.addEventListener(
      'error',
      () => {
        if (id !== this.playId || finished) return;
        finished = true;
        this.playing = null;
        this.speech.speak(text, options);
      },
      { once: true },
    );
    const played = audio.play();
    if (played && typeof played.catch === 'function') {
      played.catch(() => {
        if (id !== this.playId || finished) return;
        finished = true;
        this.playing = null;
        this.speech.speak(text, options);
      });
    }
    return 'recording';
  }

  stop(): void {
    this.playId++;
    if (this.playing) {
      try {
        this.playing.pause();
      } catch {
        /* already stopped */
      }
      this.playing = null;
    }
    this.speech.stop();
  }
}
