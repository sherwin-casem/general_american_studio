/**
 * Illustrations drawn in code: a mouth cross-section for every sound, the vowel chart, and small
 * pictures for the units.
 *
 * Everything is inline SVG styled through classes, never style attributes, so the strict
 * Content-Security-Policy holds and the pictures follow the light and dark themes. The mouth is
 * described by numbers (`Articulation`), so the homepage can animate smoothly from one sound to
 * another by interpolating them.
 */
import { soundByKey } from '../content/course';
import type { SoundKey, UnitKey } from '../content/types';
import { escapeHtml, raw, type SafeHtml } from './html';

export type Point = readonly [number, number];

/** The shape of the mouth for one sound. Coordinates are in the 200 × 180 diagram space. */
export interface Articulation {
  /** Tongue tip, blade, body (highest point) and back. */
  tip: Point;
  blade: Point;
  body: Point;
  back: Point;
  /** 0 closed … 1 wide open. Moves the lower lip, lower teeth and floor of the mouth. */
  jaw: number;
  /** Gap between the lips: 0 closed … 1 open. */
  lips: number;
  /** 0 spread … 1 rounded and pushed forward. */
  round: number;
  /** 1 when the lower lip touches the top teeth (F, V). */
  tuck: number;
  /** 0 raised, sealing the nose … 1 lowered, so air flows through the nose. */
  velum: number;
  /** 1 when the vocal folds buzz. */
  voiced: number;
  /** How visible the airflow through the mouth and through the nose is, 0 … 1. */
  oral: number;
  nasal: number;
  /** The spot to highlight, and how visible the highlight is. */
  focus: Point;
  focusOn: number;
}

const REST: Articulation = {
  tip: [47, 92],
  blade: [64, 86],
  body: [100, 80],
  back: [140, 94],
  jaw: 0.15,
  lips: 0.3,
  round: 0,
  tuck: 0,
  velum: 0,
  voiced: 0,
  oral: 1,
  nasal: 0,
  focus: [100, 80],
  focusOn: 0,
};

const LIPS: Point = [21, 80];

type Shape = Partial<Articulation>;

/** Places of articulation, in the diagram's coordinates. */
const PLACES = {
  lips: { jaw: 0.08, lips: 0, focus: LIPS },
  lipTeeth: { tuck: 1, lips: 0.2, jaw: 0.1, focus: [35, 80] },
  teeth: { tip: [33, 81], blade: [50, 80], body: [96, 80], lips: 0.45, jaw: 0.25, focus: [34, 80] },
  ridge: { tip: [56, 64], blade: [70, 72], body: [102, 80], jaw: 0.1, focus: [57, 62] },
  nearRidge: { tip: [56, 68], blade: [70, 74], body: [100, 79], jaw: 0.08, focus: [57, 64] },
  behindRidge: {
    tip: [56, 76],
    blade: [67, 66],
    body: [98, 74],
    round: 0.6,
    lips: 0.25,
    jaw: 0.1,
    focus: [65, 62],
  },
  palate: { tip: [47, 91], blade: [62, 78], body: [86, 61], jaw: 0.1, focus: [86, 55] },
  velum: { tip: [47, 93], blade: [66, 90], body: [124, 60], back: [144, 86], focus: [126, 55] },
  throat: { jaw: 0.35, lips: 0.55, focus: [154.5, 160] },
  bunched: {
    tip: [62, 75],
    blade: [74, 72],
    body: [108, 72],
    back: [138, 92],
    round: 0.35,
    lips: 0.3,
    jaw: 0.15,
    focus: [64, 70],
  },
} satisfies Record<string, Shape>;

const stop: Shape = { oral: 0 };
const nasal: Shape = { velum: 1, oral: 0, nasal: 1 };

