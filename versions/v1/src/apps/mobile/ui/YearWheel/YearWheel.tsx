/**
 * @ui YearWheel — iOS-style scroll wheel for a birth year (snap scrolling). Keyboard and screen
 * readers use it as a slider: arrows step a year, Page keys step ten.
 * `cinematic`: a five-row 3D drum. Every year's tilt, scale, dim and blur follow the live scroll position,
 * and the centred year grows.
 */
import { useCallback, useEffect, useRef, type CSSProperties } from 'react';
import { cx } from '@flow-v1/shared/utils';
import styles from './YearWheel.module.css';

export interface YearWheelProps {
  value: number;
  min: number;
  max: number;
  onChange: (year: number) => void;
  label: string;
  /** Opt-in 3D drum (sign-up health basics); the plain wheel stays the default. */
  cinematic?: boolean;
}

const ITEM = 44;

export function YearWheel({ value, min, max, onChange, label, cinematic }: YearWheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const years = Array.from({ length: max - min + 1 }, (_, i) => max - i);
  const settle = useRef<number>();
  const frame = useRef<number>();
  const rows = cinematic ? 5 : 3;

  // Cinematic: write each year's distance from the centre (in rows) as CSS vars, once per frame.
  const paint = useCallback(() => {
    const el = ref.current;
    if (!el || !cinematic) return;
    if (el.scrollLeft) el.scrollLeft = 0;
    const pos = el.scrollTop / ITEM;
    el.querySelectorAll<HTMLElement>('[data-i]').forEach((node) => {
      const d = Number(node.dataset.i) - pos;
      if (Math.abs(d) > 4) return;
      node.style.setProperty('--d', d.toFixed(3));
      node.style.setProperty('--ad', Math.min(Math.abs(d), 3).toFixed(3));
    });
  }, [cinematic]);

  // Keep the scroll position on the value (initial render and keyboard steps).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const top = (max - value) * ITEM;
    if (Math.abs(el.scrollTop - top) > 2) el.scrollTo({ top });
    paint();
  }, [value, max, paint]);
  useEffect(() => () => cancelAnimationFrame(frame.current ?? 0), []);

  const onScroll = () => {
    cancelAnimationFrame(frame.current ?? 0);
    frame.current = requestAnimationFrame(paint);
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const y = Math.min(max, Math.max(min, max - Math.round(el.scrollTop / ITEM)));
      if (y !== value) onChange(y);
    }, 90);
  };

  const step = (d: number) => onChange(Math.min(max, Math.max(min, value + d)));

  return (
    <div className={cx(styles.root, cinematic && styles.cinematic)} style={{ '--rows': rows } as CSSProperties}>
      <span className={styles.band} aria-hidden />
      <div
        ref={ref}
        className={styles.wheel}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`Born in ${value}`}
        onScroll={onScroll}
        onKeyDown={(e) => {
          const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[e.key];
          if (d) {
            e.preventDefault();
            step(d);
          }
        }}
      >
        <div className={styles.pad} />
        {years.map((y, i) => (
          <button key={y} type="button" tabIndex={-1} className={styles.item} data-i={i} data-on={y === value || undefined} onClick={() => onChange(y)}>
            <span className={styles.year}>{y}</span>
          </button>
        ))}
        <div className={styles.pad} />
      </div>
    </div>
  );
}
