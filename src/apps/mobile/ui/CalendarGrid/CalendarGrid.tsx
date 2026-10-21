/**
 * @ui CalendarGrid — month calendar (MUI-style day grid, our tokens). Header: month · year with prev/next;
 *     Sunday-first weekday row; 6×7 day cells. Values are yyyy-mm-dd strings; `today` comes from the
 *     simulated clock (caller passes it), never the real one.
 */
import { useState } from 'react';
import { cx } from '@shared/utils';
import { Icon } from '../Icon';
import styles from './CalendarGrid.module.css';

export interface CalendarGridProps {
  value?: string;
  today: string;
  onChange: (value: string) => void;
  /** Earliest selectable day (yyyy-mm-dd), e.g. today for future appointments. */
  min?: string;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const pad = (n: number) => String(n).padStart(2, '0');
const key = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parse = (v: string) => { const [y, m] = v.split('-').map(Number); return { y, m: m - 1 }; };

export function CalendarGrid({ value, today, onChange, min }: CalendarGridProps) {
  const [view, setView] = useState(() => parse(value ?? today));
  const first = new Date(view.y, view.m, 1);
  const lead = first.getDay();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(view.y, view.m, i - lead + 1);
    return { k: key(d.getFullYear(), d.getMonth(), d.getDate()), day: d.getDate(), inMonth: d.getMonth() === view.m };
  });
  const shift = (n: number) => setView(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const label = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <span className={styles.month} aria-live="polite">{label}</span>
        <span className={styles.nav}>
          <button type="button" className={styles.navBtn} aria-label="Previous month" onClick={() => shift(-1)}><Icon name="back" size={18} /></button>
          <button type="button" className={styles.navBtn} aria-label="Next month" onClick={() => shift(1)}><Icon name="chevron" size={18} /></button>
        </span>
      </div>
      <div className={styles.grid} role="grid" aria-label={label}>
        {WEEKDAYS.map((w, i) => <span key={i} className={styles.weekday} aria-hidden>{w}</span>)}
        {cells.map((c) => {
          const disabled = Boolean(min && c.k < min);
          return (
            <button
              key={c.k}
              type="button"
              role="gridcell"
              className={cx(styles.day, !c.inMonth && styles.outside)}
              data-selected={c.k === value || undefined}
              data-today={c.k === today || undefined}
              aria-selected={c.k === value}
              aria-label={c.k}
              disabled={disabled}
              onClick={() => onChange(c.k)}
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
