import {
  BRIDGE_ID,
  drillRows,
  getLesson,
  LESSONS,
  lessonNumber,
  nextLesson,
  PASS_RATING,
  REPS_PER_LEVEL,
  resolveQuiz,
  SHADOW_PASSES,
  soundByKey,
  STEPS,
  stepTitle,
  TOTAL_LESSONS,
  TWISTER_LEVEL_LABELS,
  unitOf,
} from '../../content/course';
import type { Lesson, SoundCard, StepId } from '../../content/types';
import { parseStressWord, renderMarkup, toSpeech } from '../../domain/markup';
import { passedCount, suggestedLesson, weakestLesson } from '../../domain/progress';
import type { AppState } from '../../state/app-state';
import { draftFor, type LessonDraft } from '../../state/drafts';
import { ratingButtons, sayButton, sayMarkup, stressWord } from '../components';
import { youglishUrl } from '../format';
import { html, type SafeHtml } from '../html';
import { ICONS } from '../icons';

/** Slower model speed for single sounds, closer to natural for stress and melody. */
export function slowRate(lesson: Lesson): number {
  const unit = unitOf(lesson.id)?.key;
  return unit === 'stress' || unit === 'flow' ? 0.8 : 0.7;
}

/** "a_e" in content means a split spelling, as in "make". */
export function formatSpelling(spelling: string): string {
  return spelling.replace(/_/g, '…');
}

export function stepsView(s: AppState): SafeHtml {
  if (s.lesson === BRIDGE_ID) return bridgeView(s);
  const lesson = getLesson(s.lesson);
  if (!lesson) return html``;
  const draft = draftFor(s.drafts, lesson.id);
  const firstOpen = STEPS.findIndex((st) => !draft.done[st.id]);

  const steps = STEPS.map((step, i) => {
    const done = Boolean(draft.done[step.id]);
    const footer =
      step.id === 'reflect'
        ? html`<div class="step-foot">
            <button type="button" class="btn primary" data-action="finish" data-key="finish">
              Finish and save session</button
            ><span class="small muted">Saves your rating, minutes and note to Progress.</span>
          </div>`
        : html`<div class="step-foot">
            ${
              done
                ? html`<button
                    type="button"
                    class="btn sm quiet"
                    data-action="step-undo"
                    data-step="${step.id}"
                  >
                    Mark as not done
                  </button>`
                : html`<button
                    type="button"
                    class="btn primary sm"
                    data-action="step-done"
                    data-step="${step.id}"
                  >
                    Done, next step
                  </button>`
            }
          </div>`;
    return html`<details
      class="step${done ? ' done' : ''}"
      data-step="${step.id}"
      ${i === firstOpen ? ' open' : ''}
    >
      <summary data-key="sum-${step.id}">
        <span class="num" aria-hidden="true">${done ? ICONS.check : i + 1}</span
        ><span class="st-title">${stepTitle(lesson, step.id)}</span
        ><span class="st-meta"
          >${done ? html`Done<span class="sr-only"> (step ${i + 1})</span>` : `${step.minutes} min`}</span
        >${ICONS.chevron}
      </summary>
      <div class="step-body">${stepBody(lesson, step.id, draft)}${footer}</div>
    </details>`;
  });

  return html`${s.justFinished?.lesson === lesson.id ? doneBanner(lesson, s.justFinished.rating) : ''}${steps}`;
}

function stepBody(lesson: Lesson, id: StepId, draft: LessonDraft): SafeHtml {
  switch (id) {
    case 'warmup':
      return warmupBody(lesson);
    case 'learn':
      return learnBody(lesson);
    case 'listen':
      return listenBody(lesson);
    case 'twister':
      return html`<p class="lead">
          Say each level slowly first. Count a rep only when every target sound was clear. Speed
          comes last.
        </p>
        <div class="tw" id="twister-levels"></div>`;
    case 'shadow':
      return shadowBody(lesson, draft);
    case 'reflect':
      return reflectBody(lesson, draft);
  }
}

function warmupBody(lesson: Lesson): SafeHtml {
  const previous = LESSONS[LESSONS.indexOf(lesson) - 1];
  const review = previous
    ? drillRows(previous)
        .slice(0, 3)
        .flatMap((r) => r.cells)
        .slice(0, 5)
    : [];
  return html`<p class="lead">${lesson.warmup}</p>
    ${
      previous
        ? html`<div class="field">
            <span class="lbl"
              >Review from Lesson ${lessonNumber(previous.id)}: ${previous.title}</span
            >
            <div class="words">${review.map((c) => sayMarkup(c))}</div>
          </div>`
        : ''
    }`;
}

