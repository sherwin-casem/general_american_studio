/** The Lessons view: the path of units and lessons, and the header card of the open lesson. */
import {
  BRIDGE_ID,
  getLesson,
  LESSONS,
  lessonNumber,
  lessonSymbols,
  nextLesson,
  PASS_RATING,
  STEPS,
  TOTAL_LESSONS,
  unitOf,
  UNITS,
} from '../../content/course';
import type { Lesson } from '../../content/types';
import {
  bestRating,
  lessonStatus,
  passedCount,
  runsForLesson,
  suggestedLesson,
  type LessonStatus,
} from '../../domain/progress';
import type { AppState } from '../../state/app-state';
import { draftFor } from '../../state/drafts';
import { plural } from '../format';
import { html, type SafeHtml } from '../html';
import { ICONS } from '../icons';
import { unitArt } from '../illustrations';

export function symbolChips(lesson: Lesson, limit = 4): SafeHtml {
  const symbols = lessonSymbols(lesson);
  const shown = symbols.slice(0, limit);
  return html`<span class="chips" aria-hidden="true"
    >${shown.map((sym) => html`<span class="sym">${sym}</span>`)}${symbols.length > limit ? html`<span class="sym more">+${symbols.length - limit}</span>` : ''}</span
  >`;
}

function statusMark(status: LessonStatus, n: number): SafeHtml {
  return html`<span class="lmark ${status}" aria-hidden="true"
    >${status === 'passed' ? ICONS.check : n}</span
  >`;
}

/** The lesson path. The unit of the open lesson starts expanded. */
export function pathView(s: AppState): SafeHtml {
  const suggested = suggestedLesson(s.runs);
  const openUnit = unitOf(s.lesson)?.key ?? unitOf(suggested)?.key;
  const passed = passedCount(s.runs);
  const units = UNITS.map((unit) => {
    const done = unit.lessons.filter((l) => lessonStatus(s.runs, l.id) === 'passed').length;
    return html`<details class="unit" ${unit.key === openUnit ? ' open' : ''}>
      <summary data-key="unit-${unit.key}">
        <span class="unit-art">${unitArt(unit.key)}</span><span class="unit-name">${unit.name}</span
        ><span class="unit-count">${done}/${unit.lessons.length}</span>${ICONS.chevron}
      </summary>
      <ol class="lessons">
        ${unit.lessons.map((lesson) => {
          const status = lessonStatus(s.runs, lesson.id);
          const current = lesson.id === s.lesson;
          const next = lesson.id === suggested;
          return html`<li>
            <button
              type="button"
              class="lrow${current ? ' current' : ''}"
              data-action="pick-lesson"
              data-lesson="${lesson.id}"
              data-key="path-${lesson.id}"
              aria-current="${current ? 'step' : 'false'}"
            >
              ${statusMark(status, lessonNumber(lesson.id))}
              <span class="ltitle"
                >${lesson.title}<span class="lsub"
                  >${status === 'passed' ? 'Passed' : status === 'practiced' ? 'Repeat suggested' : next ? 'Up next' : 'Not started'}</span
                ></span
              >${symbolChips(lesson, 2)}
            </button>
          </li>`;
        })}
      </ol>
    </details>`;
  });
  return html`<div class="path-head">
      <span class="eyebrow">Your path</span>
      <span class="small muted">${passed} of ${TOTAL_LESSONS} passed</span>
    </div>
    <div
      class="meter"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="${TOTAL_LESSONS}"
      aria-valuenow="${passed}"
      aria-label="Lessons passed"
    >
      <i data-pct="${Math.round((passed / TOTAL_LESSONS) * 100)}"></i>
    </div>
    ${units}
    <button
      type="button"
      class="lrow bridge-row${s.lesson === BRIDGE_ID ? ' current' : ''}"
      data-action="pick-lesson"
      data-lesson="${BRIDGE_ID}"
      data-key="path-${BRIDGE_ID}"
      aria-current="${s.lesson === BRIDGE_ID ? 'step' : 'false'}"
    >
      <span class="lmark" aria-hidden="true">${ICONS.arrow}</span
      ><span class="ltitle"
        >Business English<span class="lsub">After the path</span></span
      >
    </button>`;
}

/** Compact current-lesson summary shown above the path on small screens. */
export function pathSummaryView(s: AppState): SafeHtml {
  const lesson = getLesson(s.lesson);
  return html`<span>${lesson ? `Lesson ${lessonNumber(lesson.id)} of ${TOTAL_LESSONS}: ${lesson.title}` : 'Business English'}</span>`;
}

export function lessonHeadView(s: AppState): SafeHtml {
  const lesson = getLesson(s.lesson);
  if (!lesson) {
    return html`<span class="eyebrow">After the path</span>
      <h2 class="lh-title" tabindex="-1">Business English</h2>
      <p class="lh-goal">
        You have passed ${passedCount(s.runs)} of ${TOTAL_LESSONS} lessons. Keep repeating lessons
        while you start Business English, so the sounds stay automatic.
      </p>`;
  }
  const unit = unitOf(lesson.id);
  const draft = draftFor(s.drafts, lesson.id);
  const done = STEPS.filter((st) => draft.done[st.id]).length;
  const sessions = runsForLesson(s.runs, lesson.id).length;
  const best = bestRating(s.runs, lesson.id);
  const pct = Math.round((done / STEPS.length) * 100);
  const i = LESSONS.indexOf(lesson);
  const prev = LESSONS[i - 1];
  const next = nextLesson(lesson.id);

  return html`<div class="lh-top">
      <div class="grow">
        <span class="eyebrow"
          >Lesson ${lessonNumber(lesson.id)} of ${TOTAL_LESSONS} · ${unit?.name ?? ''}</span
        >
        <h2 class="lh-title" tabindex="-1">${lesson.title}</h2>
      </div>
      ${symbolChips(lesson, 5)}
    </div>
    <p class="lh-goal">${lesson.goal}</p>
    <div class="lh-stats">
      <div class="lh-progress">
        <div class="wc-row">
          <span>This session</span><span>${done} of ${STEPS.length} steps</span>
        </div>
        <div
          class="meter"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="${STEPS.length}"
          aria-valuenow="${done}"
          aria-label="Session steps done"
        >
          <i data-pct="${pct}"></i>
        </div>
      </div>
      <div class="fact">
        <b>${sessions}</b><span>${plural(sessions, 'session').replace(/^\d+ /, '')} logged</span>
      </div>
      <div class="fact"><b>${best ? `${best}/5` : '–'}</b><span>best clarity</span></div>
    </div>
    <p class="small muted">
      Aim for 2 or 3 short sessions. Move on once you rate it ${PASS_RATING} or higher.
    </p>
    <div class="lh-nav">
      ${prev ? html`<button type="button" class="btn sm" data-action="pick-lesson" data-lesson="${prev.id}" data-key="lh-prev">← ${prev.title}</button>` : ''}
      ${next ? html`<button type="button" class="btn sm" data-action="pick-lesson" data-lesson="${next.id}" data-key="lh-next">${next.title} →</button>` : ''}
      ${done ? html`<button type="button" class="btn sm quiet" data-action="reset-steps">Clear ticks</button>` : ''}
    </div>`;
}
