/**
 * Escape-by-default HTML templating.
 *
 *   html`<p>${userText}</p>`   // userText is escaped
 *   html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`   // nested templates are kept as HTML
 *
 * Only `raw()` bypasses escaping, and it must only receive trusted, constant markup.
 */
export class SafeHtml {
  constructor(readonly value: string) {}
  toString(): string {
    return this.value;
  }
}

/**
 * Booleans render as nothing, so `${condition && html`…`}` works. For attribute values that must
 * read "true" or "false" (aria-pressed, aria-expanded), pass `String(condition)`.
 */
export type HtmlValue =
  SafeHtml | string | number | boolean | null | undefined | readonly HtmlValue[];

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
};

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"'`]/g, (c) => ESCAPES[c] ?? c);
}

function serialize(value: HtmlValue): string {
  if (value == null || typeof value === 'boolean') return '';
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(serialize).join('');
  return escapeHtml(value);
}

export function html(strings: TemplateStringsArray, ...values: HtmlValue[]): SafeHtml {
  let out = strings[0] ?? '';
  for (let i = 0; i < values.length; i++) {
    out += serialize(values[i]) + (strings[i + 1] ?? '');
  }
  return new SafeHtml(out);
}

/** Marks trusted, constant markup as safe. Never pass user or stored data. */
export function raw(markup: string): SafeHtml {
  return new SafeHtml(markup);
}

/**
 * Replaces an element's content. Keeps keyboard focus (and text selection) on the element with
 * the same `data-key` so re-renders do not throw keyboard and screen-reader users back to the top.
 * Also applies `data-pct` sizes through the CSSOM, which a strict CSP allows (inline styles are not).
 */
export function mount(el: Element, content: SafeHtml): void {
  const active = document.activeElement;
  const key = active instanceof HTMLElement && el.contains(active) ? active.dataset.key : undefined;
  let selection: [number | null, number | null] | null = null;
  if (key && (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement)) {
    try {
      selection = [active.selectionStart, active.selectionEnd];
    } catch {
      selection = null;
    }
  }

  el.innerHTML = content.value;
  applyDynamicSizes(el);

  if (!key) return;
  const next = el.querySelector<HTMLElement>(`[data-key="${key}"]`);
  if (!next) return;
  next.focus({ preventScroll: true });
  if (selection && (next instanceof HTMLInputElement || next instanceof HTMLTextAreaElement)) {
    try {
      next.setSelectionRange(selection[0], selection[1]);
    } catch {
      /* some input types do not support selection */
    }
  }
}

export function applyDynamicSizes(root: ParentNode): void {
  const percent = (value: string | undefined) => Math.max(0, Math.min(100, Number(value) || 0));
  root.querySelectorAll<HTMLElement>('[data-pct]').forEach((node) => {
    node.style.setProperty('--pct', `${percent(node.dataset.pct)}%`);
  });
  // Positions as numbers from 0 to 100, for elements placed over a picture (the vowel chart).
  root.querySelectorAll<HTMLElement>('[data-x][data-y]').forEach((node) => {
    node.style.setProperty('--x', String(percent(node.dataset.x)));
    node.style.setProperty('--y', String(percent(node.dataset.y)));
  });
}
