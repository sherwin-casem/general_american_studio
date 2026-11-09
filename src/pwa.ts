/** Registers the offline service worker in production builds served over HTTP(S). */
import { getClaudeRuntime } from './storage/claude';

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (!('serviceWorker' in navigator)) return;
  if (!/^https?:$/.test(location.protocol)) return;
  if (getClaudeRuntime()) return; // claude.ai Artifacts do not support service workers

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error: unknown) => {
      console.warn('Offline support is unavailable:', error);
    });
  });
}
