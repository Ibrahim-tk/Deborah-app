/**
 * @ui GrowReveal — the tree of life grows in: the trunk rises from the root crown, roots creep
 *     outward and down, branches fork from the top of the trunk toward the canopy edge, then the
 *     fine twigs and leaves fill in. A soft-edged SVG mask of strokes drawn with stroke-dashoffset,
 *     plus two blooms that settle the fine detail. One pass, then still (no wave/ripple/pulse).
 *     Reduced motion shows the image at once.
 *     Geometry is tuned to /images/splash/tree-of-life.svg (fractions of the box).
 */
import { useId, type CSSProperties } from 'react';
import { cx } from '@flow-v1/shared/utils';
import styles from './GrowReveal.module.css';

export interface GrowRevealProps {
  src: string;
  width: number;
  height: number;
  /** ms before the trunk starts. */
  delay?: number;
  /** ms for the whole growth. */
  duration?: number;
  className?: string;
}

type Pt = [number, number];

const CROWN: Pt = [0.5, 0.72]; // where trunk meets roots
const FORK: Pt = [0.5, 0.42]; // where the trunk splits into branches
const CANOPY = { c: [0.5, 0.48] as Pt, rx: 0.5, ry: 0.48 };
// Canopy tips, ordered so the first branches to grow are the upright ones, then they spread.
const BRANCH_ANGLES = [90, 112, 68, 135, 45, 160, 20, 185, -5];
const ROOT_TIPS: Pt[] = [[0.5, 1], [0.38, 0.99], [0.62, 0.99], [0.2, 0.9], [0.8, 0.9], [0.07, 0.75], [0.93, 0.75]];

/** Tiny deterministic jitter so the growth doesn't look machine-even. */
const jitter = (i: number) => ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 0.04;

export function GrowReveal({ src, width: w, height: h, delay = 0, duration = 2000, className }: GrowRevealProps) {
  const id = useId().replace(/:/g, '');
  const P = ([x, y]: Pt) => `${x * w} ${y * h}`;
  // Phase helper: start/length as fractions of the whole growth.
  const at = (start: number, len: number) =>
    ({ '--grow-delay': `${delay + start * duration}ms`, '--grow-dur': `${len * duration}ms` }) as CSSProperties;

  const branches = BRANCH_ANGLES.map((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const tip: Pt = [CANOPY.c[0] + CANOPY.rx * Math.cos(a), CANOPY.c[1] - CANOPY.ry * Math.sin(a)];
    // Rise steeply off the trunk, then bend out toward the tip.
    const ctrl: Pt = [FORK[0] + (tip[0] - FORK[0]) * 0.2, tip[1] + (FORK[1] - tip[1]) * 0.4];
    return { d: `M ${P(FORK)} Q ${P(ctrl)} ${P(tip)}`, style: at(0.3 + i * 0.035 + jitter(i), 0.42) };
  });
  const roots = ROOT_TIPS.map((tip, i) => {
    // Spread sideways first, then droop.
    const ctrl: Pt = [CROWN[0] + (tip[0] - CROWN[0]) * 0.55, CROWN[1] + (tip[1] - CROWN[1]) * 0.15];
    return { d: `M ${P(CROWN)} Q ${P(ctrl)} ${P(tip)}`, style: at(0.14 + i * 0.03 + jitter(i + 9), 0.4) };
  });

  return (
    <svg className={cx(styles.root, className)} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs>
        <filter id={`f${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={w * 0.03} />
        </filter>
        <mask id={`m${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          <g filter={`url(#f${id})`} stroke="#fff" fill="none" strokeLinecap="round">
            <path d={`M ${P([0.5, 0.8])} L ${P(FORK)}`} pathLength={1} strokeWidth={w * 0.2} className={styles.stroke} style={at(0, 0.34)} />
            {roots.map((r, i) => (
              <path key={`r${i}`} d={r.d} pathLength={1} strokeWidth={w * 0.1} className={styles.stroke} style={r.style} />
            ))}
            {branches.map((b, i) => (
              <path key={`b${i}`} d={b.d} pathLength={1} strokeWidth={w * 0.14} className={styles.stroke} style={b.style} />
            ))}
            {/* Fine twigs and leaves settle in from the centre of each mass. */}
            <ellipse cx={0.5 * w} cy={0.86 * h} rx={0.5 * w} ry={0.2 * h} fill="#fff" stroke="none" className={styles.bloom} style={at(0.5, 0.4)} />
            <circle cx={0.5 * w} cy={0.42 * h} r={0.62 * w} fill="#fff" stroke="none" className={styles.bloom} style={at(0.68, 0.32)} />
          </g>
        </mask>
      </defs>
      <image href={src} width={w} height={h} mask={`url(#m${id})`} />
    </svg>
  );
}
