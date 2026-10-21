/**
 * @ui FluxLoader — adapted from "progressive-flux-loader" (21st.dev) to this design system: vanilla CSS
 *     Module, brand tokens, the Motion adapter (no framer-motion import here). Two separate parts so a
 *     screen can place them apart: `FluxLabel` (phase text that flies in letter by letter) and
 *     `FluxBar` (tokenised fill). DESIGN.md: no sheen/shimmer sweep, no glow shadow, weight ≤ 500.
 */
import type { CSSProperties } from 'react';
import { AnimatePresence, EASE_OUT, MotionDiv, MotionSpan, useReducedMotionPref } from '../Motion';
import styles from './FluxLoader.module.css';


export function FluxLabel({ label, className }: { label: string; className?: string }) {
  const reduced = useReducedMotionPref();
  const cls = className ? `${styles.label} ${className}` : styles.label;
  if (reduced) return <div className={styles.labelBox}><div className={cls}>{label}</div></div>;
  return (
    <div className={styles.labelBox} aria-hidden>
      <AnimatePresence mode="wait">
        <MotionDiv
          key={label}
          className={cls}
          initial={{ opacity: 0, z: -240, scale: 0.8, filter: 'blur(10px)' }}
          animate={{ opacity: 1, z: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, z: 160, scale: 1.15, filter: 'blur(8px)', transition: { duration: 0.6, ease: [0.7, 0, 0.84, 0] } }}
          transition={{ duration: 1.3, ease: EASE_OUT }}
        >
          {label.split('').map((ch, i) => (
            <MotionSpan
              key={`${label}-${i}`}
              className={styles.char}
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.2 + i * 0.05 }}
            >
              {ch === ' ' ? ' ' : ch}
            </MotionSpan>
          ))}
        </MotionDiv>
      </AnimatePresence>
    </div>
  );
}

export function FluxBar({ value, label = 'Loading', valueText }: { value: number; label?: string; valueText?: string }) {
  const v = Math.round(Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0)));
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      aria-valuetext={valueText ?? `${v}%`}
      style={{ '--flux': `${v}%` } as CSSProperties}
    >
      <span className={styles.fill} />
    </div>
  );
}
