/**
 * @ui PaintReveal — an image painted in by broad brush strokes: a soft-edged SVG mask of strokes
 * sweeping left/right in turn, from the bottom up (roots → canopy), each drawn with stroke-dashoffset.
 * No wave/ripple/shimmer — one pass, then still. Reduced motion shows the image at once.
 */
import { useId, type CSSProperties } from 'react';
import { cx } from '@shared/utils';
import styles from './PaintReveal.module.css';

export interface PaintRevealProps {
  src: string;
  width: number;
  height: number;
  /** ms before the first stroke. */
  delay?: number;
  /** ms for the whole painting. */
  duration?: number;
  strokes?: number;
  className?: string;
}

export function PaintReveal({ src, width, height, delay = 0, duration = 2000, strokes = 7, className }: PaintRevealProps) {
  const id = useId().replace(/:/g, '');
  const band = height / strokes;
  const each = (duration / strokes) * 1.6; // strokes overlap like a quick hand
  const step = (duration - each) / Math.max(1, strokes - 1);
  return (
    <svg className={cx(styles.root, className)} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <filter id={`f${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={band * 0.18} />
        </filter>
        <mask id={`m${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
          <g filter={`url(#f${id})`} fill="none" stroke="#fff" strokeLinecap="round" strokeWidth={band * 1.7}>
            {Array.from({ length: strokes }, (_, i) => {
              const y = height - band * (i + 0.5);
              const ltr = i % 2 === 0;
              // A slight diagonal and sag reads as a hand-made stroke rather than a wipe.
              const [x0, x1] = ltr ? [-band, width + band] : [width + band, -band];
              const d = `M ${x0} ${y + band * 0.25} Q ${width / 2} ${y - band * 0.35} ${x1} ${y - band * 0.15}`;
              return (
                <path
                  key={i}
                  d={d}
                  pathLength={1}
                  className={styles.stroke}
                  style={{ '--paint-delay': `${delay + i * step}ms`, '--paint-dur': `${each}ms` } as CSSProperties}
                />
              );
            })}
          </g>
        </mask>
      </defs>
      <image href={src} width={width} height={height} mask={`url(#m${id})`} />
    </svg>
  );
}
