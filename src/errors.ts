/** Last-resort error handling: log, tell the person once, and never leave a blank page. */
import { toast } from './ui/feedback';

let lastShown = 0;

function report(error: unknown): void {
  console.error('[General American Studio]', error);
  const now = Date.now();
  if (now - lastShown < 8000) return;
  lastShown = now;
  toast(
    'Something went wrong. Your saved progress is safe. If the page stops responding, reload it.',
  );
}

export function installGlobalErrorHandlers(): void {
  window.addEventListener('error', (event) => report(event.error ?? event.message));
  window.addEventListener('unhandledrejection', (event) => report(event.reason));
}

/** Replaces the page with a readable message when the app cannot start at all. */
export function renderFatalError(error: unknown): void {
  console.error('[General American Studio] failed to start', error);
  const main = document.getElementById('main');
  if (!main) return;
  main.replaceChildren();
  const box = document.createElement('div');
  box.className = 'panel fatal';
  const title = document.createElement('h2');
  title.textContent = 'The studio couldn’t start';
  const text = document.createElement('p');
  text.textContent =
    'Reload the page to try again. Your saved progress is kept in this browser and has not been changed.';
  box.append(title, text);
  main.append(box);
}
