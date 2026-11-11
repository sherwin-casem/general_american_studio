/**
 * Animation, built on Motion (the library formerly called Framer Motion), through its framework-
 * free API.
 *
 * Rules every animation here follows:
 * - Content is visible without animation. Animations start from a hidden state that Motion sets
 *   and always end visible, so a re-render or a skipped animation never leaves anything hidden.
 * - People who ask their system for reduced motion get no movement, only the final state.
 * - Where the Web Animations API is missing (tests, very old browsers), everything is a no-op.
 * - Motion animates through the Web Animations API and the CSSOM, both of which the strict
 *   Content-Security-Policy allows.
 */
import { animate, inView, stagger } from 'motion';
import { articulationFor, mixArticulation, updateMouth, type Articulation } from './illustrations';
import type { SoundKey } from '../content/types';
import type { MotionPreference } from '../state/app-state';
import { soundByKey } from '../content/course';

type Cleanup = () => void;
const noop: Cleanup = () => {};

/** Easing for things arriving: fast start, soft landing. */
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Whether the system asks for reduced motion (on Windows: "Show animations" turned off). */
export function systemPrefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

let preference: MotionPreference = 'system';

/**
 * Sets the learner's choice. "system" follows the reduced-motion setting; "on" and "off" override
 * it. The effective result is mirrored on <html data-motion>, for CSS transitions.
 */
export function setMotionPreference(next: MotionPreference): void {
  preference = next;
  document.documentElement.dataset.motion = motionAllowed() ? 'on' : 'off';
}

/** Whether animations should run at all. */
export function motionAllowed(): boolean {
  if (typeof Element === 'undefined' || typeof Element.prototype.animate !== 'function') {
    return false;
  }
  if (preference !== 'system') return preference === 'on';
  return !systemPrefersReducedMotion();
}

function safely(task: () => void): void {
  try {
    task();
  } catch {
    /* an animation failing must never break the app */
  }
}

/** Fades a newly shown view in, its top-level blocks one after another. */
export function enterView(section: HTMLElement): void {
  if (!motionAllowed()) return;
  const blocks = [...section.children].filter(
    (el): el is HTMLElement => el instanceof HTMLElement && !el.hidden,
  );
  safely(() => {
    animate(
      blocks,
      { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0px)'] },
      { duration: 0.45, delay: stagger(0.06), ease: EASE_OUT },
    );
    fillMeters(section);
  });
}

/** Progress meters fill up from empty. */
export function fillMeters(root: ParentNode): void {
  if (!motionAllowed()) return;
  const bars = [...root.querySelectorAll<HTMLElement>('.meter > i')];
  if (!bars.length) return;
  safely(() => {
    animate(
      bars,
      { transform: ['scaleX(0)', 'scaleX(1)'] },
      { duration: 0.9, delay: stagger(0.05, { startDelay: 0.15 }), ease: EASE_OUT },
    );
  });
}

/** A panel whose content was just swapped (a new sound, for example) eases in. */
export function swapIn(el: Element): void {
  if (!motionAllowed()) return;
  safely(() => {
    animate(
      el,
      { opacity: [0.2, 1], transform: ['translateY(8px)', 'translateY(0px)'] },
      { duration: 0.32, ease: EASE_OUT },
    );
  });
}

/**
 * Elements marked `data-reveal` rise into place as they scroll into view. With
 * `data-reveal="stagger"`, their children arrive one after another instead.
 */
export function revealOnScroll(root: ParentNode): Cleanup {
  if (!motionAllowed() || typeof IntersectionObserver === 'undefined') return noop;
  const stops: Cleanup[] = [];
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const staggered = el.dataset.reveal === 'stagger';
    const targets = staggered ? [...el.children].filter((c) => c instanceof HTMLElement) : [el];
    for (const t of targets) {
      (t as HTMLElement).style.opacity = '0';
      (t as HTMLElement).style.transform = 'translateY(22px)';
    }
    stops.push(
      inView(
        el,
        () => {
          safely(() => {
            animate(
              targets,
              { opacity: 1, transform: 'translateY(0px)' },
              { duration: 0.6, delay: staggered ? stagger(0.08) : 0, ease: EASE_OUT },
            );
          });
        },
        { amount: 0.15 },
      ),
    );
  });
  return () => stops.forEach((stop) => stop());
}

