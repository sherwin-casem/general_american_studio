import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Strict Content-Security-Policy for production builds.
 * Everything (scripts, styles, fonts) is self-hosted, so only 'self' is allowed.
 * It is injected at build time only: the Vite dev server needs inline styles and a websocket.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "font-src 'self' data:",
  "img-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function contentSecurityPolicy(): Plugin {
  return {
    name: 'gas-content-security-policy',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<!-- csp -->',
        `<meta http-equiv="Content-Security-Policy" content="${CSP}">`,
      );
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [contentSecurityPolicy()],
  build: {
    target: 'es2022',
    sourcemap: true,
    assetsInlineLimit: 0,
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts'],
    },
  },
});
