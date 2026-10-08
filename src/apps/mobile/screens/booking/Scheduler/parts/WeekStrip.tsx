/** Private part of M-8.3: seven rounded-rect day cells (DESIGN.md › Option rows, grid of cells — never pills). */
import { cx, dayKey } from '@shared/utils';
import styles from './WeekStrip.module.css';

export interface WeekStripProps {
  days: Date[];
  selected: string;
  onSelect: (key: string) => void;
}

export function WeekStrip({ days, selected, onSelect }: WeekStripProps) {
  return (
    <div className={styles.root} role="radiogroup" aria-label="Day">
      {days.map((d) => {
        const key = dayKey(d);
        const on = key === selected;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            className={cx(styles.day, on && styles.selected)}
            onClick={() => onSelect(key)}
          >
            <span className={styles.weekday}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span className={styles.date}>{d.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
}