/**
 * Small loops inside diagrams, started only while the diagram is on screen: airflow moving
 * along its path, vocal folds buzzing, and a pulse on the highlighted spot.
 */
export function ambient(root: ParentNode): Cleanup {
  if (!motionAllowed() || typeof IntersectionObserver === 'undefined') return noop;
  const stops: Cleanup[] = [];
  // Decorative symbols drift gently up and down, each at its own pace.
  root.querySelectorAll<HTMLElement>('[data-anim="float"]').forEach((el, i) => {
    stops.push(
      inView(el, () => {
        let loop: { stop(): void } | null = null;
        safely(() => {
          loop = animate(
            el,
            { transform: ['translateY(0px)', `translateY(${-10 - (i % 3) * 4}px)`] },
            {
              duration: 2.6 + (i % 4) * 0.7,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: i * 0.3,
            },
          );
        });
        return () => loop?.stop();
      }),
    );
  });
  root.querySelectorAll<SVGElement>('svg.mouth').forEach((svg) => {
    if (!svg.querySelector('[data-anim]')) return;
    stops.push(
      inView(svg, () => {
        const running: { stop(): void }[] = [];
        safely(() => {
          svg.querySelectorAll('[data-anim="flow"]').forEach((el) => {
            running.push(
              animate(
                el,
                { strokeDashoffset: [0, -28] },
                { duration: 1.1, repeat: Infinity, ease: 'linear' },
              ),
            );
          });
          svg.querySelectorAll('[data-anim="buzz"]').forEach((el) => {
            running.push(
              animate(
                el,
                { transform: ['scaleY(1)', 'scaleY(1.7)', 'scaleY(0.6)', 'scaleY(1)'] },
                { duration: 0.24, repeat: Infinity, ease: 'linear' },
              ),
            );
          });
          svg.querySelectorAll('[data-anim="pulse"]').forEach((el) => {
            running.push(
              animate(
                el,
                { transform: ['scale(1)', 'scale(2.8)'], opacity: [0.75, 0] },
                { duration: 1.6, repeat: Infinity, ease: 'easeOut' },
              ),
            );
          });
        });
        return () => running.forEach((a) => a.stop());
      }),
    );
  });
  return () => stops.forEach((stop) => stop());
}

/**
 * The homepage picture. It settles into its frame, then drifts slowly like a camera while it is
 * on screen, and its layers (`data-depth`, in pixels) shift with the pointer for a sense of depth:
 * negative depths move against the pointer, positive ones with it. Touch input is ignored.
 */
export function heroScene(hero: HTMLElement): Cleanup {
  const frame = hero.querySelector<HTMLElement>('.hp-frame');
  if (!frame || !motionAllowed()) return noop;
  const img = frame.querySelector<HTMLElement>('.hp-img');
  const layers = [...frame.querySelectorAll<HTMLElement>('[data-depth]')];
  const stops: Cleanup[] = [];
  let drift: { stop(): void } | null = null;
  let stopped = false;

  safely(() => {
    animate(
      frame,
      { opacity: [0, 1], transform: ['translateY(28px) scale(0.96)', 'translateY(0px) scale(1)'] },
      { duration: 1, ease: EASE_OUT },
    );
    if (!img) return;
    // The settle is short, and is left to finish even if the page is rendered again.
    animate(img, { transform: ['scale(1.2)', 'scale(1.05)'] }, { duration: 2.2, ease: EASE_OUT });
    if (typeof IntersectionObserver === 'undefined') return;
    // Once settled, drift while on screen.
    const timer = window.setTimeout(() => {
      if (stopped) return;
      stops.push(
        inView(frame, () => {
          safely(() => {
            drift = animate(
              img,
              { transform: ['scale(1.05)', 'scale(1.11)'] },
              { duration: 16, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
            );
          });
          return () => drift?.stop();
        }),
      );
    }, 2300);
    stops.push(() => window.clearTimeout(timer));
  });

  let frameRequest = 0;
  const spring = { type: 'spring', stiffness: 80, damping: 18 } as const;
  const shift = (dx: number, dy: number) => {
    for (const layer of layers) {
      const depth = Number(layer.dataset.depth) || 0;
      safely(() => {
        animate(layer, { x: dx * depth, y: dy * depth }, spring);
      });
    }
  };
  const onMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    cancelAnimationFrame(frameRequest);
    frameRequest = requestAnimationFrame(() => {
      const box = frame.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const dx = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width - 0.5) * 2));
      const dy = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height - 0.5) * 2));
      shift(dx / 2, dy / 2);
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(frameRequest);
    shift(0, 0);
  };
  hero.addEventListener('pointermove', onMove);
  hero.addEventListener('pointerleave', onLeave);

  return () => {
    stopped = true;
    cancelAnimationFrame(frameRequest);
    hero.removeEventListener('pointermove', onMove);
    hero.removeEventListener('pointerleave', onLeave);
    drift?.stop();
    stops.forEach((stop) => stop());
  };
}

