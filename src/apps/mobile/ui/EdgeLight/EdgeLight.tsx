/**
 * @ui EdgeLight — a soft violet glow that drifts behind a rounded card (never on the rim).
 *     Length and pace vary so the motion feels organic rather than metronomic.
 *     Place as a sibling behind the card fill (or inside a host that is not stacking-context
 *     locked over the bloom). Still under reduced motion.
 *     OPEN: DESIGN.md bans shimmer animations; kept on the designer's request (2026-10-12).
 */
import { useEffect, useId, useRef, type CSSProperties } from 'react';
import { cx } from '@shared/utils';
import styles from './EdgeLight.module.css';

export interface EdgeLightProps {
  /** Corner radius of the card, px. */
  radius?: number;
  /** Base seconds per lap (actual pace drifts around this). */
  duration?: number;
  className?: string;
}

const VIOLET = '#8b5cf6';
/** Soft bloom layers — lengths breathe in the animation. */
const LAYERS = [
  { baseLen: 0.16, color: VIOLET, opacity: 0.32, width: 9 },
  { baseLen: 0.1, color: VIOLET, opacity: 0.22, width: 7 },
  { baseLen: 0.06, color: VIOLET, opacity: 0.14, width: 5 },
];
/** Uneven phases so the two glows never sit opposite like clock hands. */
const PHASES = [0.04, 0.41];

export function EdgeLight({ radius = 24, duration = 16, className }: EdgeLightProps) {
  const id = useId().replace(/:/g, '');
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.classList.contains('reduced-motion');
    const host = root.current;
    if (reduced || !host) return;

    const anims: Animation[] = [];
    host.querySelectorAll<SVGRectElement>(`rect[data-edge="${id}"]`).forEach((r, i) => {
      const phase = Number(r.dataset.phase);
      const baseLen = Number(r.dataset.len);
      // Each layer/phase drifts at its own pace and breathes in length.
      const lapMs = duration * 1000 * (0.72 + ((i * 0.17) % 0.55));
      const start = baseLen / 2 - phase;
      const travel = r.animate(
        [
          { strokeDashoffset: start, offset: 0 },
          { strokeDashoffset: start - 0.22, offset: 0.28, easing: 'ease-in-out' },
          { strokeDashoffset: start - 0.48, offset: 0.52, easing: 'ease-out' },
          { strokeDashoffset: start - 0.7, offset: 0.74, easing: 'ease-in' },
          { strokeDashoffset: start - 1, offset: 1 },
        ],
        { duration: lapMs, iterations: Infinity },
      );
      // Stagger clocks so they never lock into a shared beat.
      travel.currentTime = (i * lapMs * 0.31) % lapMs;

      const breathe = r.animate(
        [
          { strokeDasharray: `${baseLen * 0.7} ${1 - baseLen * 0.7}` },
          { strokeDasharray: `${baseLen * 1.35} ${1 - baseLen * 1.35}` },
          { strokeDasharray: `${baseLen * 0.85} ${1 - baseLen * 0.85}` },
          { strokeDasharray: `${baseLen * 1.15} ${1 - baseLen * 1.15}` },
          { strokeDasharray: `${baseLen * 0.7} ${1 - baseLen * 0.7}` },
        ],
        {
          duration: lapMs * (1.4 + (i % 3) * 0.35),
          iterations: Infinity,
          easing: 'ease-in-out',
          direction: i % 2 === 0 ? 'normal' : 'reverse',
        },
      );
      breathe.currentTime = (i * 900) % (lapMs * 1.4);
      anims.push(travel, breathe);
    });

    return () => anims.forEach((a) => a.cancel());
  }, [id, duration]);

  const seg = (phase: number) => (s: (typeof LAYERS)[number], i: number) => (
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
      data-len={s.baseLen}
      data-phase={phase}
      style={{ strokeDasharray: `${s.baseLen} ${1 - s.baseLen}`, strokeDashoffset: s.baseLen / 2 - phase } as CSSProperties}
    />
  );

  return (
    <svg ref={root} className={cx(styles.layer, styles.bloom, className)} aria-hidden="true">
      <defs>
        <filter id={`b${id}`} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <g filter={`url(#b${id})`}>{PHASES.map((p) => LAYERS.map(seg(p)))}</g>
    </svg>
  );
}
