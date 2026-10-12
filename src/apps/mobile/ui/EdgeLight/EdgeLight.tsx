/**
 * @ui EdgeLight — a soft violet glow that travels around a rounded card's edge at an even speed
 *     (a blurred dash moving along the outline, so it never crawls on long edges the way a
 *     rotating conic gradient does). Nothing is drawn on the card edge itself.
 *     Place inside a `position: relative` card that is not its own stacking context: the glow
 *     sits behind the card's fill. Still under reduced motion.
 *     OPEN: DESIGN.md bans shimmer animations; kept on the designer's request (2026-10-12).
 */
import { useEffect, useId, useRef, type CSSProperties } from 'react';
import { cx } from '@shared/utils';
import styles from './EdgeLight.module.css';

export interface EdgeLightProps {
  /** Corner radius of the card, px. */
  radius?: number;
  /** Seconds per lap. */
  duration?: number;
  className?: string;
}

/**
 * Only the soft outer glow travels (design direction 2026-10-12: no line on the card edge).
 * Glow segments are centred on the moving point, shortest on top, so it is brightest in the middle.
 */
const VIOLET = '#8b5cf6';
const BLOOM = [0.14, 0.09, 0.05].map((len) => ({ len, color: VIOLET, opacity: 0.35, width: 8 }));
/** Two glows on opposite sides of the card (half a lap apart), travelling the same way. */
const PHASES = [0, 0.5];

export function EdgeLight({ radius = 24, duration = 14, className }: EdgeLightProps) {
  const id = useId().replace(/:/g, '');
  const root = useRef<SVGSVGElement>(null);

  // Every segment is phase-locked to the page clock (startTime 0), not to when it mounted, so a
  // re-render or hot reload can never leave the tail, tip and bloom out of step; every EdgeLight
  // on screen moves together too.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('reduced-motion');
    const host = root.current?.parentElement;
    if (reduced || !host) return;
    const anims = [...host.querySelectorAll<SVGRectElement>(`rect[data-edge="${id}"]`)].map((r) => {
      const start = Number(r.dataset.len) / 2 - Number(r.dataset.phase);
      const a = r.animate([{ strokeDashoffset: start }, { strokeDashoffset: start - 1 }], { duration: duration * 1000, iterations: Infinity, easing: 'linear' });
      a.startTime = 0;
      return a;
    });
    return () => anims.forEach((a) => a.cancel());
  }, [id, duration]);

  const seg = (phase: number) => (s: (typeof BLOOM)[number], i: number) => (
    <rect
      key={`${phase}-${i}`}
      x="0"
      y="0"
      width="100%"
      height="100%"
      rx={radius}
      pathLength={1}
      fill="none"
      stroke={s.color}
      strokeLinecap="round"
      strokeOpacity={s.opacity}
      strokeWidth={s.width}
      data-edge={id}
      data-len={s.len}
      data-phase={phase}
      // Every segment is centred on the same moving point, so together they read as one soft light.
      style={{ strokeDasharray: `${s.len} ${1 - s.len}`, strokeDashoffset: s.len / 2 - phase } as CSSProperties}
    />
  );
  return (
    <>
      <svg ref={root} className={cx(styles.layer, styles.bloom, className)} aria-hidden="true">
        <defs>
          <filter id={`b${id}`} x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <g filter={`url(#b${id})`}>{PHASES.map((p) => BLOOM.map(seg(p)))}</g>
      </svg>
    </>
  );
}