/** A springy nudge, for a right answer or a finished step. */
export function pop(el: Element | null): void {
  if (!el || !motionAllowed()) return;
  safely(() => {
    // Springs take only two keyframes, so the out-and-back is a timed curve instead.
    animate(el, { scale: [1, 1.14, 0.98, 1] }, { duration: 0.42, ease: 'easeOut' });
  });
}

/** A short shake, for a wrong answer. */
export function shake(el: Element | null): void {
  if (!el || !motionAllowed()) return;
  safely(() => {
    animate(el, { x: [0, -9, 8, -6, 4, 0] }, { duration: 0.42, ease: 'easeInOut' });
  });
}

/** Numbers count up from zero to the value they show. */
export function countUp(root: ParentNode): void {
  if (!motionAllowed()) return;
  root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count);
    if (!Number.isFinite(to) || to <= 0) return;
    safely(() => {
      animate(0, to, {
        duration: Math.min(1.6, 0.6 + to / 400),
        ease: EASE_OUT,
        onUpdate: (v) => {
          el.textContent = Math.round(v).toLocaleString('en-US');
        },
      });
    });
  });
}

/** A burst of sound symbols from the middle of an element, to celebrate a finished lesson. */
export function celebrate(el: Element | null): void {
  if (!(el instanceof HTMLElement) || !motionAllowed()) return;
  const glyphs = ['θ', 'ð', 'æ', 'ɝ', 'ŋ', 'ʃ', 'ɑ', 'ʊ', 'ɾ', 'oʊ', 'aɪ', 'ə'];
  const layer = document.createElement('span');
  layer.className = 'burst';
  layer.setAttribute('aria-hidden', 'true');
  el.append(layer);
  const pieces = glyphs.map((g, i) => {
    const s = document.createElement('span');
    s.textContent = g;
    s.className = `burst-bit b${i % 4}`;
    layer.append(s);
    return s;
  });
  safely(() => {
    const flights = pieces.map((s, i) => {
      const angle = (i / pieces.length) * Math.PI * 2 + Math.random() * 0.4;
      const distance = 70 + Math.random() * 70;
      return animate(
        s,
        {
          transform: [
            'translate(-50%, -50%) scale(0.4)',
            `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(1)`,
          ],
          opacity: [1, 1, 0],
        },
        { duration: 1.1, ease: EASE_OUT, delay: i * 0.015 },
      );
    });
    void Promise.all(flights.map((f) => f.finished)).finally(() => layer.remove());
  });
}

/** Moves the highlight pill behind the current navigation item. */
export function moveNavPill(nav: HTMLElement, instant: boolean): void {
  const pill = nav.querySelector<HTMLElement>('.nav-pill');
  const item = nav.querySelector<HTMLElement>('.nav-item[aria-current="page"]');
  if (!pill) return;
  if (!item || item.offsetParent === null) {
    pill.style.opacity = '0';
    return;
  }
  const target = {
    transform: `translate(${item.offsetLeft}px, ${item.offsetTop}px)`,
    width: `${item.offsetWidth}px`,
    height: `${item.offsetHeight}px`,
    opacity: 1,
  };
  const first = pill.style.opacity !== '1';
  if (instant || first || !motionAllowed()) {
    Object.assign(pill.style, { ...target, opacity: '1' });
    return;
  }
  safely(() => {
    animate(pill, target, { type: 'spring', stiffness: 420, damping: 34 });
  });
}