const CONSONANTS: Partial<Record<SoundKey, Shape>> = {
  p: { ...PLACES.lips, ...stop },
  b: { ...PLACES.lips, ...stop },
  m: { ...PLACES.lips, ...nasal },
  f: PLACES.lipTeeth,
  v: PLACES.lipTeeth,
  'th-voiceless': PLACES.teeth,
  'th-voiced': PLACES.teeth,
  t: { ...PLACES.ridge, ...stop },
  d: { ...PLACES.ridge, ...stop },
  'stop-t': { ...PLACES.ridge, ...stop },
  'flap-t': { ...PLACES.ridge, tip: [57, 66] },
  n: { ...PLACES.ridge, ...nasal },
  l: PLACES.ridge,
  s: PLACES.nearRidge,
  z: PLACES.nearRidge,
  sh: PLACES.behindRidge,
  zh: PLACES.behindRidge,
  ch: { ...PLACES.behindRidge, ...stop },
  j: { ...PLACES.behindRidge, ...stop },
  y: PLACES.palate,
  k: { ...PLACES.velum, ...stop },
  g: { ...PLACES.velum, ...stop },
  ng: { ...PLACES.velum, body: [128, 66], ...nasal },
  h: PLACES.throat,
  r: PLACES.bunched,
  w: { body: [122, 64], back: [142, 90], round: 1, lips: 0.15, jaw: 0.1, focus: LIPS },
};

/** Vowel positions: how far back (0 front … 1 back) and how open (0 close … 1 open). */
const VOWEL_POINTS = {
  i: [0, 0],
  ɪ: [0.18, 0.22],
  e: [0.06, 0.34],
  ɛ: [0.12, 0.56],
  æ: [0.16, 0.88],
  a: [0.42, 0.98],
  ʌ: [0.62, 0.62],
  ə: [0.5, 0.45],
  // Drawn a little higher than its true place so it does not crowd the schwa on the chart.
  ɝ: [0.52, 0.22],
  ɚ: [0.5, 0.46],
  u: [1, 0],
  ʊ: [0.82, 0.2],
  o: [0.96, 0.36],
  ɔ: [0.96, 0.66],
  ɑ: [0.86, 0.96],
} as const;
type VowelPoint = keyof typeof VOWEL_POINTS;

const ROUNDED: Partial<Record<VowelPoint, number>> = { u: 0.85, ʊ: 0.7, o: 0.8, ɔ: 0.5 };

/** Each vowel as one position, or a glide from one position to another. */
const VOWELS: Partial<Record<SoundKey, readonly VowelPoint[]>> = {
  i: ['i'],
  ih: ['ɪ'],
  ay: ['e', 'ɪ'],
  eh: ['ɛ'],
  ae: ['æ'],
  uh: ['ʌ'],
  schwa: ['ə'],
  er: ['ɝ'],
  'long-oo': ['u'],
  'short-oo': ['ʊ'],
  oh: ['o', 'ʊ'],
  aw: ['ɔ'],
  ah: ['ɑ'],
  eye: ['a', 'ɪ'],
  ow: ['a', 'ʊ'],
  oy: ['ɔ', 'ɪ'],
  ear: ['ɪ', 'ɚ'],
  air: ['ɛ', 'ɚ'],
  ar: ['ɑ', 'ɚ'],
  or: ['ɔ', 'ɚ'],
};

function vowelShape(point: VowelPoint): Shape {
  if (point === 'ɝ' || point === 'ɚ') {
    return { ...PLACES.bunched, voiced: 1, jaw: point === 'ɝ' ? 0.2 : 0.25, focusOn: 1 };
  }
  const [back, open] = VOWEL_POINTS[point];
  const body: Point = [84 + 38 * back, 62 + 22 * open];
  return {
    tip: [47, 91],
    blade: [64 + 8 * back, body[1] + 6 + 10 * back],
    body,
    back: [140 + 6 * back * open, 92],
    jaw: 0.1 + 0.8 * open,
    lips: 0.25 + 0.6 * open,
    round: ROUNDED[point] ?? 0,
    voiced: 1,
    focus: [body[0], body[1] - 6],
    focusOn: 1,
  };
}

/** The mouth shape for a sound, or null for skills like stress and rhythm. */
export function articulationFor(key: SoundKey): Articulation | null {
  const sound = soundByKey(key);
  const consonant = CONSONANTS[key];
  if (consonant) {
    return { ...REST, ...consonant, voiced: sound.voiced ? 1 : 0, focusOn: 1 };
  }
  const glide = VOWELS[key];
  if (glide?.[0]) return { ...REST, ...vowelShape(glide[0]) };
  return null;
}

