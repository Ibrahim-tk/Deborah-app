/**
 * @ui DateWheel — iOS-style date picker: month · day · year wheels with a shared selection band.
 * Scroll (or tap a row) to pick; each column is an ARIA slider (arrows step, Page keys jump).
 * Value is an ISO date (yyyy-mm-dd); impossible days clamp to the month's length.
 */
import { useEffect, useRef } from 'react';
import styles from './DateWheel.module.css';

const ROW = 40;
const MONTHS = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString(undefined, { month: 'long' }));

interface ColumnProps {
  label: string;
  items: { value: number; label: string }[];
  value: number;
  onChange: (v: number) => void;
  className?: string;
}

function Column({ label, items, value, onChange, className }: ColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<number>();
  const index = Math.max(0, items.findIndex((i) => i.value === value));

  useEffect(() => {
    const el = ref.current;
    if (el && Math.abs(el.scrollTop - index * ROW) > 2) el.scrollTo({ top: index * ROW });
  }, [index]);

  const onScroll = () => {
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const i = Math.min(items.length - 1, Math.max(0, Math.round(el.scrollTop / ROW)));
      if (items[i].value !== value) onChange(items[i].value);
    }, 90);
  };
  const step = (d: number) => onChange(items[Math.min(items.length - 1, Math.max(0, index + d))].value);
  // No options yet (e.g. an empty date before a month is known): render nothing rather than crash.
  if (!items.length) return null;

  return (
    <div
      ref={ref}
      className={`${styles.column} ${className ?? ''}`}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={items[0].value}
      aria-valuemax={items.at(-1)!.value}
      aria-valuenow={value}
      aria-valuetext={items[index]?.label}
      onScroll={onScroll}
      onKeyDown={(e) => {
        const d = { ArrowDown: 1, ArrowUp: -1, PageDown: 5, PageUp: -5 }[e.key];
        if (d) {
          e.preventDefault();
          step(d);
        }
      }}
    >
      <div className={styles.pad} />
      {items.map((it) => (
        <button key={it.value} type="button" tabIndex={-1} className={styles.item} data-on={it.value === value || undefined} onClick={() => onChange(it.value)}>
          {it.label}
        </button>
      ))}
      <div className={styles.pad} />
    </div>
  );
}

export interface DateWheelProps {
  label: string;
  value: string;
  minYear: number;
  maxYear: number;
  onChange: (iso: string) => void;
}

export function DateWheel({ label, value, minYear, maxYear, onChange }: DateWheelProps) {
  const [y, m, d] = value.split('-').map(Number);
  const daysIn = new Date(y, m, 0).getDate();
  const set = (yy: number, mm: number, dd: number) => {
    const day = Math.min(dd, new Date(yy, mm, 0).getDate());
    onChange(`${yy}-${String(mm).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  };
  return (
    <div className={styles.root} role="group" aria-label={label}>
      <span className={styles.band} aria-hidden />
      <Column label="Month" className={styles.month} items={MONTHS.map((l, i) => ({ value: i + 1, label: l }))} value={m} onChange={(mm) => set(y, mm, d)} />
      <Column label="Day" items={Array.from({ length: daysIn }, (_, i) => ({ value: i + 1, label: String(i + 1) }))} value={d} onChange={(dd) => set(y, m, dd)} />
      <Column label="Year" items={Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({ value: maxYear - i, label: String(maxYear - i) }))} value={y} onChange={(yy) => set(yy, m, d)} />
    </div>
  );
}
