import {
  BRIDGE_ID,
  getLesson,
  lessonNumber,
  QUIZ_ROUNDS,
  RATING_LABELS,
  TOTAL_LESSONS,
  UNITS,
} from '../../content/course';
import {
  bestRating,
  lessonStatus,
  noteLevel,
  passedCount,
  runsForLesson,
  sortRunsOldestFirst,
  suggestedLesson,
  totalMinutes,
  weeklyStreak,
} from '../../domain/progress';
import type { Recording } from '../../services/audio';
import type { AppState } from '../../state/app-state';
import { formatDate, plural } from '../format';
import { html, type SafeHtml } from '../html';
import { ICONS } from '../icons';

export function statsView(s: AppState): SafeHtml {
  const passed = passedCount(s.runs);
  const streak = weeklyStreak(s.runs);
  const comfortable = s.notes.filter((n) => noteLevel(n) === 3).length;
  return html` <div class="stat">
      <b>${passed}<span class="of"> / ${TOTAL_LESSONS}</span></b
      ><span>lessons passed</span>
    </div>
    <div class="stat">
      <b>${s.runs.length}</b><span>sessions logged · ${totalMinutes(s.runs)} min</span>
    </div>
    <div class="stat">
      <b>${streak}</b><span>${streak === 1 ? 'week' : 'weeks'} in a row with practice</span>
    </div>
    <div class="stat">
      <b>${comfortable}<span class="of"> / ${s.notes.length}</span></b
      ><span>notebook sounds now comfortable</span>
    </div>`;
}

export function mapView(s: AppState): SafeHtml {
  const next = suggestedLesson(s.runs);
  const passed = passedCount(s.runs);
  const units = UNITS.map(
    (unit) =>
      html`<div class="map-unit">
        <span class="eyebrow">${unit.name}</span>${unit.lessons.map((lesson) => {
          const status = lessonStatus(s.runs, lesson.id);
          const sessions = runsForLesson(s.runs, lesson.id).length;
          const best = bestRating(s.runs, lesson.id) ?? 0;
          const n = lessonNumber(lesson.id);
          const sub =
            status === 'passed'
              ? `Passed · best ${best}/5 · ${plural(sessions, 'session')}`
              : status === 'practiced'
                ? `Repeat suggested · best ${best}/5`
                : lesson.id === next
                  ? 'Up next'
                  : 'Not started';
          return html`<button
            type="button"
            class="map-wk ${status}${lesson.id === next ? ' next' : ''}"
            data-action="go-lesson"
            data-lesson="${lesson.id}"
            data-key="map-${lesson.id}"
          >
            <span class="n" aria-hidden="true">${status === 'passed' ? ICONS.check : n}</span
            ><span class="t">${lesson.title}<span class="s">${sub}</span></span>
          </button>`;
        })}
      </div>`,
  );
  return html`${units}
    <div class="map-unit">
      <span class="eyebrow">After the path</span
      ><button
        type="button"
        class="map-wk${next === BRIDGE_ID ? ' next' : ''}"
        data-action="go-lesson"
        data-lesson="${BRIDGE_ID}"
        data-key="map-${BRIDGE_ID}"
      >
        <span class="n" aria-hidden="true">${ICONS.arrow}</span
        ><span class="t"
          >Business English<span class="s"
            >${passed >= TOTAL_LESSONS ? 'Unlocked' : 'Unlocks after the last lesson'}</span
          ></span
        >
      </button>
    </div>`;
}

