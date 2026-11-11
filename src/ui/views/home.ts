/**
 * The homepage: what the app teaches and how, with a moving mouth diagram, a tap-to-hear vowel
 * chart and the lesson path. The page itself is static; the call to action, the unit progress and
 * the recordings are small regions that follow the learner's data.
 */
import {
  BRIDGE_ID,
  getLesson,
  lessonNumber,
  SESSION_MINUTES,
  SOUNDS,
  soundByKey,
  STEPS,
  TOTAL_LESSONS,
  unitOf,
  UNITS,
} from '../../content/course';
import type { SoundKey, StepId } from '../../content/types';
import { lessonStatus, passedCount, suggestedLesson } from '../../domain/progress';
import type { AppState } from '../../state/app-state';
import { sayButton } from '../components';
import { html, raw, type SafeHtml } from '../html';
import { ICONS } from '../icons';
import {
  articulationFor,
  mouthSvg,
  unitArt,
  vowelChartSpots,
  vowelChartSvg,
} from '../illustrations';

/** The sounds the homepage diagram tours through, chosen to show very different mouth shapes. */
export const DEMO_SOUNDS: readonly SoundKey[] = [
  'th-voiceless',
  'r',
  'ae',
  'ng',
  'long-oo',
  'f',
  'l',
  'i',
];

/** Step names in general terms; inside a lesson they are more specific. */
const STEP_NAMES: Record<StepId, string> = {
  warmup: 'Warm up',
  learn: 'Learn the sound',
  listen: 'Ear test',
  twister: 'Tongue twister',
  shadow: 'Shadowing',
  reflect: 'Rate yourself',
};

const SOUND_COUNT = SOUNDS.filter((x) => x.kind === 'consonant' || x.kind === 'vowel').length;

const FLOATERS = ['ʃ', 'ɝ', 'ð', 'ɑ', 'ŋ', 'oʊ'];

function heroVisual(): SafeHtml {
  const first = DEMO_SOUNDS[0] ?? 'th-voiceless';
  const sound = soundByKey(first);
  const shape = articulationFor(first);
  return html`<div class="hh-visual" id="mouth-demo">
    ${FLOATERS.map(
      (g, i) => html`<span class="floater f${i}" aria-hidden="true" data-anim="float">${g}</span>`,
    )}
    <div class="demo-card">
      <div class="demo-top">
        <span class="demo-ipa" data-demo="ipa">/${sound.ipa}/</span>
        <div class="demo-text">
          <b data-demo="name">${sound.name}</b>
          <span data-demo="place">${sound.place ?? ''}</span>
        </div>
      </div>
      <figure class="demo-figure">
        ${shape ? mouthSvg(shape, { label: 'Animated mouth diagram moving between sounds' }) : ''}
      </figure>
      <div class="demo-bottom">
        <button
          type="button"
          class="btn primary sm demo-say"
          data-say="${sound.keyword}"
          data-rate="0.8"
          data-demo="say"
        >
          ${ICONS.speak}<span data-demo="word">Hear “${sound.keyword}”</span>
        </button>
        <div class="demo-chips" role="group" aria-label="Show a sound in the diagram">
          ${DEMO_SOUNDS.map((key) => {
            const s = soundByKey(key);
            return html`<button
              type="button"
              class="demo-chip"
              data-action="demo-sound"
              data-sound="${key}"
              aria-pressed="${String(key === first)}"
              aria-label="${s.name}"
            >
              ${s.ipa}
            </button>`;
          })}
        </div>
      </div>
      <div class="legend" aria-hidden="true">
        <span><i class="lg-tongue"></i>Tongue</span>
        <span><i class="lg-focus"></i>Where it happens</span>
        <span><i class="lg-air"></i>Air</span>
        <span><i class="lg-buzz"></i>Voice</span>
      </div>
    </div>
  </div>`;
}