/** For a gliding vowel, the mouth shape where it ends. */
export function glideEndFor(key: SoundKey): Articulation | null {
  const glide = VOWELS[key];
  const end = glide && glide.length > 1 ? glide[glide.length - 1] : undefined;
  return end ? { ...REST, ...vowelShape(end) } : null;
}

/* ---------- Geometry ---------- */

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixPoint = (a: Point, b: Point, t: number): Point => [mix(a[0], b[0], t), mix(a[1], b[1], t)];

/** Interpolates between two mouth shapes, for animation. */
export function mixArticulation(a: Articulation, b: Articulation, t: number): Articulation {
  return {
    tip: mixPoint(a.tip, b.tip, t),
    blade: mixPoint(a.blade, b.blade, t),
    body: mixPoint(a.body, b.body, t),
    back: mixPoint(a.back, b.back, t),
    jaw: mix(a.jaw, b.jaw, t),
    lips: mix(a.lips, b.lips, t),
    round: mix(a.round, b.round, t),
    tuck: mix(a.tuck, b.tuck, t),
    velum: mix(a.velum, b.velum, t),
    voiced: mix(a.voiced, b.voiced, t),
    oral: mix(a.oral, b.oral, t),
    nasal: mix(a.nasal, b.nasal, t),
    focus: mixPoint(a.focus, b.focus, t),
    focusOn: mix(a.focusOn, b.focusOn, t),
  };
}

const n = (v: number) => (Math.round(v * 10) / 10).toString();
const pt = (p: Point) => `${n(p[0])} ${n(p[1])}`;

