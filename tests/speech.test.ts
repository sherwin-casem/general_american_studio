import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bestVoice, SpeechService, voiceScore } from '../src/services/speech';

/** Voice names in the order Edge on Windows lists them. */
const EDGE_VOICES = [
  'Microsoft David - English (United States)',
  'Microsoft Mark - English (United States)',
  'Microsoft Zira - English (United States)',
  'Microsoft Ava Multilingual Online (Natural) - English (United States)',
  'Microsoft Ava Online (Natural) - English (United States)',
  'Microsoft Jenny Online (Natural) - English (United States)',
];

/** A window whose speech engine has these voices. Write `name@lang` for a non-US voice. */
function fakeWindow(names: string[]): Window {
  const voices = names.map((entry) => {
    const [name = entry, lang = 'en-US'] = entry.split('@');
    return { name, lang, voiceURI: name };
  });
  return {
    speechSynthesis: { getVoices: () => voices, addEventListener: () => {} },
    SpeechSynthesisUtterance: function SpeechSynthesisUtterance() {},
  } as unknown as Window;
}

describe('voice choice', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('ranks neural voices above the older system voices', () => {
    expect(voiceScore('Microsoft Aria Online (Natural) - English (United States)')).toBeGreaterThan(
      voiceScore('Google US English'),
    );
    expect(voiceScore('Google US English')).toBeGreaterThan(voiceScore('Samantha'));
    expect(voiceScore('Samantha')).toBeGreaterThan(voiceScore('Microsoft Zira'));
    expect(voiceScore('Microsoft Zira')).toBeGreaterThan(voiceScore('Microsoft David'));
  });

  it('prefers an en-US-only voice over a multilingual one', () => {
    expect(bestVoice(EDGE_VOICES.map((name) => ({ name })))?.name).toBe(
      'Microsoft Ava Online (Natural) - English (United States)',
    );
  });

  it('keeps the browser order on a tie and handles an empty list', () => {
    expect(bestVoice([{ name: 'A' }, { name: 'B' }])?.name).toBe('A');
    expect(bestVoice([])).toBeUndefined();
  });

  it('picks the best voice by default, not the first preferred-looking one', () => {
    const speech = new SpeechService(() => {}, null, fakeWindow(EDGE_VOICES));
    speech.init();
    expect(speech.status().selected).toBe(
      'Microsoft Ava Online (Natural) - English (United States)',
    );
  });

  it('keeps a voice the learner chose', () => {
    const zira = 'Microsoft Zira - English (United States)';
    const speech = new SpeechService(() => {}, zira, fakeWindow(EDGE_VOICES));
    speech.init();
    expect(speech.status().selected).toBe(zira);
  });

  it('only offers American voices when there are any', () => {
    const speech = new SpeechService(() => {}, null, fakeWindow(['Daniel@en-GB', 'Alex']));
    speech.init();
    expect(speech.status().voices.map((v) => v.name)).toEqual(['Alex']);
  });
});