const HOW_ART = {
  see: '',
  hear: raw(`<svg class="how-art" viewBox="0 0 180 110" aria-hidden="true" focusable="false">
<rect class="ha-card" x="14" y="22" width="68" height="66" rx="14"/><text class="ha-word" x="48" y="62">ship</text>
<rect class="ha-card on" x="98" y="22" width="68" height="66" rx="14"/><text class="ha-word on" x="132" y="62">sheep</text>
<path class="ha-wave" d="M60 100 q6 -10 12 0 t12 0 t12 0 t12 0 t12 0"/>
</svg>`),
  say: raw(`<svg class="how-art" viewBox="0 0 180 110" aria-hidden="true" focusable="false">
<path class="ha-bubble" d="M22 18 h136 a12 12 0 0 1 12 12 v38 a12 12 0 0 1 -12 12 h-96 l-20 18 v-18 h-20 a12 12 0 0 1 -12 -12 v-38 a12 12 0 0 1 12 -12 z"/>
<rect class="ha-line on" x="32" y="34" width="70" height="9" rx="4.5"/><rect class="ha-line" x="108" y="34" width="40" height="9" rx="4.5"/>
<rect class="ha-line" x="32" y="52" width="44" height="9" rx="4.5"/><rect class="ha-line on" x="82" y="52" width="58" height="9" rx="4.5"/>
</svg>`),
  track: raw(`<svg class="how-art" viewBox="0 0 180 110" aria-hidden="true" focusable="false">
<path class="ha-grid" d="M20 90 H164 M20 64 H164 M20 38 H164"/>
<path class="ha-line-chart" d="M24 84 L56 70 L88 74 L120 46 L156 30"/>
<circle class="ha-point" cx="56" cy="70" r="4.5"/><circle class="ha-point" cx="88" cy="74" r="4.5"/><circle class="ha-point" cx="120" cy="46" r="4.5"/><circle class="ha-point on" cx="156" cy="30" r="6"/>
</svg>`),
};

function howItWorks(): SafeHtml {
  const r = articulationFor('r');
  const cards = [
    {
      art: r ? mouthSvg(r, { compact: true, animated: false }) : HOW_ART.see,
      title: 'See it',
      text: 'A mouth diagram for every sound shows where your tongue, lips and teeth go, and whether your voice is on.',
    },
    {
      art: HOW_ART.hear,
      title: 'Hear it',
      text: 'Real recordings of American speakers, and ear tests with pairs like ship and sheep that train you to notice the difference.',
    },
    {
      art: HOW_ART.say,
      title: 'Say it',
      text: 'Word drills, tongue twisters and shadowing scripts move the sound from single words into natural speech.',
    },
    {
      art: HOW_ART.track,
      title: 'Track it',
      text: 'Rate each session, log the words that trip you up, and come back to them until they feel easy.',
    },
  ];
  return html`<section class="home-section" aria-labelledby="how-title">
    <div class="section-head" data-reveal>
      <p class="eyebrow">How it works</p>
      <h2 class="section-title" id="how-title">Four ways into every sound</h2>
    </div>
    <div class="how-grid" data-reveal="stagger">
      ${cards.map(
        (c, i) => html`<article class="how-card">
          <div class="how-figure">${c.art}</div>
          <span class="how-n">${i + 1}</span>
          <h3>${c.title}</h3>
          <p>${c.text}</p>
        </article>`,
      )}
    </div>
    <div class="steps-strip" data-reveal>
      <span class="strip-label">Every lesson, about ${SESSION_MINUTES} minutes:</span>
      <ol>
        ${STEPS.map(
          (st) => html`<li><b>${STEP_NAMES[st.id]}</b><span>${st.minutes} min</span></li>`,
        )}
      </ol>
    </div>
  </section>`;
}