/** A smooth curve through points (Catmull-Rom as cubic Béziers). */
function smooth(points: readonly Point[], closed: boolean): string {
  const count = points.length;
  const at = (i: number): Point =>
    closed
      ? (points[(i + count) % count] as Point)
      : (points[Math.max(0, Math.min(count - 1, i))] as Point);
  let d = `M${pt(at(0))}`;
  const segments = closed ? count : count - 1;
  for (let i = 0; i < segments; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return closed ? `${d} Z` : d;
}

/** The parts of the diagram that change from sound to sound. */
export interface MouthParts {
  skin: string;
  cavity: string;
  upperLip: string;
  lowerLip: string;
  lowerTooth: string;
  chin: string;
  velum: string;
  tongue: string;
  airMouth: string;
  focus: Point;
}

function tonguePoints(a: Articulation): Point[] {
  const jy = 12 * a.jaw;
  // A tip resting behind the lower teeth moves with the jaw; a raised tip stays where it is.
  const follow = Math.max(0, Math.min(1, (a.tip[1] - 80) / 10));
  return [
    [a.tip[0], a.tip[1] + jy * follow],
    a.blade,
    a.body,
    a.back,
    [148, 144],
    [112, 136 + jy * 0.6],
    [52, 108 + jy],
  ];
}

export function mouthParts(a: Articulation): MouthParts {
  const jy = 12 * a.jaw;
  const p = 6 * a.round;
  const ux = 21 - p;
  // The lower lip drops with the jaw; tucked, it rises and moves back under the top teeth.
  const lowerTop = mix(79.5 + 9 * a.lips + jy * 0.8, 79, a.tuck);
  const lx = ux + 11 * a.tuck;
  const chinY = 100 + jy;
  const velumTip: Point = [mix(155, 140, a.velum), mix(48, 72, a.velum)];
  const velumCtl: Point = [mix(144, 136, a.velum), mix(50, 58, a.velum)];
  const front = (79 + lowerTop) / 2;
  const tongue = tonguePoints(a);
  const raised = Math.min(a.tip[1], a.blade[1]);
  return {
    skin: `M48 0 L176 0 C194 40 199 120 186 180 L84 180 L78 138 C70 ${n(126 + jy / 2)} 56 ${n(124 + jy)} 44 ${n(120 + jy)} C34 ${n(116 + jy)} 31 ${n(108 + jy)} 33 ${n(chinY)} L${n(lx)} ${n(lowerTop + 8)} L${n(ux)} 74 C${n(ux + 1)} 68 27 63 31 60 C26 58 18 57 16 53 C18 50 30 44 40 36 C44 26 46 14 48 0 Z`,
    cavity: `M${n(ux + 4)} 79 L38 79 L40 64 C48 58 56 57 60 60 C66 56 90 48 128 52 C140 54 152 44 160 42 C167 80 166 120 162 168 L150 168 C148 150 146 140 140 ${n(136 + jy / 2)} C120 ${n(134 + jy)} 70 ${n(128 + jy)} 44 ${n(106 + jy)} L38 ${n(chinY)} L${n(lx + 4)} ${n(lowerTop)} Z`,
    upperLip: `M31 60 C27 63 ${n(ux + 1)} 68 ${n(ux)} 73 C${n(ux)} 77 ${n(ux + 3)} 79.5 ${n(ux + 8)} 79.5 L38 79.5 L39.5 64 Z`,
    lowerLip: `M${n(lx + 8)} ${n(lowerTop)} C${n(lx + 2)} ${n(lowerTop)} ${n(lx)} ${n(lowerTop + 3)} ${n(lx)} ${n(lowerTop + 7)} C${n(lx)} ${n(lowerTop + 13)} ${n(lx + 6)} ${n(chinY - 1)} 34 ${n(chinY)} L38.5 ${n(chinY)} L38.5 ${n(lowerTop + 2)} Z`,
    lowerTooth: `M37 ${n(85 + jy)} Q39.5 ${n(83 + jy)} 42 ${n(85 + jy)} L42.5 ${n(99 + jy)} L37.5 ${n(99 + jy)} Z`,
    chin: `M33 ${n(chinY)} C31 ${n(108 + jy)} 34 ${n(116 + jy)} 44 ${n(120 + jy)} C56 ${n(124 + jy)} 70 ${n(126 + jy / 2)} 78 138 L84 180`,
    velum: `M128 52 Q${pt(velumCtl)} ${pt(velumTip)}`,
    tongue: smooth(tongue, true),
    airMouth: smooth(
      [
        [154.5, 158],
        [157, 112],
        [a.body[0] + 16, a.body[1] - 10],
        [(a.body[0] + a.blade[0]) / 2, Math.min(a.body[1], raised) - 9],
        [Math.max(a.tip[0] - 4, 42), Math.min(raised - 6, front)],
        [8, front],
      ],
      false,
    ),
    focus: a.focus,
  };
}

const AIR_NOSE = smooth(
  [
    [154.5, 158],
    [158, 104],
    [152, 52],
    [122, 41],
    [72, 44],
    [36, 54],
    [10, 55],
  ],
  false,
);

const NASAL_CAVITY =
  'M30 58 C40 46 70 36 110 34 C140 33 156 36 162 42 C150 46 140 50 130 51 C100 47 70 52 60 59 C52 56 44 57 40 62 C36 61 33 60 30 58 Z';
const PALATE = 'M40 64 C48 58 56 57 60 60 C66 56 90 48 128 52';
const PHARYNX = 'M160 40 C167 80 166 120 162 168';
const UPPER_TOOTH = 'M36.5 64 L42.5 64 L41.5 79 Q39 81.5 36.5 79 Z';
const FACE = 'M48 0 C46 14 44 26 40 36 C30 44 18 50 16 53 C18 57 26 58 31 60';
const LARYNX =
  'M145 150 h19 a3 3 0 0 1 3 3 v14 a3 3 0 0 1 -3 3 h-19 a3 3 0 0 1 -3 -3 v-14 a3 3 0 0 1 3 -3 z';
const BUZZ = 'M146 160 l3 -3 l3 6 l3 -6 l3 6 l3 -6 l3 3';
const OPEN_GLOTTIS = 'M147 155 L154.5 163 L162 155';

export interface MouthOptions {
  /** Accessible description; the diagram is decorative when omitted. */
  label?: string;
  /** A second tongue position drawn dashed, for gliding vowels. */
  ghost?: Articulation | null;
  /** Show airflow and buzzing, and let them animate. */
  animated?: boolean;
  /** A tighter crop around the mouth, for small pictures. */
  compact?: boolean;
  className?: string;
}

/** A mouth cross-section, facing left. */
export function mouthSvg(a: Articulation, options: MouthOptions = {}): SafeHtml {
  const parts = mouthParts(a);
  const anim = options.animated !== false;
  const viewBox = options.compact ? '4 26 170 136' : '0 0 200 180';
  const label = options.label;
  const a11y = label
    ? `role="img" aria-label="${escapeHtml(label)}"`
    : 'aria-hidden="true" focusable="false"';
  const ghost = options.ghost ? smooth(tonguePoints(options.ghost), true) : '';
  const [fx, fy] = parts.focus;
  const classes = ['mouth', options.compact ? 'compact' : '', options.className ?? '']
    .filter(Boolean)
    .join(' ');
  return raw(`<svg class="${escapeHtml(classes)}" viewBox="${viewBox}" ${a11y}>
<path class="md-skin" data-part="skin" d="${parts.skin}"/>
<path class="md-nasal" d="${NASAL_CAVITY}"/>
<path class="md-cavity" data-part="cavity" d="${parts.cavity}"/>
<path class="md-line" d="${FACE}"/>
<path class="md-line" data-part="chin" d="${parts.chin}"/>
<path class="md-wall" d="${PHARYNX}"/>
<path class="md-palate" d="${PALATE}"/>
<path class="md-tongue" data-part="tongue" d="${parts.tongue}"/>
${ghost ? `<path class="md-ghost" d="${ghost}"/>` : ''}
<path class="md-velum" data-part="velum" d="${parts.velum}"/>
<path class="md-tooth" d="${UPPER_TOOTH}"/>
<path class="md-tooth" data-part="lowerTooth" d="${parts.lowerTooth}"/>
<path class="md-lip" data-part="upperLip" d="${parts.upperLip}"/>
<path class="md-lip" data-part="lowerLip" d="${parts.lowerLip}"/>
<path class="md-larynx" d="${LARYNX}"/>
<g class="md-folds">
<path class="md-buzz" data-part="voiced" opacity="${n(a.voiced)}" d="${BUZZ}"${anim ? ' data-anim="buzz"' : ''}/>
<path class="md-open" data-part="voiceless" opacity="${n(1 - a.voiced)}" d="${OPEN_GLOTTIS}"/>
</g>
${
  anim
    ? `<path class="md-air" data-part="airMouth" opacity="${n(a.oral)}" d="${parts.airMouth}" data-anim="flow"/>
<path class="md-air" data-part="airNose" opacity="${n(a.nasal)}" d="${AIR_NOSE}" data-anim="flow"/>`
    : ''
}
<g data-part="focus" opacity="${n(a.focusOn)}">
<circle class="md-ring" data-part="ring" cx="${n(fx)}" cy="${n(fy)}" r="5"${anim ? ' data-anim="pulse"' : ''}/>
<circle class="md-focus" data-part="dot" cx="${n(fx)}" cy="${n(fy)}" r="4"/>
</g>
</svg>`);
}

/** Updates a rendered mouth diagram in place, for animation between sounds. */
export function updateMouth(svg: Element, a: Articulation): void {
  const parts = mouthParts(a);
  const set = (part: string, name: string, value: string) =>
    svg.querySelector(`[data-part="${part}"]`)?.setAttribute(name, value);
  for (const part of [
    'skin',
    'cavity',
    'upperLip',
    'lowerLip',
    'lowerTooth',
    'chin',
    'velum',
    'tongue',
    'airMouth',
  ] as const) {
    set(part, 'd', parts[part]);
  }
  set('voiced', 'opacity', n(a.voiced));
  set('voiceless', 'opacity', n(1 - a.voiced));
  set('airMouth', 'opacity', n(a.oral));
  set('airNose', 'opacity', n(a.nasal));
  set('focus', 'opacity', n(a.focusOn));
  for (const part of ['ring', 'dot']) {
    set(part, 'cx', n(parts.focus[0]));
    set(part, 'cy', n(parts.focus[1]));
  }
}

/** A plain-words description of the diagram, for screen readers. */
export function mouthLabel(key: SoundKey): string {
  const sound = soundByKey(key);
  const where = sound.place ? sound.place.toLowerCase() : 'tongue position for this vowel';
  const voice =
    sound.kind === 'consonant' ? (sound.voiced ? ', voice on' : ', voice off') : ', voice on';
  return `Mouth diagram for ${sound.name}: ${where}${voice}.`;
}

/** The diagram for a sound: a mouth cross-section, or a picture for a skill. */
export function soundFigure(key: SoundKey, options: Omit<MouthOptions, 'label'> = {}): SafeHtml {
  const a = articulationFor(key);
  if (!a) return skillArt(key);
  return mouthSvg(a, { ...options, label: mouthLabel(key), ghost: glideEndFor(key) });
}

/* ---------- Vowel chart ---------- */

const CHART = { left: 34, right: 226, top: 26, bottom: 156, slant: 84 };

/** Where a vowel point sits on the chart, in the chart's 240 × 180 space. */
function chartXY(point: VowelPoint): Point {
  const [back, open] = VOWEL_POINTS[point];
  const frontX = CHART.left + CHART.slant * open;
  return [mix(frontX, CHART.right, back), mix(CHART.top, CHART.bottom, open)];
}

/** The vowels shown on the chart, keyed by sound, with their chart positions in percent. */
export function vowelChartSpots(): { key: SoundKey; x: number; y: number; glide: boolean }[] {
  return (Object.entries(VOWELS) as [SoundKey, readonly VowelPoint[]][])
    .filter(([key]) => soundByKey(key).category !== 'r-colored')
    .map(([key, glide]) => {
      const [x, y] = chartXY(glide[0] as VowelPoint);
      return { key, x: (x / 240) * 100, y: (y / 180) * 100, glide: glide.length > 1 };
    });
}

let chartCount = 0;

/**
 * The vowel chart (the mouth seen from the side, front on the left), optionally highlighting one
 * vowel. Without dots, only the frame and the glide arrows are drawn, for pages that place their
 * own buttons on top.
 */
export function vowelChartSvg(
  highlight: SoundKey | null = null,
  label?: string,
  options: { dots?: boolean; axes?: boolean } = {},
): SafeHtml {
  const { left, right, top, bottom, slant } = CHART;
  const dots = options.dots !== false;
  const axes = options.axes !== false;
  // Marker ids must be unique on the page, and several charts can be rendered at once.
  const id = `vc${++chartCount}`;
  const a11y = label
    ? `role="img" aria-label="${escapeHtml(label)}"`
    : 'aria-hidden="true" focusable="false"';
  const third = (t: number) => {
    const y = mix(top, bottom, t);
    return `M${n(left + slant * t)} ${n(y)} L${right} ${n(y)}`;
  };
  const centerTop = (left + right) / 2;
  const centerBottom = (left + slant + right) / 2;
  const marks: string[] = [];
  const glides: string[] = [];
  for (const [key, glide] of Object.entries(VOWELS) as [SoundKey, readonly VowelPoint[]][]) {
    const on = key === highlight;
    const start = glide[0] as VowelPoint;
    const [x, y] = chartXY(start);
    if (glide.length > 1) {
      if (!on && soundByKey(key).category === 'r-colored') continue;
      const [ex, ey] = chartXY(glide[glide.length - 1] as VowelPoint);
      glides.push(
        `<path class="vc-glide${on ? ' on' : ''}" d="M${n(x)} ${n(y)} L${n(ex)} ${n(ey)}" marker-end="url(#${id}-arrow${on ? '-on' : ''})"/>`,
      );
      if (on) marks.push(`<circle class="vc-dot on" cx="${n(x)}" cy="${n(y)}" r="5"/>`);
      continue;
    }
    if (!dots && !on) continue;
    marks.push(
      `<circle class="vc-dot${on ? ' on' : ''}" cx="${n(x)}" cy="${n(y)}" r="${on ? 6 : 3.5}"/>`,
      `<text class="vc-ipa${on ? ' on' : ''}" x="${n(x)}" y="${n(y - 9)}">${escapeHtml(start)}</text>`,
    );
  }
  return raw(`<svg class="vowel-chart" viewBox="0 0 240 180" ${a11y}>
<defs>
<marker id="${id}-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="vc-arrowhead" d="M0 0 L8 4 L0 8 Z"/></marker>
<marker id="${id}-arrow-on" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="vc-arrowhead on" d="M0 0 L8 4 L0 8 Z"/></marker>
</defs>
<path class="vc-frame" d="M${left} ${top} L${right} ${top} L${right} ${bottom} L${left + slant} ${bottom} Z"/>
<path class="vc-grid" d="${third(1 / 3)} ${third(2 / 3)} M${n(centerTop)} ${top} L${n(centerBottom)} ${bottom}"/>
${
  axes
    ? `<text class="vc-axis" x="${left + slant}" y="${bottom + 18}">Front</text>
<text class="vc-axis" x="${right}" y="${bottom + 18}" text-anchor="end">Back</text>
<text class="vc-axis" x="${left - 6}" y="${top + 4}" text-anchor="end">High</text>
<text class="vc-axis" x="${left + slant - 6}" y="${bottom + 4}" text-anchor="end">Low</text>`
    : ''
}
${glides.join('\n')}
${marks.join('\n')}
</svg>`);
}

/* ---------- Skills and units ---------- */

const SKILL_ART: Record<string, string> = {
  stress: `<rect class="sk-soft" x="18" y="58" width="36" height="22" rx="11"/><rect class="sk-strong" x="62" y="34" width="56" height="46" rx="23"/><rect class="sk-soft" x="126" y="58" width="36" height="22" rx="11"/>`,
  rhythm: `<circle class="sk-strong" cx="30" cy="57" r="16"/><circle class="sk-soft" cx="62" cy="57" r="7"/><circle class="sk-soft" cx="84" cy="57" r="7"/><circle class="sk-strong" cx="116" cy="57" r="16"/><circle class="sk-soft" cx="148" cy="57" r="7"/>`,
  melody: `<path class="sk-line" d="M14 70 C40 70 50 30 80 30 C108 30 112 64 136 64 C150 64 158 50 166 40"/><circle class="sk-strong" cx="80" cy="30" r="7"/><path class="sk-arrow" d="M160 38 L168 38 L166 46"/>`,
  clusters: `<rect class="sk-strong" x="16" y="34" width="44" height="44" rx="10"/><rect class="sk-strong" x="68" y="34" width="44" height="44" rx="10"/><rect class="sk-strong" x="120" y="34" width="44" height="44" rx="10"/><text class="sk-text" x="38" y="65">s</text><text class="sk-text" x="90" y="65">t</text><text class="sk-text" x="142" y="65">r</text>`,
};

function skillSvg(kind: keyof typeof SKILL_ART, label?: string): SafeHtml {
  const a11y = label
    ? `role="img" aria-label="${escapeHtml(label)}"`
    : 'aria-hidden="true" focusable="false"';
  return raw(`<svg class="skill-art" viewBox="0 0 180 110" ${a11y}>${SKILL_ART[kind]}</svg>`);
}

const SKILL_FOR: Partial<Record<SoundKey, keyof typeof SKILL_ART>> = {
  'word-stress': 'stress',
  rhythm: 'rhythm',
  intonation: 'melody',
  clusters: 'clusters',
};

function skillArt(key: SoundKey): SafeHtml {
  const kind = SKILL_FOR[key] ?? 'stress';
  return skillSvg(kind, `Picture of ${soundByKey(key).name.toLowerCase()}`);
}

const UNIT_ART: Record<UnitKey, SoundKey | keyof typeof SKILL_ART> = {
  stops: 'p',
  fricatives: 'th-voiceless',
  sonorants: 'm',
  'front-vowels': 'i',
  'back-vowels': 'long-oo',
  'glides-r': 'r',
  stress: 'stress',
  flow: 'melody',
};

/** A small, decorative picture for a unit. */
export function unitArt(unit: UnitKey): SafeHtml {
  const art = UNIT_ART[unit];
  if (art in SKILL_ART) return skillSvg(art as keyof typeof SKILL_ART);
  const a = articulationFor(art as SoundKey);
  return a ? mouthSvg(a, { compact: true, animated: false }) : skillSvg('stress');
}
