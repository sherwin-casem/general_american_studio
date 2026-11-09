/** Small reusable pieces of markup. */
import { RATING_LABELS } from '../content/course';
import { parseStressWord, renderMarkup, toSpeech } from '../domain/markup';
import type { Rating } from '../storage/types';
import { html, type SafeHtml } from './html';
import { ICONS } from './icons';

export interface SayOptions {
  className?: string;
  rate?: number;
  key?: string;
  ariaLabel?: string;
}

/** A button that speaks `text` (course markup allowed). */
export function sayButton(
  text: string,
  label: SafeHtml | string,
  options: SayOptions = {},
): SafeHtml {
  const { className = 'word', rate = 0.85, key, ariaLabel } = options;
  return html`<button
    type="button"
    class="${className}"
    data-say="${toSpeech(text)}"
    data-rate="${rate}"
    ${key ? html` data-key="${key}"` : ''}${ariaLabel ? html` aria-label="${ariaLabel}"` : ''}
  >
    ${ICONS.speak}<span>${label}</span>
  </button>`;
}

/** A speak button whose label is the rendered markup of the same text. */
export function sayMarkup(text: string, options: SayOptions = {}): SafeHtml {
  return sayButton(text, renderMarkup(text), options);
}

export function stressDots(count: number, stressed: number): SafeHtml {
  return html`<span class="dots" aria-hidden="true"
    >${Array.from(
      { length: count },
      (_, i) => html`<i class="${i === stressed ? 'big' : ''}"></i>`,
    )}</span
  >`;
}

/** "in·for·MA·tion" with the stressed syllable highlighted and a dot pattern underneath. */
export function stressWord(word: string): SafeHtml {
  const p = parseStressWord(word);
  const syllables = p.syllables.map((s, i) =>
    i === p.stressIndex ? html`<b class="st">${s.toUpperCase()}</b>` : html`${s}`,
  );
  const joined: SafeHtml[] = [];
  syllables.forEach((s, i) => {
    if (i) joined.push(html`·`);
    joined.push(s);
  });
  return html`<span class="sw"
    ><span class="syl">${joined}</span>${stressDots(p.syllables.length, p.stressIndex)}</span
  >`;
}

/** 1–5 rating buttons. `compact` shows numbers only. */
export function ratingButtons(
  current: Rating | null,
  action: string,
  options: { compact?: boolean; keyPrefix: string },
): SafeHtml {
  return html`${([1, 2, 3, 4, 5] as const).map(
    (v) =>
      html`<button
        type="button"
        data-action="${action}"
        data-v="${v}"
        data-key="${options.keyPrefix}-${v}"
        aria-pressed="${String(current === v)}"
        ${options.compact ? html` aria-label="${v}: ${RATING_LABELS[v]}"` : ''}
      >
        <b>${v}</b>${options.compact ? '' : html`<span>${RATING_LABELS[v]}</span>`}
      </button>`,
  )}`;
}
