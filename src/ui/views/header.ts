/** App shell: the saving status chip, notices and the voice settings. */
import type { AppState } from '../../state/app-state';
import { sayButton } from '../components';
import { plural } from '../format';
import { html, type SafeHtml } from '../html';
import { ICONS } from '../icons';

export function statusView(s: AppState): SafeHtml {
  const { mode, phase } = s.storage;
  let state = 'loading';
  let text = 'Connecting to your saved progress…';
  if (phase === 'error') {
    state = 'warn';
    text = 'Saving is unavailable right now';
  } else if (phase === 'stale') {
    state = 'warn';
    text = 'Can’t reach your saved progress yet';
  } else if (phase === 'ready') {
    if (mode === 'account') {
      state = 'ok';
      text = 'Saved to your account';
    } else if (mode === 'browser') {
      state = 'local';
      text = 'Saved in this browser';
    } else if (mode === 'memory') {
      state = 'warn';
      text = 'Not saved: this browser blocks storage';
    }
  }
  return html`<span class="status-chip" data-state="${state}"
    ><span class="dot" aria-hidden="true"></span><span>${text}</span></span
  >`;
}

export function noticeView(s: AppState): SafeHtml {
  const notice = s.storage.notice;
  return notice ? html`<p class="notice" role="alert">${notice}</p>` : html``;
}

export function notebookCountView(s: AppState): SafeHtml {
  return s.notes.length
    ? html`<span class="sr-only">, </span>${s.notes.length}<span class="sr-only"> notes</span>`
    : html``;
}

function recordingsLine(s: AppState): SafeHtml {
  const a = s.audio;
  if (a.phase === 'loading') return html`<span class="small muted">Loading recordings…</span>`;
  if (a.phase === 'missing' || !a.count) {
    return html`<span class="small muted"
      >No recordings installed, so words use the device voice.</span
    >`;
  }
  return html`<span class="small muted"
    >${plural(a.count, 'word')} recorded by American speakers. Marked with
    <span class="rec-dot" aria-hidden="true">${ICONS.person}</span><span class="sr-only">a
    person icon</span>.</span
  >`;
}

function voiceSelect(s: AppState): SafeHtml {
  const sp = s.speech;
  if (!sp.supported) {
    return html`<p class="small notice">
      This browser can’t speak sentences. Use the “Hear real speakers” links to listen on YouGlish.
    </p>`;
  }
  if (!sp.voices.length) {
    return sp.checked
      ? html`<p class="small muted">
          No American English voice was found on this device, so sentences use the default voice.
        </p>`
      : html`<p class="small muted">Loading voices…</p>`;
  }
  return html`<label class="lbl" for="voice-sel">Voice for sentences</label>
    <div class="voice-row">
      <select id="voice-sel" data-key="voice-sel">
        ${sp.voices.map(
          (v) =>
            html`<option value="${v.id}" ${v.id === sp.selected ? ' selected' : ''}>
              ${v.name.replace(/ - English \(United States\)$/, '').replace(/^Microsoft /, '')}
            </option>`,
        )}
      </select>
      ${sayButton('Hello. This is the voice for your practice sentences.', 'Test', {
        className: 'btn sm',
        rate: 0.95,
        key: 'voice-test',
      })}
    </div>
    <p class="small muted">
      Sentences use your device’s voice: ${plural(sp.voices.length, 'American voice')} here. Microsoft
      Edge has the most natural ones (“Natural” voices).
    </p>`;
}

export function audioPanelView(s: AppState): SafeHtml {
  const canRecord = s.audio.phase === 'ready' && s.audio.count > 0;
  return html`<div class="audio-panel">
    <label class="switch">
      <input
        type="checkbox"
        id="rec-toggle"
        data-key="rec-toggle"
        ${s.audio.recordings && canRecord ? ' checked' : ''}${canRecord ? '' : ' disabled'}
      /><span class="switch-ui" aria-hidden="true"></span
      ><span><b>Real speakers for words</b><br />${recordingsLine(s)}</span>
    </label>
    ${voiceSelect(s)}
  </div>`;
}
