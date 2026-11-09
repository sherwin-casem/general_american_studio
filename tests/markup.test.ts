import { describe, expect, it } from 'vitest';
import {
  markupProblems,
  parseStressWord,
  renderMarkup,
  stressWordProblems,
  toSpeech,
} from '../src/domain/markup';
import { escapeHtml, html, raw } from '../src/ui/html';

describe('html templates', () => {
  it('escapes interpolated values', () => {
    const evil = '<img src=x onerror="alert(1)">';
    expect(html`<p>${evil}</p>`.value).toBe(
      '<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>',
    );
  });

  it('escapes values inside attributes', () => {
    expect(html`<a title="${`" onclick="x`}"></a>`.value).toBe(
      '<a title="&quot; onclick=&quot;x"></a>',
    );
  });

  it('keeps nested templates and raw markup', () => {
    const items = ['a', '<b>'];
    expect(html`<ul>${items.map((i) => html`<li>${i}</li>`)}</ul>`.value).toBe(
      '<ul><li>a</li><li>&lt;b&gt;</li></ul>',
    );
    expect(html`${raw('<br>')}`.value).toBe('<br>');
  });

  it('drops null, undefined and booleans', () => {
    expect(html`${null}${undefined}${false}${true}x`.value).toBe('x');
  });

  it('escapes every special character', () => {
    expect(escapeHtml(`&<>"'\``)).toBe('&amp;&lt;&gt;&quot;&#39;&#96;');
  });
});

describe('renderMarkup', () => {
  it('renders stress, target sounds, pauses, links and arrows', () => {
    const out = renderMarkup('pre{sent} [th]ink / pick‿it ↗').value;
    expect(out).toContain('<b class="st">sent</b>');
    expect(out).toContain('<u class="tg">th</u>');
    expect(out).toContain('<span class="pz" aria-hidden="true">/</span>');
    expect(out).toContain('<span class="lk" aria-hidden="true">‿</span>');
    expect(out).toContain('<span class="tn">↗</span>');
  });

  it('escapes HTML before adding markup', () => {
    expect(renderMarkup('<script>{x}</script>').value).toBe(
      '&lt;script&gt;<b class="st">x</b>&lt;/script&gt;',
    );
  });
});

describe('toSpeech', () => {
  it.each([
    [
      'Right {now}, / I’m {work}ing / for {next} {year}. ↘',
      'Right now, I’m working, for next year.',
    ],
    ['We need {pa}per ↗, {pens} ↗, and a pro{jec}tor. ↘', 'We need paper, pens, and a projector.'],
    ['Can you {send}‿it‿{o}ver / by {Fri}day?', 'Can you send it over, by Friday?'],
    ['Hi, {ev}eryone. ↘', 'Hi, everyone.'],
    ['[Th]anks for [th]e invitation.', 'Thanks for the invitation.'],
  ])('%s', (input, expected) => {
    expect(toSpeech(input)).toBe(expected);
  });
});

describe('stress words', () => {
  it('parses the stressed syllable', () => {
    expect(parseStressWord('in·for·MA·tion')).toEqual({
      syllables: ['in', 'for', 'ma', 'tion'],
      stressIndex: 2,
      text: 'information',
    });
    expect(parseStressWord('e·CON·o·my').stressIndex).toBe(1);
  });

  it('reports badly marked words', () => {
    expect(stressWordProblems('TA·ble')).toEqual([]);
    expect(stressWordProblems('ta·ble')).toHaveLength(1);
    expect(stressWordProblems('TA·BLE')).toHaveLength(1);
    expect(stressWordProblems('table')).not.toEqual([]);
  });
});

describe('markupProblems', () => {
  it('accepts well-formed text', () => {
    expect(markupProblems('I {need} the [r]eport / today. ↘')).toEqual([]);
  });

  it.each(['{unclosed', 'closed}', '{a [b] c}', 'a{}b', 'no/space', 'a /b'])('flags %s', (text) => {
    expect(markupProblems(text).length).toBeGreaterThan(0);
  });
});
