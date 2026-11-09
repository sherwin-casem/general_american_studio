/** "Clarity over time" line chart: one point per session, 1–5 scale, crosshair tooltip on hover. */
import { getLesson, lessonNumber, RATING_LABELS } from '../../content/course';
import { sortRunsOldestFirst } from '../../domain/progress';
import type { SessionRun } from '../../storage/types';
import { formatDate } from '../format';
import { html, mount, raw } from '../html';

const HEIGHT = 230;
const MARGIN = { top: 14, right: 14, bottom: 34, left: 30 };

export function renderChart(container: HTMLElement, allRuns: readonly SessionRun[]): void {
  const runs = sortRunsOldestFirst(allRuns);
  if (!runs.length) {
    mount(
      container,
      html`<div class="empty">
        <h4>Your clarity line starts after your first session</h4>
        <p>
          Each point will be one finished session and the rating you gave it. Over the weeks the
          line shows where you improved and where to repeat.
        </p>
      </div>`,
    );
    return;
  }

  const width = Math.max(280, container.clientWidth || 640);
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const n = runs.length;
  const x = (i: number) => MARGIN.left + (n === 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const y = (rating: number) => MARGIN.top + ((5 - rating) / 4) * innerH;
  const points = runs.map((r, i): [number, number] => [x(i), y(r.rating)]);
  const fixed = (v: number) => v.toFixed(1);

  let grid = '';
  let axis = '';
  for (let r = 1; r <= 5; r++) {
    grid += `<line x1="${MARGIN.left}" x2="${width - MARGIN.right}" y1="${y(r)}" y2="${y(r)}"/>`;
    axis += `<text x="${MARGIN.left - 10}" y="${y(r) + 4}" text-anchor="end">${r}</text>`;
  }
  const ticks =
    n === 1 ? [0] : n <= 4 ? runs.map((_, i) => i) : [0, Math.round((n - 1) / 2), n - 1];
  for (const i of ticks) {
    const anchor = n === 1 ? 'middle' : i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle';
    const label = formatDate(runs[i]?.at ?? '').replace(/[<>&"']/g, '');
    axis += `<text x="${x(i)}" y="${HEIGHT - 10}" text-anchor="${anchor}">${label}</text>`;
  }

  let marks = '';
  if (n > 1) {
    const d = points.map((p, i) => `${i ? 'L' : 'M'}${fixed(p[0])} ${fixed(p[1])}`).join(' ');
    const last = points[n - 1] as [number, number];
    const first = points[0] as [number, number];
    marks += `<path class="area" d="${d} L ${fixed(last[0])} ${y(1)} L ${fixed(first[0])} ${y(1)} Z"/>`;
    marks += `<path class="ln" d="${d}"/>`;
  }
  marks += `<line class="xh" x1="0" x2="0" y1="${MARGIN.top}" y2="${HEIGHT - MARGIN.bottom}" visibility="hidden"/>`;
  marks += points
    .map(
      (p, i) =>
        `<circle class="pt" cx="${fixed(p[0])}" cy="${fixed(p[1])}" r="${i === n - 1 ? 5.5 : 4.5}"/>`,
    )
    .join('');
  marks += `<rect class="hit" x="${MARGIN.left - 8}" y="0" width="${innerW + 16}" height="${HEIGHT}"/>`;

  const latest = runs[n - 1] as SessionRun;
  // All interpolated values above are numbers or sanitized date labels, so raw() is safe here.
  mount(
    container,
    html`<svg
        viewBox="0 0 ${width} ${HEIGHT}"
        width="${width}"
        height="${HEIGHT}"
        role="img"
        aria-label="Clarity rating for each of ${n} sessions. Latest: ${latest.rating} out of 5."
      >
        <g class="grid">${raw(grid)}</g>
        <g class="axis">${raw(axis)}</g>
        ${raw(marks)}
      </svg>
      <div class="tooltip" hidden></div>`,
  );

  const svg = container.querySelector('svg');
  const tip = container.querySelector<HTMLElement>('.tooltip');
  const crosshair = container.querySelector('.xh');
  if (!svg || !tip || !crosshair) return;
  const circles = [...svg.querySelectorAll('.pt')];

  const hide = () => {
    tip.hidden = true;
    crosshair.setAttribute('visibility', 'hidden');
    circles.forEach((c) => c.classList.remove('hot'));
  };
  const show = (clientX: number) => {
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const px = ((clientX - rect.left) * width) / rect.width;
    let best = 0;
    let bestDistance = Infinity;
    points.forEach((p, i) => {
      const distance = Math.abs(p[0] - px);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    const run = runs[best] as SessionRun;
    const point = points[best] as [number, number];
    circles.forEach((c, i) => c.classList.toggle('hot', i === best));
    crosshair.setAttribute('x1', String(point[0]));
    crosshair.setAttribute('x2', String(point[0]));
    crosshair.setAttribute('visibility', 'visible');
    mount(
      tip,
      html`<b>${formatDate(run.at)}</b> · Lesson ${lessonNumber(run.lesson)}<br />${getLesson(run.lesson)?.title ?? ''}<br />Clarity
        <b>${run.rating}/5</b>, ${RATING_LABELS[run.rating]}`,
    );
    tip.hidden = false;
    const sx = (point[0] * rect.width) / width;
    const sy = (point[1] * rect.height) / HEIGHT;
    const left = Math.min(
      Math.max(0, sx - tip.offsetWidth / 2),
      Math.max(0, container.clientWidth - tip.offsetWidth),
    );
    tip.style.setProperty('--tip-x', `${left}px`);
    tip.style.setProperty('--tip-y', `${Math.max(0, sy - tip.offsetHeight - 14)}px`);
  };

  svg.addEventListener('pointermove', (e) => show(e.clientX));
  svg.addEventListener('pointerdown', (e) => show(e.clientX));
  svg.addEventListener('pointerleave', hide);
}
