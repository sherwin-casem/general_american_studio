/** Toasts for visible confirmations, and a polite live region for screen-reader announcements. */
let toastTimer: number | undefined;

export function toast(message: string): void {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    el.hidden = true;
  }, 3800);
}

/** Announces text without showing it. The live region exists from page load, so it is reliable. */
export function announce(message: string): void {
  const el = document.getElementById('announcer');
  if (!el) return;
  el.textContent = '';
  window.setTimeout(() => {
    el.textContent = message;
  }, 50);
}
