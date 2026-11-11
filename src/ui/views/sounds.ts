/** The Sounds view: a chart of every General American sound, and a detail panel for one. */
import {
  CATEGORY_HINTS,
  CATEGORY_LABELS,
  cardForSound,
  KIND_LABELS,
  lessonNumber,
  lessonsForSound,
  PASS_RATING,
  SOUNDS,
  soundByKey,
  soundsByCategory,
} from '../../content/course';
import type { Sound, SoundKind } from '../../content/types';
import {
  LESSON_STATUS_NAMES,
  lessonStatus,
  NOTE_LEVEL_NAMES,
  soundProgress,
  type SoundProgress,
} from '../../domain/progress';
import type { AppState } from '../../state/app-state';
import { sayButton } from '../components';
import { plural, youglishUrl } from '../format';
import { html, type SafeHtml } from '../html';
import { ICONS } from '../icons';
import { articulationFor, mouthSvg, soundFigure, vowelChartSvg } from '../illustrations';
import { formatSpelling } from './practice';

const CHART_KINDS: SoundKind[] = ['consonant', 'vowel', 'skill'];

function tileLabel(sound: Sound, p: SoundProgress): string {
  const parts = [`/${sound.ipa}/`, sound.name, LESSON_STATUS_NAMES[p.status]];
  if (p.noteLevel) parts.push(`notebook: ${NOTE_LEVEL_NAMES[p.noteLevel]}`);
  return parts.join('. ');
}

function tile(s: AppState, sound: Sound): SafeHtml {
  const p = soundProgress(sound.key, s.runs, s.notes);
  const meta =
    sound.kind === 'consonant'
      ? sound.voiced
        ? 'voiced'
        : 'voiceless'
      : sound.kind === 'skill'
        ? 'skill'
        : '';
  return html`<button
    type="button"
    class="tile st-${p.status}"
    data-action="open-sound"
    data-sound="${sound.key}"
    data-key="tile-${sound.key}"
    aria-pressed="${String(s.sound === sound.key)}"
    aria-label="${tileLabel(sound, p)}"
  >
    <span class="tile-ipa">${sound.ipa}</span><span class="tile-word">${sound.keyword}</span
    >${meta ? html`<span class="tile-meta">${meta}</span>` : ''}${p.noteLevel ? html`<span class="tile-note n${p.noteLevel}" aria-hidden="true"></span>` : ''}
  </button>`;
}

export function soundChartView(s: AppState): SafeHtml {
  const sounds = SOUNDS.filter((x) => x.kind !== 'other');
  const progress = sounds.map((x) => soundProgress(x.key, s.runs, s.notes).status);
  const passed = progress.filter((x) => x === 'passed').length;
  const practiced = progress.filter((x) => x !== 'new').length;
  return html`<div class="chart-summary small muted">
      ${plural(sounds.length, 'sound')} and skills · ${practiced} practiced · ${passed} passed
    </div>
    ${CHART_KINDS.map(
      (kind) =>
        html`<section class="kind kind-${kind}" aria-labelledby="kind-${kind}">
          <h2 class="kind-title" id="kind-${kind}">${KIND_LABELS[kind]}</h2>
          ${soundsByCategory(kind).map(
            ({ category, sounds: group }) =>
              html`<div class="cat">
                <div class="cat-head">
                  <h3 class="cat-title">${CATEGORY_LABELS[category]}</h3>
                  <p class="cat-hint">${CATEGORY_HINTS[category]}</p>
                </div>
                <div class="tiles">${group.map((sound) => tile(s, sound))}</div>
              </div>`,
          )}
        </section>`,
    )}`;
}

function figureCaption(sound: Sound): SafeHtml {
  if (sound.kind === 'consonant') {
    return html`<b>Where:</b> ${sound.place ?? ''}. ${sound.voiced ? 'Voice on: the vocal folds buzz.' : 'Voice off: just air.'}`;
  }
  if (sound.kind === 'vowel') {
    return sound.category === 'diphthong' || sound.category === 'r-colored'
      ? html`The tongue starts here and glides to the <b>dashed outline</b>.`
      : html`The dot marks the highest point of the tongue.`;
  }
  return html`${CATEGORY_HINTS[sound.category]}`;
}

