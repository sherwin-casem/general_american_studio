/**
 * Integration test: boots the real app against the real index.html in happy-dom and goes through
 * Today, a full lesson, the sound chart, the notebook and Progress, with browser storage.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppHandle } from '../src/app';
import { getLesson, LESSONS, SOUNDS, TOTAL_LESSONS, UNITS } from '../src/content/course';
import { STORAGE_KEYS } from '../src/storage/local';
import { settle } from './fixtures';

const page = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const body = (page.match(/<body>([\s\S]*)<\/body>/)?.[1] ?? '').replace(
  /<script[\s\S]*?<\/script>/g,
  '',
);

const FIRST = LESSONS[0]!;
const SECOND = LESSONS[1]!;

/** A recordings manifest with one word, as `npm run audio` writes it. */
const MANIFEST = {
  source: 'Wikimedia Commons',
  generated: '2026-11-08T00:00:00.000Z',
  words: {
    pen: {
      file: 'audio/words/pen.mp3',
      title: 'File:En-us-pen.ogg',
      author: 'Test Speaker',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
      page: 'https://commons.wikimedia.org/wiki/File:En-us-pen.ogg',
    },
  },
};

let app: AppHandle;

async function boot(): Promise<AppHandle> {
  vi.resetModules();
  const { startApp } = await import('../src/app');
  app = startApp();
  await app.ready;
  await app.audioReady;
  await settle();
  return app;
}

function el<T extends HTMLElement = HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`Missing element: ${selector}`);
  return found;
}

async function click(selector: string): Promise<void> {
  el(selector).click();
  await settle();
}

function type(selector: string, value: string): void {
  const input = el<HTMLInputElement | HTMLTextAreaElement>(selector);
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function stored() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.data) ?? '{"runs":[],"notes":[]}');
}

async function goTo(view: string) {
  window.location.hash = `#${view}`;
  window.dispatchEvent(new Event('hashchange'));
  await settle();
}

const visible = (view: string) => !el(`#view-${view}`).hidden;

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '';
  document.body.innerHTML = body;
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(MANIFEST), { status: 200 })),
  );
  // happy-dom can't play audio; pretend MP3 and Ogg are supported, as in real browsers.
  vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('maybe');
  // Reduced motion: no animations, so every number and position is final straight away.
  // Animations have their own tests in motion.test.ts.
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion: reduce'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

afterEach(() => {
  app?.destroy();
  vi.unstubAllGlobals();
});

