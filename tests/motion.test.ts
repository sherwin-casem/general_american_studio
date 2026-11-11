/**
 * The animation layer's contract: content never depends on an animation finishing, people who ask
 * for reduced motion get the final state at once, and nothing throws where animation is missing.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { soundByKey } from '../src/content/course';
import { articulationFor, mouthParts, mouthSvg } from '../src/ui/illustrations';
import {
  ambient,
  celebrate,
  countUp,
  enterView,
  motionAllowed,
  moveNavPill,
  pop,
  revealOnScroll,
  setMotionPreference,
  shake,
  startMouthDemo,
} from '../src/ui/motion';

function reducedMotion(on: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: on && query.includes('prefers-reduced-motion: reduce'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => {
  setMotionPreference('system');
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('the learner’s animation setting', () => {
  it('can turn animations on even when the system asks for reduced motion', () => {
    reducedMotion(true);
    setMotionPreference('on');
    expect(motionAllowed()).toBe(true);
    expect(document.documentElement.dataset.motion).toBe('on');
  });

  it('can turn them off when the system allows them', () => {
    reducedMotion(false);
    setMotionPreference('off');
    expect(motionAllowed()).toBe(false);
    expect(document.documentElement.dataset.motion).toBe('off');
  });

  it('follows the system by default', () => {
    reducedMotion(true);
    setMotionPreference('system');
    expect(motionAllowed()).toBe(false);
    reducedMotion(false);
    expect(motionAllowed()).toBe(true);
  });
});

describe('with reduced motion', () => {
  it('turns animation off', () => {
    reducedMotion(true);
    expect(motionAllowed()).toBe(false);
  });

  it('leaves content visible and in place', () => {
    reducedMotion(true);
    document.body.innerHTML = `<section id="s"><div data-reveal>One</div><ul data-reveal="stagger"><li>a</li><li>b</li></ul><b data-count="42">42</b><span class="meter"><i></i></span></section>`;
    const section = document.getElementById('s')!;
    revealOnScroll(section);
    enterView(section);
    countUp(section);
    for (const el of section.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal] > *')) {
      expect(el.style.opacity).toBe('');
      expect(el.style.transform).toBe('');
    }
    expect(section.querySelector('[data-count]')?.textContent).toBe('42');
  });

  it('never throws for feedback animations', () => {
    reducedMotion(true);
    document.body.innerHTML = '<div class="banner"><button>x</button></div>';
    const banner = document.querySelector('.banner');
    expect(() => {
      pop(banner);
      shake(banner);
      celebrate(banner);
      pop(null);
      ambient(document);
    }).not.toThrow();
    // No celebration pieces are added when motion is off.
    expect(document.querySelector('.burst')).toBeNull();
  });

  it('moves the navigation pill straight to the current item', () => {
    reducedMotion(true);
    document.body.innerHTML = `<nav class="nav"><span class="nav-pill"></span><a class="nav-item" aria-current="page">A</a></nav>`;
    const nav = document.querySelector<HTMLElement>('.nav')!;
    const item = nav.querySelector<HTMLElement>('.nav-item')!;
    // happy-dom has no layout; give the item a box and a parent so it counts as visible.
    Object.defineProperties(item, {
      offsetParent: { get: () => nav },
      offsetLeft: { get: () => 12 },
      offsetTop: { get: () => 40 },
      offsetWidth: { get: () => 200 },
      offsetHeight: { get: () => 44 },
    });
    moveNavPill(nav, false);
    const pill = nav.querySelector<HTMLElement>('.nav-pill')!;
    expect(pill.style.opacity).toBe('1');
    expect(pill.style.transform).toBe('translate(12px, 40px)');
    expect(pill.style.width).toBe('200px');
  });

  it('hides the pill when the current item is not shown', () => {
    reducedMotion(true);
    document.body.innerHTML = `<nav class="nav"><span class="nav-pill"></span><a class="nav-item" aria-current="page">A</a></nav>`;
    const nav = document.querySelector<HTMLElement>('.nav')!;
    // A hidden item (display: none) has no offsetParent in a browser.
    Object.defineProperty(nav.querySelector('.nav-item')!, 'offsetParent', { get: () => null });
    moveNavPill(nav, true);
    expect(nav.querySelector<HTMLElement>('.nav-pill')!.style.opacity).toBe('0');
  });
});

describe('the homepage mouth demo', () => {
  function demoMarkup() {
    const th = articulationFor('th-voiceless')!;
    document.body.innerHTML = `<div id="demo">
      <span data-demo="ipa"></span><b data-demo="name"></b><span data-demo="place"></span>
      ${mouthSvg(th).value}
      <button data-demo="say" data-say="think"><span data-demo="word"></span></button>
      <button data-action="demo-sound" data-sound="th-voiceless"></button>
      <button data-action="demo-sound" data-sound="r"></button>
    </div>`;
    return document.getElementById('demo')!;
  }

  it('shows the chosen sound at once when motion is reduced', () => {
    reducedMotion(true);
    const root = demoMarkup();
    const changed = vi.fn();
    const demo = startMouthDemo(root, ['th-voiceless', 'r'], changed);
    demo.show('r');
    const r = soundByKey('r');
    expect(root.querySelector('[data-demo="ipa"]')?.textContent).toBe(`/${r.ipa}/`);
    expect(root.querySelector('[data-demo="name"]')?.textContent).toBe(r.name);
    expect(root.querySelector<HTMLElement>('[data-demo="say"]')?.dataset.say).toBe('red');
    expect(root.querySelector('[data-sound="r"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('[data-sound="th-voiceless"]')?.getAttribute('aria-pressed')).toBe(
      'false',
    );
    expect(root.querySelector('[data-part="tongue"]')?.getAttribute('d')).toBe(
      mouthParts(articulationFor('r')!).tongue,
    );
    expect(changed).toHaveBeenCalled();
    demo.stop();
  });

  it('ignores sounds that are not part of the tour', () => {
    reducedMotion(true);
    const root = demoMarkup();
    const demo = startMouthDemo(root, ['th-voiceless', 'r'], undefined);
    const before = root.querySelector('[data-part="tongue"]')?.getAttribute('d');
    demo.show('ae');
    expect(root.querySelector('[data-part="tongue"]')?.getAttribute('d')).toBe(before);
    demo.stop();
  });
});