export function soundDetailView(s: AppState): SafeHtml {
  if (!s.sound) {
    const rest = articulationFor('schwa');
    return html`<div class="detail-empty">
      <figure class="sd-figure empty-figure">
        ${rest ? mouthSvg(rest, { label: 'Mouth diagram at rest' }) : ''}
      </figure>
      <h2 class="h3" id="sound-detail-title" tabindex="-1">Pick a sound</h2>
      <p>
        Select any sound in the chart to see how to make it, how it’s spelled, and to hear example
        words. Words marked with
        <span class="rec-dot" aria-hidden="true">${ICONS.person}</span> are real recordings of
        American speakers.
      </p>
      <ul class="legend-list">
        <li><i class="lg passed"></i>Passed (rated ${PASS_RATING} or higher)</li>
        <li><i class="lg practiced"></i>Practiced, repeat suggested</li>
        <li><i class="lg new"></i>Not started</li>
        <li><i class="lg note"></i>In your Sound notebook</li>
      </ul>
    </div>`;
  }
  const sound = soundByKey(s.sound);
  const found = cardForSound(sound.key);
  const card = found?.card;
  const lessons = lessonsForSound(sound.key);
  const notes = s.notes.filter((n) => n.sound === sound.key);
  const facts: string[] = [CATEGORY_LABELS[sound.category]];
  if (sound.kind === 'consonant') {
    facts.push(sound.voiced ? 'Voiced: your throat buzzes' : 'Voiceless: no buzz, just air');
  }

  return html`<div class="detail-head">
      <span class="big-ipa">/${sound.ipa}/</span>
      <div class="grow">
        <h2 class="h3" id="sound-detail-title" tabindex="-1">${sound.name}</h2>
        <p class="small muted">${facts.join(' · ')}</p>
      </div>
      <button
        type="button"
        class="icon-btn"
        data-action="close-sound"
        data-key="close-sound"
        aria-label="Close ${sound.name}"
      >
        ×
      </button>
    </div>
    <div class="sd-figures${sound.kind === 'vowel' ? ' two' : ''}">
      <figure class="sd-figure">
        ${soundFigure(sound.key)}
        <figcaption>${figureCaption(sound)}</figcaption>
      </figure>
      ${
        sound.kind === 'vowel'
          ? html`<figure class="sd-figure">
              ${vowelChartSvg(sound.key, `Vowel chart with ${sound.name} highlighted`)}
              <figcaption>Where it sits among the vowels</figcaption>
            </figure>`
          : ''
      }
    </div>
    ${
      card
        ? html`<h3 class="lbl">How to make it</h3>
            <ol class="how">
              ${card.how.map((x) => html`<li>${x}</li>`)}
            </ol>
            ${
              card.spellings?.length
                ? html`<p class="spellings">
                    <span class="lbl">Spelled</span>${card.spellings.map((sp) => html`<span class="spell">${formatSpelling(sp)}</span>`)}
                  </p>`
                : ''
            }
            <h3 class="lbl">Example words</h3>
            <div class="words">
              ${card.words.map(([word, ipa]) =>
                sayButton(
                  word,
                  html`<span class="w">${word}</span> <span class="ipa">/${ipa}/</span>`,
                  { rate: 0.8 },
                ),
              )}
            </div>`
        : html`<p>${CATEGORY_HINTS[sound.category]}</p>
            <div class="words">${sayButton(sound.keyword, sound.keyword, { rate: 0.8 })}</div>`
    }
    <h3 class="lbl">Practice it</h3>
    <div class="detail-lessons">
      ${lessons.map((lesson) => {
        const status = lessonStatus(s.runs, lesson.id);
        return html`<button
          type="button"
          class="lrow"
          data-action="go-lesson"
          data-lesson="${lesson.id}"
          data-key="detail-${lesson.id}"
        >
          <span class="lmark ${status}" aria-hidden="true"
            >${status === 'passed' ? ICONS.check : lessonNumber(lesson.id)}</span
          ><span class="ltitle"
            >${lesson.title}<span class="lsub">${LESSON_STATUS_NAMES[status]}</span></span
          >
        </button>`;
      })}
    </div>
    <div class="row detail-actions">
      <button
        type="button"
        class="btn sm"
        data-action="note-sound"
        data-sound="${sound.key}"
        data-key="note-sound"
      >
        Log a difficult word${notes.length ? ` (${notes.length} in notebook)` : ''}
      </button>
      ${
        sound.keyword
          ? html`<a
              class="btn sm quiet"
              href="${youglishUrl(sound.keyword)}"
              target="_blank"
              rel="noopener noreferrer"
              >“${sound.keyword}” in real videos ↗</a
            >`
          : ''
      }
    </div>`;
}