function vowelSection(): SafeHtml {
  const spots = vowelChartSpots();
  const singles = spots.filter((x) => !x.glide);
  const glides = spots.filter((x) => x.glide);
  return html`<section class="home-section home-vowels" aria-labelledby="vowels-title">
    <div class="hv-copy" data-reveal>
      <p class="eyebrow">Vowel map</p>
      <h2 class="section-title" id="vowels-title">Every vowel, mapped to your mouth</h2>
      <p>
        Vowels differ in where the tongue is highest: front or back, high or low. Tap a vowel to
        hear it. Arrows show the vowels that glide from one position to another, like the
        <i>i</i> in <i>time</i>.
      </p>
      <div class="glide-row" role="group" aria-label="Gliding vowels">
        ${glides.map((x) => {
          const s = soundByKey(x.key);
          return sayButton(s.keyword, html`<b class="ipa-sym">${s.ipa}</b> ${s.keyword}`, {
            className: 'word glide-btn',
            rate: 0.8,
            ariaLabel: `${s.name}. Hear “${s.keyword}”`,
          });
        })}
      </div>
      <a class="btn sm" href="#sounds">Open the full sound chart ${ICONS.arrow}</a>
    </div>
    <div class="hv-chart" data-reveal>
      <span class="hv-axis hv-high" aria-hidden="true">High tongue</span>
      <span class="hv-axis hv-low" aria-hidden="true">Low tongue</span>
      <span class="hv-axis hv-front" aria-hidden="true">← Front</span>
      <span class="hv-axis hv-back" aria-hidden="true">Back →</span>
      ${vowelChartSvg(null, undefined, { dots: false, axes: false })}
      ${singles.map((x) => {
        const s = soundByKey(x.key);
        return html`<button
          type="button"
          class="vc-spot"
          data-say="${s.keyword}"
          data-rate="0.8"
          data-x="${x.x.toFixed(2)}"
          data-y="${x.y.toFixed(2)}"
          aria-label="${s.name}. Hear “${s.keyword}”"
        >
          <b>${s.ipa}</b><span>${s.keyword}</span>
        </button>`;
      })}
    </div>
  </section>`;
}

/** The static homepage. Dynamic parts render into the regions it leaves empty. */
export function homeView(): SafeHtml {
  return html`<section class="home-hero" aria-labelledby="home-title">
      <div class="hh-copy">
        <p class="eyebrow hh-eyebrow">General American pronunciation</p>
        <h1 class="hh-title" id="home-title">
          <span class="nw">See it.</span> <span class="nw">Hear it.</span>
          <span class="nw grad">Say it.</span>
        </h1>
        <p class="hh-lead">
          Learn all ${SOUND_COUNT} sounds of American English with moving mouth diagrams, real
          recordings of American speakers and short lessons that build up to natural rhythm and
          intonation.
        </p>
        <div class="hh-cta" id="home-cta"></div>
        <ul class="hh-proof">
          <li>${ICONS.check}No account needed</li>
          <li>${ICONS.check}Works offline</li>
          <li>${ICONS.check}Your progress stays on this device</li>
        </ul>
      </div>
      ${heroVisual()}
    </section>

    <section class="home-stats" aria-label="The course in numbers" data-reveal="stagger">
      <div class="hstat">
        <b data-count="${SOUND_COUNT}">${SOUND_COUNT}</b><span>sounds, consonants and vowels</span>
      </div>
      <div class="hstat">
        <b data-count="${TOTAL_LESSONS}">${TOTAL_LESSONS}</b><span>lessons in ${UNITS.length} units</span>
      </div>
      <div class="hstat" id="home-rec"></div>
      <div class="hstat">
        <b data-count="${SESSION_MINUTES}">${SESSION_MINUTES}</b><span>minutes a lesson</span>
      </div>
    </section>

    ${howItWorks()} ${vowelSection()}

    <section class="home-section" aria-labelledby="path-units-title">
      <div class="section-head" data-reveal>
        <p class="eyebrow">The path</p>
        <h2 class="section-title" id="path-units-title">From single sounds to natural speech</h2>
        <p class="muted">
          Eight units take you through every consonant and vowel, then word stress, rhythm and
          intonation. Every lesson is open, so you can start anywhere, but the order is there to
          help.
        </p>
      </div>
      <div class="unit-grid" id="home-path" data-reveal></div>
    </section>

    <section class="home-section home-voices" aria-labelledby="voices-title" data-reveal>
      <div class="section-head">
        <p class="eyebrow">Real voices</p>
        <h2 class="section-title" id="voices-title">Hear American speakers, not just a computer</h2>
      </div>
      <div id="home-voices"></div>
    </section>

    <section class="home-end" aria-labelledby="end-title" data-reveal>
      <h2 id="end-title">Ready for your next sound?</h2>
      <p>One lesson takes about ${SESSION_MINUTES} minutes. Two a week is a great pace.</p>
      <div class="hh-cta" id="home-cta-end"></div>
    </section>

    <footer class="home-foot">
      <p>
        Recordings by volunteer speakers on Wikimedia Commons, shared under free licenses: see the
        credits on the <a href="#progress">Progress</a> page. Everything you log stays in this
        browser.
      </p>
    </footer>`;
}