export function soundCardView(card: SoundCard): SafeHtml {
  const first = card.words[0]?.[0] ?? '';
  return html`<div class="sound">
    <div class="sound-head">
      <span class="big-ipa">/${card.ipa}/</span>
      <div>
        <h3 class="h4">${card.name}</h3>
        <a class="yg" href="${youglishUrl(first)}" target="_blank" rel="noopener noreferrer"
          >Hear “${first}” in real videos ↗</a
        >
      </div>
    </div>
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
    <div class="words">
      ${card.words.map(([word, ipa]) =>
        sayButton(word, html`<span class="w">${word}</span> <span class="ipa">/${ipa}/</span>`, {
          rate: 0.8,
        }),
      )}
    </div>
  </div>`;
}

function learnBody(lesson: Lesson): SafeHtml {
  const learn = lesson.learn;
  let body: SafeHtml;
  if (learn.kind === 'sounds') {
    body = html`<div class="sounds">
      ${learn.sounds.map((card) => soundCardView(card))}
    </div>`;
  } else if (learn.kind === 'stress') {
    body = html`<ol class="how">
        ${learn.rules.map((r) => html`<li>${r}</li>`)}
      </ol>
      ${learn.groups.map(
        (g) =>
          html`<div class="sgroup">
            <span class="eyebrow">${g.label}</span>
            <div class="words">
              ${g.words.map(
                (w) =>
                  html`<button
                    type="button"
                    class="word"
                    data-say="${parseStressWord(w).text}"
                    data-rate="0.8"
                  >
                    ${ICONS.speak}${stressWord(w)}
                  </button>`,
              )}
            </div>
          </div>`,
      )}
      <p class="legend">
        <span><b class="st">HIGHLIGHT</b> = stressed syllable</span
        ><span>large dot = stressed, small dot = unstressed</span>
      </p>`;
  } else {
    body = html`${learn.rules.map(
      (r) =>
        html`<div class="rule">
          <h3 class="h4">${renderMarkup(r.heading)}</h3>
          <p>${r.text}</p>
          ${
            r.examples.length
              ? html`<div class="words">${r.examples.map((x) => sayMarkup(x))}</div>`
              : ''
          }
        </div>`,
    )}`;
  }
  return html`${body}
    <p class="mistake"><strong>Common mistake</strong>${learn.mistake}</p>`;
}

function listenBody(lesson: Lesson): SafeHtml {
  const separator = lesson.listen.separator ?? 'vs';
  const rows = drillRows(lesson).map(
    (row) =>
      html`<div class="drow">
        ${row.cells.map(
          (cell, i) =>
            html`${i && separator ? html`<span class="vs" aria-hidden="true">${separator}</span>` : ''}${sayMarkup(cell, { rate: 0.8 })}`,
        )}${row.hint ? html`<span class="hint">${row.hint}</span>` : ''}
      </div>`,
  );
  return html`<p class="lead">${lesson.listen.intro}</p>
    <div class="drill">${rows}</div>
    ${resolveQuiz(lesson) ? html`<div class="quiz" id="quiz"></div>` : ''}`;
}

