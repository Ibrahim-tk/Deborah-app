/**
 * @ui CalendarGrid — MUI-style date calendar in our tokens, never scrolls (designer, 2026-10-30).
 *     Views like MUI's `year → month → day`: tap the month · year label to pick a year (20-year pages),
 *     then a month, then a day. Values are yyyy-mm-dd strings; `today` comes from the caller
 *     (simulated clock where it matters). Scroll wheels stay only in the intake (DateWheel).
 */
import { useState } from 'react';
import { cx } from '@shared/utils';
import { Icon } from '../Icon';
import styles from './CalendarGrid.module.css';

export type CalendarView = 'year' | 'month' | 'day';

export interface CalendarGridProps {
  value?: string;
  today: string;
  onChange: (value: string) => void;
  /** Earliest / latest selectable day (yyyy-mm-dd), e.g. today for future appointments. */
  min?: string;
  max?: string;
  /** View it opens on (MUI `openTo`); date of birth opens on the year. */
  openTo?: CalendarView;
  /** Month shown when there's no value yet (yyyy-mm-dd). */
  initialFocus?: string;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS_PER_PAGE = 20;
const pad = (n: number) => String(n).padStart(2, '0');
const key = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parse = (v: string) => { const [y, m] = v.split('-').map(Number); return { y, m: m - 1 }; };
const pageStart = (y: number) => y - (((y % YEARS_PER_PAGE) + YEARS_PER_PAGE) % YEARS_PER_PAGE);

export function CalendarGrid({ value, today, onChange, min, max, openTo = 'day', initialFocus }: CalendarGridProps) {
  const [view, setView] = useState(() => parse(value || initialFocus || today));
  const [mode, setMode] = useState<CalendarView>(openTo);
  const [page, setPage] = useState(() => pageStart(view.y));
  const minY = min ? Number(min.slice(0, 4)) : -Infinity;
  const maxY = max ? Number(max.slice(0, 4)) : Infinity;
  const first = new Date(view.y, view.m, 1);
  const lead = first.getDay();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(view.y, view.m, i - lead + 1);
    return { k: key(d.getFullYear(), d.getMonth(), d.getDate()), day: d.getDate(), inMonth: d.getMonth() === view.m };
  });
  const out = (k: string) => Boolean((min && k < min) || (max && k > max));
  const shift = (n: number) => setView(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const step = (dir: 1 | -1) => {
    if (mode === 'year') setPage((p) => p + dir * YEARS_PER_PAGE);
    else if (mode === 'month') setView((v) => ({ ...v, y: v.y + dir }));
    else shift(dir);
  };
  const label = mode === 'year'
    ? `${page} – ${page + YEARS_PER_PAGE - 1}`
    : mode === 'month' ? String(view.y) : first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const toggleYears = () => { setPage(pageStart(view.y)); setMode((m) => (m === 'year' ? 'day' : 'year')); };
  const what = mode === 'year' ? 'years' : mode === 'month' ? 'year' : 'month';
  const selected = value ? parse(value) : undefined;

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <button type="button" className={styles.label} aria-live="polite" aria-label={`${label}, switch to ${mode === 'year' ? 'calendar' : 'year'} view`} onClick={toggleYears}>
          {label}
          <span className={styles.caret} data-open={mode === 'year' || undefined}><Icon name="chevronDown" size={16} /></span>
        </button>
        <span className={styles.nav}>
          <button type="button" className={styles.navBtn} aria-label={`Previous ${what}`} onClick={() => step(-1)}><Icon name="back" size={18} /></button>
          <button type="button" className={styles.navBtn} aria-label={`Next ${what}`} onClick={() => step(1)}><Icon name="chevron" size={18} /></button>
        </span>
      </div>
      {mode === 'year' && (
        <div className={styles.picks} role="grid" aria-label="Years">
          {Array.from({ length: YEARS_PER_PAGE }, (_, i) => page + i).map((y) => (
            <button key={y} type="button" role="gridcell" className={styles.pick} disabled={y < minY || y > maxY}
              data-selected={selected?.y === y || undefined} data-today={Number(today.slice(0, 4)) === y || undefined} aria-selected={selected?.y === y}
              onClick={() => { setView((v) => ({ ...v, y })); setMode('month'); }}>
              {y}
            </button>
          ))}
        </div>
      )}
      {mode === 'month' && (
        <div className={cx(styles.picks, styles.months)} role="grid" aria-label={`Months of ${view.y}`}>
          {MONTHS.map((name, m) => (
            <button key={name} type="button" role="gridcell" className={styles.pick}
              disabled={out(key(view.y, m, 1)) && out(key(view.y, m, new Date(view.y, m + 1, 0).getDate()))}
              data-selected={(selected?.y === view.y && selected.m === m) || undefined} aria-selected={selected?.y === view.y && selected?.m === m}
              onClick={() => { setView({ y: view.y, m }); setMode('day'); }}>
              {name}
            </button>
          ))}
        </div>
      )}
      {mode === 'day' && (
        <div className={styles.grid} role="grid" aria-label={label}>
          {WEEKDAYS.map((w, i) => <span key={i} className={styles.weekday} aria-hidden>{w}</span>)}
          {cells.map((c) => (
            <button
              key={c.k}
              type="button"
              role="gridcell"
              className={cx(styles.day, !c.inMonth && styles.outside)}
              data-selected={c.k === value || undefined}
              data-today={c.k === today || undefined}
              aria-selected={c.k === value}
              aria-label={c.k}
              disabled={out(c.k)}
              onClick={() => onChange(c.k)}
            >
              {c.day}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
