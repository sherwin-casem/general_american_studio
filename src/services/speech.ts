/**
 * Text-to-speech through the browser's speechSynthesis.
 *
 * Handles the usual cross-browser problems:
 * - voices load asynchronously (voiceschanged), and some browsers never fire the event;
 * - iOS Safari only plays speech started inside a user gesture, so the first speak() is synchronous;
 * - Chrome can drop utterances that are garbage collected, or never fire `end`, so utterances are
 *   kept referenced and `onEnd` has a safety timeout.
 */
import type { SpeechStatus, VoiceOption } from '../state/app-state';

/**
 * How good a voice usually sounds, highest first. Neural voices (Edge "Natural", Chrome "Google")
 * beat the older system voices. A voice that matches nothing scores 0.
 */
const VOICE_QUALITY: readonly [RegExp, number][] = [
  [/Natural/i, 100],
  [/Google US English/i, 90],
  [/Samantha|Ava|Allison|Aria|Jenny|Guy/i, 50],
  [/Zira|Alex/i, 10],
];

export function voiceScore(name: string): number {
  let score = VOICE_QUALITY.find(([pattern]) => pattern.test(name))?.[1] ?? 0;
  // Multilingual voices can drift from the American accent, so prefer the en-US-only voice.
  if (/Multilingual/i.test(name)) score -= 5;
  return score;
}

/** The best-sounding voice; on a tie the first one in the browser's order wins. */
export function bestVoice<T extends { name: string }>(voices: readonly T[]): T | undefined {
  let best: T | undefined;
  for (const voice of voices) {
    if (!best || voiceScore(voice.name) > voiceScore(best.name)) best = voice;
  }
  return best;
}

export interface SpeakOptions {
  rate?: number;
  onEnd?: () => void;
}

export class SpeechService {
  private readonly synth: SpeechSynthesis | null;
  private voices: SpeechSynthesisVoice[] = [];
  private selected: SpeechSynthesisVoice | null = null;
  private checked = false;
  private sequence = 0;
  private readonly alive = new Set<SpeechSynthesisUtterance>();

  constructor(
    private readonly onChange: (status: SpeechStatus) => void,
    private preferredVoice: string | null = null,
    win: Window = window,
  ) {
    const hasUtterance =
      typeof (win as Window & { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance ===
      'function';
    this.synth = 'speechSynthesis' in win && hasUtterance ? win.speechSynthesis : null;
  }

  get supported(): boolean {
    return this.synth !== null;
  }

  init(): void {
    if (!this.synth) {
      this.checked = true;
      this.publish();
      return;
    }
    const load = () => this.loadVoices();
    load();
    if (typeof this.synth.addEventListener === 'function') {
      this.synth.addEventListener('voiceschanged', load);
    } else {
      this.synth.onvoiceschanged = load;
    }
    window.setTimeout(() => {
      this.checked = true;
      this.publish();
    }, 2500);
  }

  status(): SpeechStatus {
    return {
      supported: this.supported,
      checked: this.checked,
      voices: this.voices.map((v): VoiceOption => ({ id: v.voiceURI, name: v.name })),
      selected: this.selected?.voiceURI ?? null,
    };
  }

  selectVoice(id: string): void {
    const voice = this.voices.find((v) => v.voiceURI === id);
    if (!voice) return;
    this.selected = voice;
    this.preferredVoice = id;
    this.publish();
  }

  speak(text: string, { rate = 0.9, onEnd }: SpeakOptions = {}): void {
    if (!this.synth || !text) {
      onEnd?.();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    if (this.selected) utterance.voice = this.selected;
    utterance.rate = rate;

    let finished = false;
    const words = text.split(/\s+/).length;
    const safety = window.setTimeout(finish, (words / (2.5 * rate)) * 1000 + 4000);
    function finish() {
      if (finished) return;
      finished = true;
      window.clearTimeout(safety);
      onEnd?.();
    }
    utterance.onend = () => {
      this.alive.delete(utterance);
      finish();
    };
    utterance.onerror = () => {
      this.alive.delete(utterance);
      finish();
    };
    this.alive.add(utterance);

    const synth = this.synth;
    if (synth.speaking || synth.pending) {
      synth.cancel();
      // Chrome ignores a speak() issued in the same tick as cancel().
      window.setTimeout(() => synth.speak(utterance), 60);
    } else {
      synth.speak(utterance);
    }
  }

  /** Stops speech and any running sequence. */
  stop(): void {
    this.sequence++;
    try {
      this.synth?.cancel();
    } catch {
      /* ignore */
    }
  }

  /** Speaks lines one after another. `onLine` gets the current index, then -1 when finished. */
  playSequence(lines: readonly string[], rate: number, onLine: (index: number) => void): void {
    this.stop();
    const id = this.sequence;
    let index = 0;
    const next = () => {
      if (id !== this.sequence) return;
      if (index >= lines.length) {
        onLine(-1);
        return;
      }
      onLine(index);
      const line = lines[index++] ?? '';
      this.speak(line, {
        rate,
        onEnd: () => {
          if (id === this.sequence) window.setTimeout(next, 420);
        },
      });
    };
    next();
  }

  private loadVoices(): void {
    if (!this.synth) return;
    let all: SpeechSynthesisVoice[];
    try {
      all = this.synth.getVoices() ?? [];
    } catch {
      all = [];
    }
    let american = all.filter((v) => /^en[-_]US/i.test(v.lang));
    if (!american.length) american = all.filter((v) => /^en/i.test(v.lang));
    this.voices = american;
    this.selected =
      american.find((v) => v.voiceURI === this.preferredVoice) ?? bestVoice(american) ?? null;
    if (all.length) this.checked = true;
    this.publish();
  }

  private publish(): void {
    this.onChange(this.status());
  }
}