export function twisterLevelsView(s: AppState): SafeHtml {
  const lesson = getLesson(s.lesson);
  if (!lesson) return html``;
  const draft = draftFor(s.drafts, lesson.id);
  return html`${lesson.twister.levels.map((text, i) => {
    const reps = draft.reps[i] ?? 0;
    const previousReps = i > 0 ? (draft.reps[i - 1] ?? 0) : REPS_PER_LEVEL;
    const soft = previousReps < REPS_PER_LEVEL && reps === 0;
    const complete = reps >= REPS_PER_LEVEL;
    return html`<div class="tw-row${soft ? ' soft' : ''}${complete ? ' complete' : ''}">
      <span class="eyebrow">${TWISTER_LEVEL_LABELS[i]}</span>
      <p class="tw-text">${renderMarkup(text)}</p>
      <div class="row">
        ${sayButton(text, 'Slow', { className: 'btn sm', rate: 0.65 })}
        ${sayButton(text, 'Natural', { className: 'btn sm', rate: 1 })}
        <span class="reps" role="img" aria-label="${reps} of ${REPS_PER_LEVEL} clean reps"
          >${Array.from(
            { length: REPS_PER_LEVEL },
            (_, k) => html`<i class="${k < reps ? 'on' : ''}"></i>`,
          )}<span class="rn" aria-hidden="true">${reps}/${REPS_PER_LEVEL}</span></span
        >
        <button
          type="button"
          class="btn sm"
          data-action="rep-minus"
          data-level="${i}"
          data-key="rep-minus-${i}"
          aria-label="Remove one rep from level ${i + 1}"
          ${reps ? '' : ' disabled'}
        >
          −
        </button>
        <button
          type="button"
          class="btn sm primary"
          data-action="rep-plus"
          data-level="${i}"
          data-key="rep-plus-${i}"
          aria-label="Add a clean rep to level ${i + 1}"
        >
          +1 clean rep
        </button>
      </div>
      ${soft ? html`<p class="tw-hint">Next challenge. Try it after ${REPS_PER_LEVEL} clean reps of level ${i}, or start now if it feels easy.</p>` : ''}
    </div>`;
  })}`;
}

function shadowBody(lesson: Lesson, draft: LessonDraft): SafeHtml {
  const all = lesson.shadow.lines.join(' ');
  const legend: SafeHtml[] = [];
  if (all.includes('{')) legend.push(html`<span><b class="st">highlight</b> = stressed</span>`);
  if (all.includes('[')) legend.push(html`<span><u class="tg">underline</u> = target sound</span>`);
  if (all.includes(' / ')) legend.push(html`<span><span class="pz">/</span> = short pause</span>`);
  if (all.includes('‿')) legend.push(html`<span><span class="lk">‿</span> = link the words</span>`);
  if (/[↗↘]/.test(all))
    legend.push(html`<span><span class="tn">↗ ↘</span> = voice goes up / down</span>`);
  const slow = slowRate(lesson);

  return html`<p class="ctx"><b>Situation:</b> ${lesson.shadow.context}</p>
    <div class="script" id="script">
      ${lesson.shadow.lines.map(
        (line, i) =>
          html`<div class="sline">
            <button
              type="button"
              class="icon-btn"
              data-say="${toSpeech(line)}"
              data-rate="${slow}"
              aria-label="Play line ${i + 1}"
            >
              ${ICONS.speak}</button
            ><span>${renderMarkup(line)}</span>
          </div>`,
      )}
    </div>
    ${legend.length ? html`<p class="legend">${legend}</p>` : ''}
    <div class="row">
      <button type="button" class="btn sm" data-action="play-script" data-rate="${slow}">
        ${ICONS.play} Play all, slow
      </button>
      <button type="button" class="btn sm" data-action="play-script" data-rate="1">
        ${ICONS.play} Play all, natural
      </button>
      <button type="button" class="btn sm quiet" data-action="stop-audio">
        ${ICONS.stop} Stop
      </button>
      <a
        class="btn sm quiet"
        href="${youglishUrl(toSpeech(lesson.shadow.lines[0] ?? '').replace(/[.?!]$/, ''))}"
        target="_blank"
        rel="noopener noreferrer"
        >Real speakers on YouGlish ↗</a
      >
    </div>
    <fieldset class="field">
      <legend class="lbl">Five passes. Tick each one as you go.</legend>
      <ol class="passes">
        ${SHADOW_PASSES.map(
          ([title, detail], i) =>
            html`<li>
              <label
                ><input
                  type="checkbox"
                  data-pass="${i}"
                  ${draft.passes[i] ? ' checked' : ''}
                /><span
                  ><b>${i + 1}. ${title}.</b> <span class="muted">${detail}</span></span
                ></label
              >
            </li>`,
        )}
      </ol>
    </fieldset>
    <div class="compare">
      <label class="lbl" for="rec-file"
        ><b>Compare with your recording</b>
        <span class="muted small">(optional, stays on this device)</span></label
      >
      <input type="file" id="rec-file" accept="audio/*" />
      <audio id="rec-audio" controls hidden></audio>
    </div>
    <p class="tip">${lesson.shadow.tip}</p>`;
}

