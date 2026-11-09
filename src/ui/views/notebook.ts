import { CATEGORY_LABELS, soundByKey, soundsByCategory } from '../../content/course';
import type { SoundKey } from '../../content/types';
import {
  isNoteDue,
  latestCheckIn,
  NOTE_LEVEL_NAMES,
  noteLevel,
  sortNotesNewestFirst,
  type NoteLevel,
} from '../../domain/progress';
import type { AppState } from '../../state/app-state';
import type { SoundNote } from '../../storage/types';
import { ratingButtons, sayButton } from '../components';
import { formatDate, youglishUrl } from '../format';
import { html, type SafeHtml } from '../html';

/** Every sound, grouped like the sound chart, with "Another sound" last. */
export function soundOptionsView(selected: SoundKey): SafeHtml {
  const option = (key: SoundKey, label: string) =>
    html`<option value="${key}" ${key === selected ? ' selected' : ''}>${label}</option>`;
  return html`${soundsByCategory()
    .filter(({ category }) => category !== 'other')
    .map(
      ({ category, sounds }) =>
        html`<optgroup label="${CATEGORY_LABELS[category]}">
          ${sounds.map((s) => option(s.key, `/${s.ipa}/  ${s.name}`))}
        </optgroup>`,
    )}
    ${option('other', soundByKey('other').name)}`;
}

export function noteFormRatingView(s: AppState): SafeHtml {
  return ratingButtons(s.notebook.formRating, 'nf-rate', { compact: true, keyPrefix: 'nf' });
}

export function dueView(s: AppState): SafeHtml {
  const due = sortNotesNewestFirst(s.notes).filter((n) => isNoteDue(n));
  if (!due.length) return html``;
  return html`<div class="due">
    <h3>Ready for a check-in</h3>
    <p class="small">
      It has been a week or more since you last rated these. Say the word a few times, then rate it
      again.
    </p>
    <div class="due-list">
      ${due.map((n) => {
        const sound = soundByKey(n.sound);
        const last = latestCheckIn(n);
        return html`<div class="due-item">
          <span class="ipa">${sound.ipa}</span
          ><span class="grow"
            ><b>${sound.name}</b>${n.example ? ` · “${n.example}”` : ''}<br /><span
              class="small muted"
              >Last: ${last?.rating ?? '–'}/5 on ${formatDate(last?.at ?? '')}</span
            ></span
          ><button
            type="button"
            class="btn sm"
            data-action="ck-open"
            data-id="${n.id}"
            data-key="due-${n.id}"
          >
            Check in
          </button>
        </div>`;
      })}
    </div>
  </div>`;
}

export function filtersView(s: AppState): SafeHtml {
  const counts: Record<string, number> = { all: s.notes.length, 1: 0, 2: 0, 3: 0 };
  for (const n of s.notes) counts[noteLevel(n)] = (counts[noteLevel(n)] ?? 0) + 1;
  const options: [AppState['notebook']['filter'], string][] = [
    ['all', 'All'],
    ['1', NOTE_LEVEL_NAMES[1]],
    ['2', NOTE_LEVEL_NAMES[2]],
    ['3', NOTE_LEVEL_NAMES[3]],
  ];
  return html`${options.map(
    ([key, label]) =>
      html`<button
        type="button"
        class="chip"
        data-action="nb-filter"
        data-f="${key}"
        data-key="nbf-${key}"
        aria-pressed="${String(s.notebook.filter === key)}"
      >
        ${label} ${counts[key] ?? 0}
      </button>`,
  )}`;
}

function trailView(note: SoundNote): SafeHtml {
  const checks = note.checks;
  const first = checks[0];
  const last = checks[checks.length - 1];
  let summary = '';
  if (first && last && checks.length > 1) {
    const diff = last.rating - first.rating;
    summary = `${first.rating} → ${last.rating} since ${formatDate(first.at)} · ${diff > 0 ? `+${diff}` : diff === 0 ? 'no change' : diff}`;
  } else if (last) {
    summary = `${last.rating}/5 on ${formatDate(last.at)} · check in again in a week`;
  }
  return html`<div class="trail-wrap">
    <div class="trail" aria-hidden="true">
      ${checks
        .slice(-12)
        .map(
          (c) =>
            html`<i data-pct="${c.rating * 20}" title="${formatDate(c.at)}: ${c.rating}/5"></i>`,
        )}
    </div>
    <span class="trail-txt">${summary}</span>
  </div>`;
}

