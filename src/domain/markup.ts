/**
 * Course text markup.
 *   {sy}   stressed syllable or word     [th]  target sound
 *   " / "  short pause                   ‿     linked words        ↗ ↘  rising / falling voice
 */
import { escapeHtml, raw, type SafeHtml } from '../ui/html';

export function renderMarkup(source: string): SafeHtml {
  const out = escapeHtml(source)
    .replace(/\{([^{}]+)\}/g, '<b class="st">$1</b>')
    .replace(/\[([^[\]]+)\]/g, '<u class="tg">$1</u>')
    .replace(/ \/ /g, ' <span class="pz" aria-hidden="true">/</span> ')
    .replace(/‿/g, '<span class="lk" aria-hidden="true">‿</span>')
    .replace(/([↗↘])/g, '<span class="tn">$1</span>');
  return raw(out);
}

/** Plain text for speech synthesis: markup removed, pauses turned into commas. */
export function toSpeech(source: string): string {
  return source
    .replace(/[{}[\]]/g, '')
    .replace(/([.?!,])\s*\/\s*/g, '$1 ')
    .replace(/ \/ /g, ', ')
    .replace(/‿/g, ' ')
    .replace(/[↗↘]/g, '')
    .replace(/\s+([,.?!])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface StressWord {
  syllables: string[];
  /** Index of the stressed syllable, or -1 if the word has none marked. */
  stressIndex: number;
  /** The whole word in lower case, for speech. */
  text: string;
}

const isStressedSyllable = (s: string) => /[A-Z]/.test(s) && s === s.toUpperCase();

/** Parses "in·for·MA·tion" (stressed syllable in capitals). */
export function parseStressWord(word: string): StressWord {
  const parts = word.split('·');
  const stressIndex = parts.findIndex(isStressedSyllable);
  const syllables = parts.map((p) => p.toLowerCase());
  return { syllables, stressIndex, text: syllables.join('') };
}

/** Problems that would render a string wrongly. Used by the content test suite. */
export function markupProblems(source: string): string[] {
  const problems: string[] = [];
  let open: '{' | '[' | null = null;
  for (const ch of source) {
    if (ch === '{' || ch === '[') {
      if (open) problems.push(`nested "${ch}" inside "${open}"`);
      open = ch;
    } else if (ch === '}' || ch === ']') {
      const expected = ch === '}' ? '{' : '[';
      if (open !== expected) problems.push(`unmatched "${ch}"`);
      open = null;
    }
  }
  if (open) problems.push(`unclosed "${open}"`);
  if (/\{\}|\[\]/.test(source)) problems.push('empty markup');
  if (/[^ ]\/|\/[^ ]/.test(source)) problems.push('pause "/" needs a space on both sides');
  return problems;
}

export function stressWordProblems(word: string): string[] {
  const parts = word.split('·');
  const problems: string[] = [];
  if (parts.length < 2) problems.push('needs at least two syllables split by "·"');
  const stressed = parts.filter(isStressedSyllable).length;
  if (stressed !== 1) problems.push(`needs exactly one stressed syllable, found ${stressed}`);
  if (parts.some((p) => !isStressedSyllable(p) && p !== p.toLowerCase())) {
    problems.push('unstressed syllables must be lower case');
  }
  return problems;
}