/** Shows a toast with a spring, and hides it again with a fade. */
export function toastIn(el: HTMLElement): void {
  if (!motionAllowed()) return;
  safely(() => {
    animate(
      el,
      { opacity: [0, 1], transform: ['translateY(16px) scale(0.96)', 'translateY(0px) scale(1)'] },
      { type: 'spring', stiffness: 380, damping: 26 },
    );
  });
}

/* ---------- The homepage's talking mouth ---------- */

export interface MouthDemo {
  /** Moves to a sound, and stops the automatic tour. */
  show(key: SoundKey): void;
  stop(): void;
}

/**
 * Animates the homepage diagram from one sound to the next. The mouth morphs smoothly (tongue,
 * lips, jaw, soft palate) while the label shows which sound it is. The tour pauses while the
 * diagram is off screen or the tab is hidden, and stops once the visitor picks a sound.
 */
export function startMouthDemo(
  root: HTMLElement,
  keys: readonly SoundKey[],
  onChange?: () => void,
): MouthDemo {
  const svg = root.querySelector('svg.mouth');
  const shapes = keys
    .map((key) => [key, articulationFor(key)] as const)
    .filter((x): x is readonly [SoundKey, Articulation] => x[1] !== null);
  let index = 0;
  let current: Articulation | null = shapes[0]?.[1] ?? null;
  let morph: { stop(): void } | null = null;
  let timer: number | undefined;
  let touring = true;
  let visible = false;

  const label = (key: SoundKey) => {
    const sound = soundByKey(key);
    root.querySelectorAll<HTMLElement>('[data-demo="ipa"]').forEach((el) => {
      el.textContent = `/${sound.ipa}/`;
    });
    root.querySelectorAll<HTMLElement>('[data-demo="name"]').forEach((el) => {
      el.textContent = sound.name;
    });
    root.querySelectorAll<HTMLElement>('[data-demo="place"]').forEach((el) => {
      el.textContent = sound.place ?? 'Where your tongue sits for this vowel';
    });
    root.querySelectorAll<HTMLElement>('[data-demo="say"]').forEach((el) => {
      el.dataset.say = sound.keyword;
      const word = el.querySelector('[data-demo="word"]');
      if (word) word.textContent = `Hear “${sound.keyword}”`;
    });
    root.querySelectorAll<HTMLElement>('[data-action="demo-sound"]').forEach((el) => {
      el.setAttribute('aria-pressed', String(el.dataset.sound === key));
    });
    onChange?.();
  };

  const go = (i: number) => {
    const next = shapes[i];
    if (!next || !svg) return;
    index = i;
    const [key, target] = next;
    const from = current ?? target;
    label(key);
    morph?.stop();
    if (!motionAllowed()) {
      current = target;
      updateMouth(svg, target);
      return;
    }
    safely(() => {
      morph = animate(0, 1, {
        duration: 0.85,
        ease: [0.65, 0, 0.35, 1],
        onUpdate: (t) => {
          current = mixArticulation(from, target, t);
          updateMouth(svg, current);
        },
      });
      const glyph = root.querySelector('[data-demo="ipa"]');
      if (glyph) {
        animate(
          glyph,
          { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] },
          { duration: 0.4, ease: EASE_OUT },
        );
      }
    });
  };

  const schedule = () => {
    window.clearTimeout(timer);
    if (!touring || !visible || document.hidden || !motionAllowed()) return;
    timer = window.setTimeout(() => {
      go((index + 1) % shapes.length);
      schedule();
    }, 2800);
  };

  const onVisibility = () => schedule();
  document.addEventListener('visibilitychange', onVisibility);
  const stopView =
    typeof IntersectionObserver === 'undefined'
      ? noop
      : inView(root, () => {
          visible = true;
          schedule();
          return () => {
            visible = false;
            window.clearTimeout(timer);
          };
        });
  if (shapes[0]) label(shapes[0][0]);

  return {
    show(key) {
      touring = false;
      window.clearTimeout(timer);
      const i = shapes.findIndex(([k]) => k === key);
      if (i >= 0) go(i);
    },
    stop() {
      touring = false;
      window.clearTimeout(timer);
      morph?.stop();
      stopView();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