function reflectBody(lesson: Lesson, draft: LessonDraft): SafeHtml {
  const sound = soundByKey(lesson.sounds[0] ?? 'other');
  return html`<div class="field">
      <span class="lbl" id="rf-lbl">How clear was ${lesson.focus} today?</span>
      <div class="rate" id="reflect-rating" role="group" aria-labelledby="rf-lbl"></div>
    </div>
    <div class="field">
      <label for="rf-note">Difficult sounds or words (optional)</label>
      <textarea id="rf-note" maxlength="600" placeholder="e.g. “Thursday” still comes out as “Tursday” at natural speed.">${draft.note}</textarea>
    </div>
    <label class="chk"
      ><input type="checkbox" id="rf-add" ${draft.addToNotebook ? ' checked' : ''} /> Also add this
      note to my Sound notebook (${sound.name})</label
    >
    <div class="field">
      <label for="rf-min">Minutes practiced</label
      ><input
        type="number"
        id="rf-min"
        class="min-in"
        min="1"
        max="240"
        inputmode="numeric"
        value="${draft.minutes}"
      />
    </div>`;
}

export function reflectRatingView(s: AppState): SafeHtml {
  const draft = draftFor(s.drafts, s.lesson);
  return ratingButtons(draft.rating, 'rf-rate', { keyPrefix: 'rf' });
}

function doneBanner(lesson: Lesson, rating: number): SafeHtml {
  const next = nextLesson(lesson.id);
  const passed = rating >= PASS_RATING;
  const advice = passed
    ? next
      ? `Nice work. You’re ready for Lesson ${lessonNumber(next.id)}: ${next.title}. Keep repeating this lesson’s twister once a day.`
      : 'You finished the whole path. Business English is next.'
    : 'This sound still needs time. Repeat this lesson once or twice more this week, and log the hard words in your Sound notebook.';
  return html`<div class="banner" role="status">
    <h3>Session saved · Lesson ${lessonNumber(lesson.id)} · clarity ${rating}/5</h3>
    <p>${advice}</p>
    <div class="row">
      ${passed && next ? html`<button type="button" class="btn primary sm" data-action="pick-lesson" data-lesson="${next.id}" data-key="banner-next">Start Lesson ${lessonNumber(next.id)}</button>` : ''}
      ${passed && !next ? html`<button type="button" class="btn primary sm" data-action="pick-lesson" data-lesson="${BRIDGE_ID}" data-key="banner-next">See what’s next</button>` : ''}
      <button type="button" class="btn sm" data-action="dismiss-done">
        Practice this lesson again
      </button>
    </div>
  </div>`;
}

function bridgeView(s: AppState): SafeHtml {
  const passed = passedCount(s.runs);
  const allPassed = passed >= TOTAL_LESSONS;
  const target = getLesson(suggestedLesson(s.runs));
  const weakest = weakestLesson(s.runs);
  const weakLesson = getLesson(weakest?.lesson);
  return html`<div class="bridge">
    <span class="eyebrow"
      >${allPassed ? 'Unlocked' : `Unlocks after all ${TOTAL_LESSONS} lessons · ${passed} of ${TOTAL_LESSONS} passed`}</span
    >
    <h2>Next: Business English</h2>
    <p class="lead">
      The Business English unit builds on this path. You’ll practice the same sounds, stress and
      melody inside real work situations:
    </p>
    <ul>
      <li>Phone and video calls: greetings, spelling names and numbers, asking people to repeat</li>
      <li>Meetings: giving opinions, agreeing and disagreeing politely</li>
      <li>Presentations: signposting, emphasis and pausing for effect</li>
      <li>Small talk: questions with friendly rising intonation</li>
    </ul>
    <p class="lead">
      ${allPassed ? 'You passed every lesson. The Business English sessions are the next part to be added to the studio.' : `Finish the path first. Your next lesson is ${target ? `Lesson ${lessonNumber(target.id)}: ${target.title}` : 'waiting'}.`}
    </p>
    <div class="row">
      ${!allPassed && target ? html`<button type="button" class="btn primary sm" data-action="pick-lesson" data-lesson="${target.id}">Go to Lesson ${lessonNumber(target.id)}</button>` : ''}
      ${weakest && weakLesson ? html`<button type="button" class="btn sm" data-action="pick-lesson" data-lesson="${weakLesson.id}">Review your weakest lesson (${weakLesson.title}, last rated ${weakest.rating}/5)</button>` : ''}
    </div>
  </div>`;
}
