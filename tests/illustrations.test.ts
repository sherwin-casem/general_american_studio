import { describe, expect, it } from 'vitest';
import { SOUNDS, UNITS } from '../src/content/course';
import {
  articulationFor,
  glideEndFor,
  mixArticulation,
  mouthParts,
  mouthSvg,
  soundFigure,
  unitArt,
  updateMouth,
  vowelChartSpots,
  vowelChartSvg,
} from '../src/ui/illustrations';

const speechSounds = SOUNDS.filter((s) => s.kind === 'consonant' || s.kind === 'vowel');
const skills = SOUNDS.filter((s) => s.kind === 'skill');

/** The production Content-Security-Policy blocks style attributes, so pictures must not use them. */
const NO_STYLE = / style=/;

function parse(markup: string): SVGSVGElement {
  const host = document.createElement('div');
  host.innerHTML = markup;
  const svg = host.querySelector('svg');
  if (!svg) throw new Error('no svg');
  return svg;
}

describe('mouth diagrams', () => {
  it('has a mouth shape for every consonant and vowel, and none for skills', () => {
    for (const sound of speechSounds) expect(articulationFor(sound.key), sound.key).not.toBeNull();
    for (const sound of skills) expect(articulationFor(sound.key), sound.key).toBeNull();
  });

  it('shows the voice: buzzing folds for voiced sounds, open folds for voiceless ones', () => {
    for (const sound of speechSounds.filter((s) => s.kind === 'consonant')) {
      expect(articulationFor(sound.key)?.voiced, sound.key).toBe(sound.voiced ? 1 : 0);
    }
    for (const sound of speechSounds.filter((s) => s.kind === 'vowel')) {
      expect(articulationFor(sound.key)?.voiced, sound.key).toBe(1);
    }
  });

  it('sends air through the nose only for M, N and NG', () => {
    const nasal = speechSounds
      .filter((s) => (articulationFor(s.key)?.nasal ?? 0) > 0)
      .map((s) => s.key)
      .sort();
    expect(nasal).toEqual(['m', 'n', 'ng']);
    for (const key of nasal) expect(articulationFor(key)?.velum).toBe(1);
  });

  it('closes the lips for P, B and M, and rounds them for W and OO', () => {
    for (const key of ['p', 'b', 'm'] as const) expect(articulationFor(key)?.lips).toBe(0);
    expect(articulationFor('w')?.round).toBe(1);
    expect(articulationFor('long-oo')?.round).toBeGreaterThan(0.5);
    expect(articulationFor('i')?.round).toBe(0);
  });

  it('puts the tongue high and front for EE, low for AH, and back for OO', () => {
    const ee = articulationFor('i')!;
    const ah = articulationFor('ah')!;
    const oo = articulationFor('long-oo')!;
    expect(ee.body[1]).toBeLessThan(ah.body[1]); // smaller y is higher
    expect(ee.body[0]).toBeLessThan(oo.body[0]); // smaller x is further front
  });

  it('gives gliding vowels an end position, and plain vowels none', () => {
    expect(glideEndFor('eye')).not.toBeNull();
    expect(glideEndFor('oy')).not.toBeNull();
    expect(glideEndFor('i')).toBeNull();
    expect(glideEndFor('p')).toBeNull();
  });

  it('renders valid, labelled SVG without style attributes', () => {
    for (const sound of SOUNDS.filter((s) => s.kind !== 'other')) {
      const markup = soundFigure(sound.key).value;
      expect(markup, sound.key).not.toMatch(NO_STYLE);
      expect(markup, sound.key).not.toContain('NaN');
      const svg = parse(markup);
      expect(svg.getAttribute('role'), sound.key).toBe('img');
      expect(svg.getAttribute('aria-label'), sound.key).toBeTruthy();
    }
  });

  it('is decorative when it has no label', () => {
    const svg = parse(mouthSvg(articulationFor('t')!).value);
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('interpolates smoothly between two sounds, ending exactly on the target', () => {
    const a = articulationFor('th-voiceless')!;
    const b = articulationFor('ng')!;
    expect(mixArticulation(a, b, 0)).toEqual(a);
    expect(mouthParts(mixArticulation(a, b, 1))).toEqual(mouthParts(b));
    const half = mixArticulation(a, b, 0.5);
    expect(half.tip[0]).toBeCloseTo((a.tip[0] + b.tip[0]) / 2);
    expect(half.velum).toBeCloseTo(0.5);
  });

  it('updates a rendered diagram in place', () => {
    const svg = parse(mouthSvg(articulationFor('p')!).value);
    const target = articulationFor('ng')!;
    updateMouth(svg, target);
    const parts = mouthParts(target);
    expect(svg.querySelector('[data-part="tongue"]')?.getAttribute('d')).toBe(parts.tongue);
    expect(svg.querySelector('[data-part="velum"]')?.getAttribute('d')).toBe(parts.velum);
    expect(svg.querySelector('[data-part="airNose"]')?.getAttribute('opacity')).toBe('1');
  });
});

describe('vowel chart', () => {
  it('places every non-R vowel inside the chart', () => {
    const spots = vowelChartSpots();
    expect(spots.length).toBe(
      speechSounds.filter((s) => s.kind === 'vowel' && s.category !== 'r-colored').length,
    );
    for (const spot of spots) {
      expect(spot.x).toBeGreaterThanOrEqual(0);
      expect(spot.x).toBeLessThanOrEqual(100);
      expect(spot.y).toBeGreaterThanOrEqual(0);
      expect(spot.y).toBeLessThanOrEqual(100);
    }
  });

  it('highlights one vowel, with an arrow for a glide', () => {
    const svg = parse(vowelChartSvg('eye', 'Vowel chart').value);
    expect(svg.querySelectorAll('.vc-glide.on')).toHaveLength(1);
    expect(svg.querySelector('.vc-dot.on')).not.toBeNull();
  });

  it('gives each chart its own marker ids, so several can share a page', () => {
    const ids = [vowelChartSvg('i').value, vowelChartSvg('long-oo').value].flatMap((m) =>
      [...parse(m).querySelectorAll('marker')].map((x) => x.id),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('can leave out the dots and axis labels for pages that draw their own', () => {
    const svg = parse(vowelChartSvg(null, undefined, { dots: false, axes: false }).value);
    expect(svg.querySelectorAll('.vc-dot')).toHaveLength(0);
    expect(svg.querySelectorAll('.vc-axis')).toHaveLength(0);
  });
});

describe('unit pictures', () => {
  it('has a picture for every unit, without style attributes', () => {
    for (const unit of UNITS) {
      const markup = unitArt(unit.key).value;
      expect(markup, unit.key).toContain('<svg');
      expect(markup, unit.key).not.toMatch(NO_STYLE);
    }
  });
});
