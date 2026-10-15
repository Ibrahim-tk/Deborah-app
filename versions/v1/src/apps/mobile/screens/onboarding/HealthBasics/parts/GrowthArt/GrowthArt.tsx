/**
 * The health questions' progress, drawn as growth: a seed in soil (first question) → roots and a sprout →
 * stem and leaves → a bud → a purple blossom (last question). `progress` 0–1; every part eases to its
 * new state, so each answer visibly grows the plant. Pure SVG + CSS transitions, no library.
 */
import type { CSSProperties } from 'react';
import styles from './GrowthArt.module.css';

export interface GrowthArtProps {
  /** 0 = seed, 1 = full bloom. */
  progress: number;
  label: string;
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
/** Part of the growth that happens between a and b. */
const phase = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

// Leaves along the stem: where they sit, which side, and when they unfold.
const LEAVES = [
  { x: 100, y: 146, side: -1, at: [0.22, 0.4], size: 0.8 },
  { x: 101, y: 128, side: 1, at: [0.32, 0.5], size: 0.95 },
  { x: 99, y: 106, side: -1, at: [0.45, 0.64], size: 1.1 },
  { x: 101, y: 88, side: 1, at: [0.56, 0.74], size: 1.15 },
];
const PETALS = [0, 72, 144, 216, 288];

export function GrowthArt({ progress, label }: GrowthArtProps) {
  const p = clamp(progress);
  const v = (name: string, value: number) => ({ [name]: value.toFixed(3) }) as CSSProperties;
  const seed = 1 - phase(p, 0.08, 0.3);
  const roots = phase(p, 0.06, 0.45);
  const stem = phase(p, 0.12, 0.78);
  const bud = phase(p, 0.66, 0.84) * (1 - phase(p, 0.86, 1));
  const bloom = phase(p, 0.82, 1);

  return (
    <svg className={styles.root} viewBox="0 0 200 200" role="img" aria-label={label}>
      {/* Soil */}
      <ellipse className={styles.shadow} cx="100" cy="172" rx="54" ry="5" />
      <path className={styles.soil} d="M58 170 C70 158, 130 158, 142 170 C128 176, 72 176, 58 170 Z" />
      {[[64, 175], [78, 179], [124, 178], [138, 174], [92, 180], [150, 177], [52, 176]].map(([x, y], i) => (
        <circle key={i} className={styles.crumb} cx={x} cy={y} r={i % 2 ? 0.9 : 1.3} />
      ))}

      {/* Roots grow out under the soil */}
      <g className={styles.roots} style={v('--g', roots)}>
        {['M100 168 C96 176, 86 180, 76 186', 'M100 168 C104 177, 116 181, 126 188', 'M100 168 C99 178, 101 186, 98 194', 'M96 172 C90 178, 82 178, 70 178', 'M104 172 C112 176, 122 176, 134 179'].map((d) => (
          <path key={d} d={d} pathLength={1} />
        ))}
      </g>

      {/* Seed: whole, then cracking open as the sprout pushes through */}
      <g className={styles.seed} style={v('--g', seed)}>
        <ellipse cx="100" cy="164" rx="11" ry="9" />
        <path className={styles.seedLine} d="M92 161 C97 158, 103 158, 108 161 M94 167 C98 165, 103 165, 106 167" />
      </g>

      {/* Stem draws itself upward */}
      <path className={styles.stem} style={v('--g', stem)} pathLength={1} d="M100 166 C98 146, 103 128, 99 108 C96 92, 102 76, 100 60" />

      {LEAVES.map((l, i) => (
        <path
          key={i}
          className={styles.leaf}
          style={{ ...v('--g', phase(p, l.at[0], l.at[1])), transformOrigin: `${l.x}px ${l.y}px`, '--side': l.side, '--size': l.size } as CSSProperties}
          d={`M${l.x} ${l.y} c${8 * l.side} -9 ${24 * l.side} -12 ${34 * l.side} -6 c${-8 * l.side} 10 ${-24 * l.side} 13 ${-34 * l.side} 6 z`}
        />
      ))}

      {/* Bud, then the blossom opening petal by petal */}
      <g className={styles.bud} style={v('--g', bud)}>
        <path d="M100 46 C92 52, 93 60, 100 62 C107 60, 108 52, 100 46 Z" />
      </g>
      <g className={styles.flower}>
        {PETALS.map((deg, i) => (
          <ellipse
            key={deg}
            className={styles.petal}
            style={{ ...v('--g', phase(bloom, i * 0.08, 0.6 + i * 0.08)), '--r': `${deg}deg` } as CSSProperties}
            cx="100" cy="45" rx="8.5" ry="15"
          />
        ))}
        <circle className={styles.heart} style={v('--g', phase(bloom, 0.4, 1))} cx="100" cy="58" r="5" />
      </g>
    </svg>
  );
}