/** The main call to action: start the first lesson, or continue where the learner is. */
export function homeCtaView(s: AppState): SafeHtml {
  const suggested = suggestedLesson(s.runs);
  const lesson = getLesson(suggested);
  const started = s.runs.length > 0;
  if (!lesson || suggested === BRIDGE_ID) {
    return html`<a class="btn primary big" href="#progress">See your progress ${ICONS.arrow}</a
      ><a class="btn big ghost" href="#sounds">Explore the sounds</a>`;
  }
  const label = started
    ? `Continue with Lesson ${lessonNumber(lesson.id)}`
    : 'Start the first lesson';
  return html`<button
      type="button"
      class="btn primary big"
      data-action="go-lesson"
      data-lesson="${lesson.id}"
    >
      ${label} ${ICONS.arrow}</button
    ><a class="btn big ghost" href="#sounds">Explore the sounds</a>
    <span class="cta-note"
      >${started ? `Up next: ${lesson.title}` : `Lesson 1: ${lesson.title} · no sign-up`}</span
    >`;
}

/** The eight units, with the learner's progress in each. */
export function homePathView(s: AppState): SafeHtml {
  const passed = passedCount(s.runs);
  const suggested = suggestedLesson(s.runs);
  const current = unitOf(suggested)?.key;
  return html`${UNITS.map((unit, i) => {
    const done = unit.lessons.filter((l) => lessonStatus(s.runs, l.id) === 'passed').length;
    const target =
      unit.lessons.find((l) => lessonStatus(s.runs, l.id) !== 'passed') ?? unit.lessons[0];
    const pct = Math.round((done / unit.lessons.length) * 100);
    return html`<button
        type="button"
        class="unit-card${unit.key === current ? ' current' : ''}"
        data-action="go-lesson"
        data-lesson="${target?.id ?? ''}"
      >
        <span class="uc-art">${unitArt(unit.key)}</span>
        <span class="uc-body">
          <span class="uc-n">Unit ${i + 1}${unit.key === current ? ' · up next' : ''}</span>
          <b class="uc-name">${unit.name}</b>
          <span class="uc-sum">${unit.summary}</span>
          <span class="uc-foot">
            <span class="meter thin" aria-hidden="true"><i data-pct="${pct}"></i></span>
            <span class="uc-count">${done}/${unit.lessons.length}</span>
          </span>
        </span>
      </button>`;
  })}
    <p class="unit-total small muted">${passed} of ${TOTAL_LESSONS} lessons passed so far.</p>`;
}

/** The recordings count for the stats row. */
export function homeRecordingsStat(s: AppState): SafeHtml {
  const count = s.audio.phase === 'ready' ? s.audio.count : 0;
  return count
    ? html`<b data-count="${count}">${count}</b><span>real recordings of American speakers</span>`
    : html`<b>${ICONS.person}</b><span>real recordings of American speakers</span>`;
}

/** Sample words to play, and who recorded them. */
export function homeVoicesView(s: AppState, speakers: number): SafeHtml {
  const sample = SOUNDS.filter((x) => x.kind === 'consonant' || x.kind === 'vowel')
    .filter((x) => x.keyword && !x.keyword.includes(' '))
    .slice(0, 46)
    .filter((_, i) => i % 3 === 0);
  const ready = s.audio.phase === 'ready' && s.audio.count > 0;
  return html`<div class="voices">
    <p class="voices-text">
      ${
        ready
          ? `Single words play recordings made by ${speakers || 'volunteer'} American speakers for Wiktionary: ${s.audio.count} words across the course. Look for the green badge. Sentences use the best voice on your device.`
          : 'Single words play real recordings of American speakers where one exists, marked with a green badge. Sentences use the best voice on your device.'
      }
    </p>
    <div class="words voice-words">
      ${sample.map((x) =>
        sayButton(
          x.keyword,
          html`<span class="w">${x.keyword}</span> <span class="ipa">/${x.ipa}/</span>`,
          {
            rate: 0.8,
          },
        ),
      )}
    </div>
  </div>`;
}