describe('General American Studio', () => {
  it('opens on the homepage, with Today one click away', async () => {
    await boot();
    expect(visible('home')).toBe(true);
    expect(visible('today')).toBe(false);
    expect(el('[data-view="home"]').getAttribute('aria-current')).toBe('page');
    expect(el('#home-cta').textContent).toContain('Start the first lesson');
    expect(el('#status').textContent).toContain('Saved in this browser');

    await goTo('today');
    expect(visible('today')).toBe(true);
    expect(el('#hero-title').textContent).toBe(FIRST.title);
    expect(el('[data-view="today"]').getAttribute('aria-current')).toBe('page');
  });

  it('lets the learner turn animations on, and remembers it', async () => {
    await boot();
    expect(el('#audio-panel').textContent).toContain('Your system asks for reduced motion');
    const select = el<HTMLSelectElement>('#motion-sel');
    select.value = 'on';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await settle();
    expect(document.documentElement.dataset.motion).toBe('on');
    expect(JSON.parse(localStorage.getItem('gas:v2:prefs') ?? '{}').motion).toBe('on');
    expect(el<HTMLSelectElement>('#motion-sel').value).toBe('on');
    // The homepage is rendered again, and still works.
    expect(document.querySelectorAll('#home-path .unit-card')).toHaveLength(8);
  });

  it('shows the homepage diagram, vowel map and units, and starts a lesson from it', async () => {
    await boot();
    expect(document.querySelector('#mouth-demo svg.mouth')).not.toBeNull();
    expect(document.querySelectorAll('#home .vc-spot').length).toBeGreaterThanOrEqual(10);
    expect(document.querySelectorAll('#home-path .unit-card')).toHaveLength(8);
    expect(el('#home-rec').textContent).toContain('1');

    await click('[data-action="demo-sound"][data-sound="r"]');
    expect(el('[data-demo="name"]').textContent).toBe('R as in red');
    expect(el('[data-demo="say"]').dataset.say).toBe('red');
    expect(el('[data-sound="r"]').getAttribute('aria-pressed')).toBe('true');

    await click('#home-cta [data-action="go-lesson"]');
    expect(visible('practice')).toBe(true);
    expect(el('#lesson-head .lh-title').textContent).toBe(FIRST.title);
  });

  it('shows the hero picture with a card that plays a real recording', async () => {
    await boot();
    const img = el<HTMLImageElement>('#home .hp-img');
    expect(img.getAttribute('src')).toContain('home-hero');
    // The picture is decoration: the heading and text say what the page is about.
    expect(img.getAttribute('alt')).toBe('');
    expect(document.querySelectorAll('#home .hp-glyph').length).toBeGreaterThan(0);
    const card = el('#home .hp-listen');
    expect(card.dataset.say).toBe('water');
    expect(card.getAttribute('aria-label')).toContain('water');
    // The interactive diagram has its own section now.
    expect(el('#mouth-demo').closest('.home-demo')).not.toBeNull();
  });

  it('has a footer with the app, every unit, settings, credits and the way back up', async () => {
    await boot();
    const foot = el('#home .site-foot');
    const links = [...foot.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href'));
    expect(links).toEqual(
      expect.arrayContaining(['#today', '#practice', '#sounds', '#notebook', '#progress']),
    );
    expect(foot.querySelectorAll('.sf-link[data-action="go-lesson"]')).toHaveLength(8);
    expect(foot.textContent).toContain(`Version ${__APP_VERSION__}`);
    for (const a of foot.querySelectorAll('a[target="_blank"]')) {
      expect(a.getAttribute('rel')).toContain('noopener');
    }
    // The closing call to action lives in the footer.
    expect(foot.querySelector('#home-cta-end [data-action="go-lesson"]')).not.toBeNull();

    await click('.site-foot [data-action="open-settings"]');
    expect(el<HTMLDetailsElement>('#settings').open).toBe(true);
    expect(document.activeElement?.id).toBe('motion-sel');

    await click('.site-foot [data-action="to-top"]');
    expect(document.activeElement?.id).toBe('main');

    await click('.site-foot [data-action="show-credits"]');
    expect(visible('progress')).toBe(true);
    expect(document.activeElement?.id).toBe('pg-credits-title');

    await goTo('home');
    const unitTwo = UNITS[1]!.lessons[0]!;
    await click(`.site-foot [data-lesson="${unitTwo.id}"]`);
    expect(visible('practice')).toBe(true);
    expect(el('#lesson-head .lh-title').textContent).toBe(unitTwo.title);
  });

  it('starts the lesson from Today and shows the whole path', async () => {
    await boot();
    await click('[data-key="hero-start"]');
    expect(visible('practice')).toBe(true);
    expect(el('#lesson-head .lh-title').textContent).toBe(FIRST.title);
    expect(el('#lesson-head').textContent).toContain(`Lesson 1 of ${TOTAL_LESSONS}`);
    expect(document.querySelectorAll('#steps details.step')).toHaveLength(6);
    expect(el('#steps details[open]').dataset.step).toBe('warmup');
    // Every lesson, plus the Business English card.
    expect(document.querySelectorAll('#path .lrow')).toHaveLength(TOTAL_LESSONS + 1);
    expect(el(`#path [data-lesson="${FIRST.id}"]`).getAttribute('aria-current')).toBe('step');
  });

  it('completes a session, logs it and shows the result', async () => {
    await boot();
    await goTo('practice');
    await click('[data-action="step-done"][data-step="warmup"]');
    expect(el('#steps details[open]').dataset.step).toBe('learn');
    expect(el('#lesson-head').textContent).toContain('1 of 6 steps');

    await click('[data-action="finish"]');
    expect(el('#toast').textContent).toContain('Choose a clarity rating');
    expect(stored().runs).toHaveLength(0);

    await click('[data-action="rf-rate"][data-v="4"]');
    type('#rf-note', 'Pen still sounds like Ben');
    await click('[data-action="finish"]');

    const data = stored();
    expect(data.runs).toHaveLength(1);
    expect(data.runs[0]).toMatchObject({
      lesson: FIRST.id,
      rating: 4,
      note: 'Pen still sounds like Ben',
    });
    expect(data.notes).toHaveLength(1);
    expect(data.notes[0]).toMatchObject({ sound: FIRST.sounds[0], lesson: FIRST.id });
    expect(el('#steps .banner').textContent).toContain('Session saved · Lesson 1 · clarity 4/5');
    expect(el(`#path [data-lesson="${FIRST.id}"] .lmark`).classList.contains('passed')).toBe(true);

    await click('#steps .banner [data-key="banner-next"]');
    expect(el('#lesson-head .lh-title').textContent).toBe(SECOND.title);

    await goTo('today');
    expect(el('#hero-title').textContent).toBe(SECOND.title);
    expect(el('.plan li.done').textContent).toContain(FIRST.title);
  });

  it('keeps work in progress across a reload', async () => {
    await boot();
    await goTo('practice');
    await click('[data-action="step-done"][data-step="warmup"]');
    await click('[data-action="rf-rate"][data-v="2"]');
    type('#rf-note', 'P in "people"');
    app.destroy();
    document.body.innerHTML = body;
    await boot();
    expect(el('#steps details[data-step="warmup"]').classList.contains('done')).toBe(true);
    expect(el('[data-action="rf-rate"][data-v="2"]').getAttribute('aria-pressed')).toBe('true');
    expect(el<HTMLTextAreaElement>('#rf-note').value).toBe('P in "people"');
    expect(el('[data-key="hero-start"]').textContent).toContain('Continue lesson (1 of 6');
  });

  it('counts twister reps', async () => {
    await boot();
    for (let i = 0; i < 3; i++) await click('[data-action="rep-plus"][data-level="0"]');
    expect(el('#twister-levels .rn').textContent).toBe('3/5');
    await click('[data-action="rep-minus"][data-level="0"]');
    expect(el('#twister-levels .rn').textContent).toBe('2/5');
  });

  it('shows every sound in the chart and opens its detail and lesson', async () => {
    await boot();
    await goTo('sounds');
    expect(visible('sounds')).toBe(true);
    const tiles = document.querySelectorAll('#sound-chart .tile');
    expect(tiles).toHaveLength(SOUNDS.filter((s) => s.kind !== 'other').length);
    expect(el('#sound-detail').textContent).toContain('Pick a sound');

    await click('[data-key="tile-th-voiceless"]');
    expect(el('[data-key="tile-th-voiceless"]').getAttribute('aria-pressed')).toBe('true');
    expect(el('#sound-detail-title').textContent).toBe('TH as in think');
    expect(document.querySelectorAll('#sound-detail [data-say]').length).toBeGreaterThan(3);

    await click('#sound-detail [data-action="go-lesson"]');
    expect(visible('practice')).toBe(true);
    expect(el('#lesson-head .lh-title').textContent).toBe(getLesson('th')?.title);
  });

  it('logs a difficult word straight from the sound chart', async () => {
    await boot();
    await goTo('sounds');
    await click('[data-key="tile-zh"]');
    await click('[data-action="note-sound"]');
    expect(visible('notebook')).toBe(true);
    expect(el<HTMLSelectElement>('#nf-sound').value).toBe('zh');
  });

  it('marks words that have a real recording, and lets the learner turn them off', async () => {
    await boot();
    await goTo('practice');
    const pen = () => el(`#steps [data-say="pen"]`);
    expect(pen().classList.contains('rec')).toBe(true);
    expect(el(`#steps [data-say="best"]`).classList.contains('rec')).toBe(false);
    expect(el('#audio-panel').textContent).toContain('1 word recorded');

    const toggle = el<HTMLInputElement>('#rec-toggle');
    toggle.checked = false;
    toggle.dispatchEvent(new Event('change', { bubbles: true }));
    await settle();
    expect(pen().classList.contains('rec')).toBe(false);

    await goTo('progress');
    expect(el('#pg-credits').textContent).toContain('Test Speaker');
    expect(el('#pg-credits tbody a').textContent).toBe('pen');
  });

  it('falls back to the device voice when there is no recordings list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('missing', { status: 404 })),
    );
    await boot();
    await goTo('practice');
    expect(document.querySelectorAll('#steps [data-say].rec')).toHaveLength(0);
    expect(el<HTMLInputElement>('#rec-toggle').disabled).toBe(true);
    expect(el('#audio-panel').textContent).toContain('No recordings installed');
  });

  it('logs, checks in and deletes notebook entries, escaping what you type', async () => {
    await boot();
    await goTo('notebook');
    expect(visible('notebook')).toBe(true);
    expect(el('#nb-list').textContent).toContain('No difficult sounds logged yet');

    type('#nf-example', '<img src=x onerror=alert(1)>');
    type('#nf-text', 'tongue stays back');
    el<HTMLFormElement>('#note-form').dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();

    expect(stored().notes).toHaveLength(1);
    expect(document.querySelector('#nb-list img')).toBeNull();
    expect(el('#nb-list').textContent).toContain('<img src=x onerror=alert(1)>');
    expect(el('#nb-count').textContent).toContain('1');

    await click('#nb-list [data-action="ck-open"]');
    await click('#nb-list [data-action="ck-rate"][data-v="5"]');
    await click('#nb-list [data-action="ck-save"]');
    expect(stored().notes[0].checks).toHaveLength(2);
    expect(el('#nb-list .pill').textContent).toBe('Comfortable');

    await click('#nb-list [data-action="nb-del"]');
    await click('#nb-list [data-action="nb-del-yes"]');
    expect(stored().notes).toHaveLength(0);
  });

  it('shows history and deletes a session after confirmation', async () => {
    await boot();
    await click('[data-action="rf-rate"][data-v="3"]');
    await click('[data-action="finish"]');
    await goTo('progress');
    expect(el('#pg-stats').textContent).toContain(`1 / ${TOTAL_LESSONS}`);
    expect(document.querySelectorAll('#pg-history tbody tr')).toHaveLength(1);
    expect(el('#pg-history tbody').textContent).toContain(FIRST.title);
    expect(el('#pg-chart svg')).toBeTruthy();

    await click('#pg-history [data-action="run-del"]');
    expect(stored().runs).toHaveLength(1);
    await click('#pg-history [data-action="run-del-yes"]');
    expect(stored().runs).toHaveLength(0);
    expect(el('#pg-history').textContent).toContain('No sessions logged yet');
  });

  it('recovers from unreadable saved data and tells the person', async () => {
    localStorage.setItem(STORAGE_KEYS.data, '{broken');
    await boot();
    expect(el('#storage-notice').textContent).toContain('could not be read');
    expect(el('#hero-title').textContent).toBe(FIRST.title);
  });

  it('migrates progress saved by version 1 to the lesson path', async () => {
    localStorage.setItem(
      STORAGE_KEYS.legacyData,
      JSON.stringify({
        runs: [
          {
            id: 'old1',
            week: 1,
            rating: 4,
            minutes: 12,
            note: '',
            stepsDone: 6,
            quiz: 7,
            at: '2026-11-01T09:00:00.000Z',
          },
        ],
        notes: [],
      }),
    );
    await boot();
    // Week 1 was TH. It is passed on the path, and the TH sounds show as passed in the chart.
    expect(el('#path [data-lesson="th"] .lmark').classList.contains('passed')).toBe(true);
    expect(el('[data-key="tile-th-voiceless"]').classList.contains('st-passed')).toBe(true);
    expect(stored().runs[0]).toMatchObject({ id: 'old1', lesson: 'th' });
  });
});
