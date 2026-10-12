/**
 * @ui YearWheel — iOS-style scroll wheel for a birth year (snap scrolling). Keyboard and screen
 * readers use it as a slider: arrows step a year, Page keys step ten.
 */
import { useEffect, useRef } from 'react';
import styles from './YearWheel.module.css';

export interface YearWheelProps {
  value: number;
  min: number;
  max: number;
  onChange: (year: number) => void;
  label: string;
}

const ITEM = 44;

export function YearWheel({ value, min, max, onChange, label }: YearWheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const years = Array.from({ length: max - min + 1 }, (_, i) => max - i);
  const settle = useRef<number>();

  // Keep the scroll position on the value (initial render and keyboard steps).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const top = (max - value) * ITEM;
    if (Math.abs(el.scrollTop - top) > 2) el.scrollTo({ top });
  }, [value, max]);

  const onScroll = () => {
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
    <div className={styles.root}>
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
        {years.map((y) => (
          <button key={y} type="button" tabIndex={-1} className={styles.item} data-on={y === value || undefined} onClick={() => onChange(y)}>
            {y}
          </button>
        ))}
        <div className={styles.pad} />
      </div>
    </div>
  );
}
