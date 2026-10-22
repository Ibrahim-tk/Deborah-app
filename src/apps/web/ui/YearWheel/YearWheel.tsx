/**
 * @ui YearWheel — iOS-style scroll wheel for a birth year or age (snap scrolling).
 * Default look matches DateWheel (lilac selection band + soft fade + center zoom). Pass `cinematic` for the 3D drum.
 */
import { useCallback, useEffect, useRef, type CSSProperties } from 'react';
import { cx } from '@shared/utils';
import styles from './YearWheel.module.css';

export interface YearWheelProps {
  value: number;
  min: number;
  max: number;
  onChange: (year: number) => void;
  label: string;
  /** Opt-in 3D drum; plain/clean wheel (DateWheel style) is the default. */
  cinematic?: boolean;
  /** Spoken value for the slider (default: “Born in {value}”). Use for age wheels. */
  formatValue?: (value: number) => string;
}

const ITEM_CLEAN = 40;
const ITEM_CINEMA = 44;

export function YearWheel({ value, min, max, onChange, label, cinematic, formatValue }: YearWheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const years = Array.from({ length: max - min + 1 }, (_, i) => max - i);
  const settle = useRef<number>();
  const frame = useRef<number>();
  const item = cinematic ? ITEM_CINEMA : ITEM_CLEAN;
  const rows = 5;

  // Paint --d / --ad from scroll for continuous center zoom (clean) and the cinematic drum.
  const paint = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (el.scrollLeft) el.scrollLeft = 0;
    const pos = el.scrollTop / item;
    el.querySelectorAll<HTMLElement>('[data-i]').forEach((node) => {
      const d = Number(node.dataset.i) - pos;
      if (Math.abs(d) > 4) return;
      node.style.setProperty('--d', d.toFixed(3));
      node.style.setProperty('--ad', Math.min(Math.abs(d), 3).toFixed(3));
    });
  }, [item]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const top = (max - value) * item;
    if (Math.abs(el.scrollTop - top) > 2) el.scrollTo({ top });
    paint();
  }, [value, max, item, paint]);
  useEffect(() => () => cancelAnimationFrame(frame.current ?? 0), []);

  const onScroll = () => {
    cancelAnimationFrame(frame.current ?? 0);
    frame.current = requestAnimationFrame(paint);
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const y = Math.min(max, Math.max(min, max - Math.round(el.scrollTop / item)));
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
        aria-valuetext={formatValue ? formatValue(value) : `Born in ${value}`}
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