function noteCard(s: AppState, note: SoundNote): SafeHtml {
  const sound = soundByKey(note.sound);
  const level = noteLevel(note);
  const nb = s.notebook;
  const checks = note.checks;
  const lastComment = checks.length > 1 ? checks[checks.length - 1]?.comment : '';
  const link = note.example || sound.keyword;

  const actions =
    nb.confirmDelete === note.id
      ? html`<span class="small">Delete this note and its check-ins?</span>
          <button
            type="button"
            class="btn sm danger"
            data-action="nb-del-yes"
            data-id="${note.id}"
            data-key="nb-del-yes-${note.id}"
          >
            Delete
          </button>
          <button
            type="button"
            class="btn sm"
            data-action="nb-del-no"
            data-key="nb-del-no-${note.id}"
          >
            Keep
          </button>`
      : html`${nb.checkInFor === note.id ? '' : html`<button type="button" class="btn sm" data-action="ck-open" data-id="${note.id}" data-key="ck-open-${note.id}">Check in</button>`}
          ${link ? html`<a class="btn sm quiet" href="${youglishUrl(link)}" target="_blank" rel="noopener noreferrer">Hear real speakers ↗</a>` : ''}
          <button
            type="button"
            class="btn sm quiet danger"
            data-action="nb-del"
            data-id="${note.id}"
            data-key="nb-del-${note.id}"
          >
            Delete
          </button>`;

  const checkIn =
    nb.checkInFor === note.id
      ? html`<div class="ckform">
          <span class="small" id="ck-lbl-${note.id}"><b>How clear is it today?</b></span>
          <div class="rate" role="group" aria-labelledby="ck-lbl-${note.id}">
            ${ratingButtons(nb.checkInRating, 'ck-rate', { compact: true, keyPrefix: 'ck' })}
          </div>
          <label class="sr-only" for="ck-comment">What changed?</label>
          <input
            type="text"
            id="ck-comment"
            data-key="ck-comment"
            maxlength="200"
            placeholder="What changed? (optional)"
            value="${nb.checkInComment}"
          />
          <div class="row">
            <button
              type="button"
              class="btn primary sm"
              data-action="ck-save"
              data-id="${note.id}"
              data-key="ck-save"
              ${nb.checkInRating ? '' : ' disabled'}
            >
              Save check-in
            </button>
            <button type="button" class="btn sm quiet" data-action="ck-cancel">Cancel</button>
          </div>
        </div>`
      : '';

  return html`<article class="note" data-note="${note.id}">
    <div class="note-head">
      <span class="ipa-chip" aria-hidden="true">${sound.ipa}</span>
      <div class="grow">
        <h4>${sound.name}</h4>
        <div class="ex">
          ${note.example ? html`<span>“${note.example}”</span>${sayButton(note.example, 'Play', { className: 'btn sm quiet', rate: 0.8 })}` : ''}
        </div>
      </div>
      <span class="pill s${level}">${NOTE_LEVEL_NAMES[level]}</span>
    </div>
    ${note.text ? html`<p class="note-txt">${note.text}</p>` : ''}
    ${lastComment ? html`<p class="small muted">Latest: ${lastComment}</p>` : ''} ${trailView(note)}
    <div class="note-actions">${actions}</div>
    ${checkIn}
  </article>`;
}

export function notesListView(s: AppState): SafeHtml {
  const notes = sortNotesNewestFirst(s.notes);
  if (!notes.length) {
    return html`<div class="empty">
      <h4>No difficult sounds logged yet</h4>
      <p>
        Use the form to log a sound the moment it trips you up: the sound, the word where it
        happened, and what went wrong. You can also add a note at the end of any session. Check in
        once a week and the bars show your improvement.
      </p>
      <div class="notes">
        <article class="note example" aria-label="Example note">
          <div class="note-head">
            <span class="ipa-chip" aria-hidden="true">θ</span>
            <div class="grow">
              <h4>TH as in think</h4>
              <div class="ex">“three Thursdays”</div>
            </div>
            <span class="pill ex">Example</span>
          </div>
          <p class="note-txt">My tongue stays behind my teeth, so “three” sounds like “tree”.</p>
          <div class="trail-wrap">
            <div class="trail" aria-hidden="true">
              <i data-pct="40"></i><i data-pct="60"></i><i data-pct="80"></i>
            </div>
            <span class="trail-txt">2 → 4 over three weekly check-ins</span>
          </div>
        </article>
      </div>
    </div>`;
  }
  const filter = s.notebook.filter;
  const shown = filter === 'all' ? notes : notes.filter((n) => String(noteLevel(n)) === filter);
  if (!shown.length) {
    return html`<div class="empty">
      <p>No notes in “${NOTE_LEVEL_NAMES[Number(filter) as NoteLevel]}” right now.</p>
    </div>`;
  }
  return html`<div class="notes">${shown.map((n) => noteCard(s, n))}</div>`;
}
