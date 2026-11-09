import { getLesson, QUIZ_ROUNDS, resolveQuiz } from '../../content/course';
import { isCorrect, toneExplanation } from '../../domain/quiz';
import type { AppState } from '../../state/app-state';
import { draftFor } from '../../state/drafts';
import { sayButton, stressDots, stressWord } from '../components';
import { html, type SafeHtml } from '../html';
import { ICONS } from '../icons';

const INTRO = {
  pairs: 'Hear a word, then choose which one it was.',
  stress: 'Hear a word, then choose where the stress falls.',
  tone: 'Read a sentence, choose whether the voice rises or falls, then play it to check.',
} as const;

export function quizView(s: AppState): SafeHtml {
  const lesson = getLesson(s.lesson);
  const spec = lesson ? resolveQuiz(lesson) : null;
  if (!lesson || !spec) return html``;
  const best = draftFor(s.drafts, lesson.id).quizBest;
  const needsAudio = spec.type !== 'tone';
  const q = s.quiz && s.quiz.lesson === lesson.id ? s.quiz : null;

  if (!q) {
    return html`<div class="q-head">
        <h4>Ear test · ${QUIZ_ROUNDS} rounds</h4>
        ${best != null ? html`<span class="q-score">Best this session: ${best}/${QUIZ_ROUNDS}</span>` : ''}
      </div>
      <p class="small">${INTRO[spec.type]}</p>
      ${
        needsAudio && !s.speech.supported
          ? html`<p class="notice">
              The ear test needs spoken audio, which this browser can’t play.
            </p>`
          : html`<div class="row">
              <button type="button" class="btn primary sm" data-action="q-start" data-key="q-start">
                Start the ear test
              </button>
            </div>`
      }`;
  }

  if (q.done) {
    const good = q.score / q.total >= 0.75;
    return html`<div class="q-head">
        <h4>Ear test finished</h4>
        <span class="q-score">Best this session: ${best ?? q.score}/${q.total}</span>
      </div>
      <p class="fb ${good ? 'good' : 'bad'}">You scored ${q.score} of ${q.total}.</p>
      <p class="small">
        ${good ? 'Your ear is catching the difference. Now make your mouth match it in the next steps.' : 'Play the examples above a few more times, slowly, then try again. Hearing the difference comes before saying it.'}
      </p>
      <div class="row">
        <button type="button" class="btn sm" data-action="q-start" data-key="q-start">
          Try again
        </button>
      </div>`;
  }

  const round = q.current;
  if (!round) return html``;
  const head = html`<div class="q-head">
    <h4>Round ${q.round} of ${q.total}</h4>
    <span class="q-score">Score ${q.score}</span>
  </div>`;
  const next = q.answered
    ? html`<div class="row">
        <button type="button" class="btn primary sm" data-action="q-next" data-key="q-next">
          ${q.round >= q.total ? 'See your score' : 'Next round'}
        </button>
      </div>`
    : '';
  const feedback = (extra: string) =>
    html`<p class="fb ${isCorrect(round) ? 'good' : 'bad'}">
      ${isCorrect(round) ? 'Correct.' : 'Not quite.'} ${extra}
    </p>`;
  const optionClass = (isAnswer: boolean, isPicked: boolean) =>
    q.answered ? (isAnswer ? 'correct' : isPicked ? 'wrong' : '') : '';

  if (round.type === 'pairs') {
    return html`${head}
      <div class="row">
        <button type="button" class="btn sm" data-action="q-replay" data-key="q-replay">
          ${ICONS.speak} Play again</button
        ><span class="small muted" id="q-prompt">Which word did you hear?</span>
      </div>
      <div class="q-opts" role="group" aria-labelledby="q-prompt">
        ${round.pair.map(
          (word, i) =>
            html`<button
              type="button"
              class="q-opt ${optionClass(i === round.answer, i === round.picked)}"
              data-action="q-pick"
              data-v="${i}"
              data-key="q-opt-${i}"
              ${q.answered ? ' disabled' : ''}
            >
              ${word}
            </button>`,
        )}
      </div>
      ${
        q.answered
          ? html`${feedback(`You heard “${round.pair[round.answer]}”.`)}
              <div class="row">
                <span class="small muted">Compare:</span
                >${round.pair.map((w) => sayButton(w, w, { className: 'btn sm', rate: 0.8 }))}
              </div>`
          : ''
      }
      ${next}`;
  }

  if (round.type === 'stress') {
    const n = round.parsed.syllables.length;
    return html`${head}
      <div class="row">
        <button type="button" class="btn sm" data-action="q-replay" data-key="q-replay">
          ${ICONS.speak} Play “${round.parsed.text}”</button
        ><span class="small muted" id="q-prompt">Where is the stress?</span>
      </div>
      <div class="q-opts" role="group" aria-labelledby="q-prompt">
        ${round.options.map(
          (si) =>
            html`<button
              type="button"
              class="q-opt ${optionClass(si === round.parsed.stressIndex, si === round.picked)}"
              data-action="q-pick"
              data-v="${si}"
              data-key="q-opt-${si}"
              ${q.answered ? ' disabled' : ''}
              aria-label="Syllable ${si + 1} of ${n} stressed"
            >
              ${stressDots(n, si)}<span class="small muted">syllable ${si + 1}</span>
            </button>`,
        )}
      </div>
      ${
        q.answered
          ? html`${feedback('')}
              <div class="row">${stressWord(round.word)}</div>`
          : ''
      }
      ${next}`;
  }

  return html`${head}
    <p class="q-sentence">${round.sentence}</p>
    <p class="small muted" id="q-prompt">Does the voice rise or fall at the end?</p>
    <div class="q-opts" role="group" aria-labelledby="q-prompt">
      ${(
        [
          ['rise', '↗ Rises'],
          ['fall', '↘ Falls'],
        ] as const
      ).map(
        ([value, label]) =>
          html`<button
            type="button"
            class="q-opt ${optionClass(value === round.answer, value === round.picked)}"
            data-action="q-pick"
            data-v="${value}"
            data-key="q-opt-${value}"
            ${q.answered ? ' disabled' : ''}
          >
            ${label}
          </button>`,
      )}
    </div>
    ${
      q.answered
        ? html`${feedback(toneExplanation(round.sentence))}
            <div class="row">
              ${s.speech.supported ? sayButton(round.sentence, 'Play it to check', { className: 'btn sm', rate: 0.9 }) : ''}
            </div>`
        : ''
    }
    ${next}`;
}

/** Text announced to screen readers after an answer. */
export function quizAnnouncement(s: AppState): string {
  const q = s.quiz;
  const round = q?.current;
  if (!q || !round || !q.answered) return '';
  const correct = isCorrect(round);
  if (round.type === 'pairs') {
    return `${correct ? 'Correct' : 'Not quite'}. The word was ${round.pair[round.answer]}. Score ${q.score} of ${q.round}.`;
  }
  if (round.type === 'stress') {
    return `${correct ? 'Correct' : 'Not quite'}. The stress is on syllable ${round.parsed.stressIndex + 1}. Score ${q.score} of ${q.round}.`;
  }
  return `${correct ? 'Correct' : 'Not quite'}. The voice ${round.answer === 'rise' ? 'rises' : 'falls'}. ${toneExplanation(round.sentence)} Score ${q.score} of ${q.round}.`;
}