export function historyView(s: AppState): SafeHtml {
  const runs = sortRunsOldestFirst(s.runs).reverse();
  if (!runs.length) {
    return html`<div class="empty">
      <h4>No sessions logged yet</h4>
      <p>
        Finish step 6, “Rate and note”, in any lesson to log your first session. It will show up here
        with its rating, time and notes.
      </p>
    </div>`;
  }
  return html`<div class="tbl-wrap" role="region" aria-label="Session history" tabindex="0">
    <table>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Lesson</th>
          <th scope="col">Clarity</th>
          <th scope="col">Minutes</th>
          <th scope="col">Ear test</th>
          <th scope="col">Note</th>
          <th scope="col"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        ${runs.map((r) => {
          const lesson = getLesson(r.lesson);
          const actions =
            s.history.confirmDelete === r.id
              ? html`<button
                    type="button"
                    class="btn sm danger"
                    data-action="run-del-yes"
                    data-id="${r.id}"
                    data-key="run-del-yes-${r.id}"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    class="btn sm"
                    data-action="run-del-no"
                    data-key="run-del-no-${r.id}"
                  >
                    Keep
                  </button>`
              : html`<button
                  type="button"
                  class="btn sm quiet danger"
                  data-action="run-del"
                  data-id="${r.id}"
                  data-key="run-del-${r.id}"
                  aria-label="Delete session from ${formatDate(r.at)}"
                >
                  Delete
                </button>`;
          return html`<tr>
            <td class="num">${formatDate(r.at)}</td>
            <td>${lesson ? `${lessonNumber(lesson.id)}. ${lesson.title}` : r.lesson}</td>
            <td class="num">
              <b>${r.rating}/5</b> <span class="muted small">${RATING_LABELS[r.rating]}</span>
            </td>
            <td class="num">${r.minutes}</td>
            <td class="num">${r.quiz != null ? `${r.quiz}/${QUIZ_ROUNDS}` : '–'}</td>
            <td class="note-cell">${r.note}</td>
            <td class="num">${actions}</td>
          </tr>`;
        })}
      </tbody>
    </table>
  </div>`;
}

export function dataPanelView(s: AppState): SafeHtml {
  const where =
    s.storage.mode === 'account'
      ? 'Your sessions and notes are saved to your account.'
      : s.storage.mode === 'memory'
        ? 'This browser blocks storage, so nothing is kept after you close the page. Export a backup before you leave.'
        : 'Your sessions and notes are saved in this browser only. Export a backup now and then, so clearing browser data can’t erase your progress.';
  const preview = s.importPreview;
  const confirm = preview
    ? html`<div class="import-preview" role="group" aria-label="Confirm import">
        <p>
          <b>${preview.fileName}</b>: ${plural(preview.data.runs.length, 'session')} and
          ${plural(preview.data.notes.length, 'note')}.${preview.dropped ? ` ${plural(preview.dropped, 'damaged record')} will be skipped.` : ''}
          Records you already have are kept, and duplicates are skipped.
        </p>
        <div class="row">
          <button
            type="button"
            class="btn primary sm"
            data-action="import-confirm"
            data-key="import-confirm"
          >
            Import</button
          ><button type="button" class="btn sm" data-action="import-cancel">Cancel</button>
        </div>
      </div>`
    : '';
  return html`<p class="small">${where}</p>
    <div class="row">
      <button
        type="button"
        class="btn sm"
        data-action="export"
        data-key="export"
        ${s.runs.length || s.notes.length ? '' : ' disabled'}
      >
        Export backup
      </button>
      <label class="btn sm file-btn" for="import-file">Import backup</label>
      <input type="file" id="import-file" class="sr-only" accept="application/json,.json" />
    </div>
    ${confirm}`;
}

/** Credits for the word recordings, as their licenses require. */
export function creditsView(credits: [word: string, recording: Recording][]): SafeHtml {
  if (!credits.length) {
    return html`<p class="small muted">
      No word recordings are installed, so every example uses your device’s voice. Run
      <code>npm run audio</code> to download recordings of American speakers.
    </p>`;
  }
  const speakers = new Set(credits.map(([, r]) => r.author)).size;
  return html`<p class="small">
      Single words are played from ${plural(credits.length, 'recording')} by
      ${plural(speakers, 'speaker')} of American English, from
      <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener noreferrer"
        >Wikimedia Commons</a
      >. They are used under their free licenses, listed below.
    </p>
    <details class="credits">
      <summary>Show all ${credits.length} recordings and licenses</summary>
      <div class="tbl-wrap" role="region" aria-label="Recording credits" tabindex="0">
        <table>
          <thead>
            <tr>
              <th scope="col">Word</th>
              <th scope="col">Speaker</th>
              <th scope="col">License</th>
            </tr>
          </thead>
          <tbody>
            ${credits.map(
              ([word, r]) =>
                html`<tr>
                  <td>
                    <a href="${r.page}" target="_blank" rel="noopener noreferrer">${word}</a>
                  </td>
                  <td>${r.author}</td>
                  <td>
                    <a href="${r.licenseUrl}" target="_blank" rel="noopener noreferrer"
                      >${r.license}</a
                    >
                  </td>
                </tr>`,
            )}
          </tbody>
        </table>
      </div>
    </details>`;
}
