/**
 * @pattern SlotPicker — pick a day, then tap a time, right in the chat. Calm by design (2026-10-14): quiet
 *          day tiles, time pills, no extra button; the confirm step that follows is the safety check.
 * @usedBy  widget lab (/wid)
 */
import { useState } from 'react';
import { Icon } from '@web/ui';
import { InlineChoicePills } from '../InlineChoicePills';
import styles from './SlotPicker.module.css';

export interface SlotPickerProps {
  title: string;
  /** Short context under the title, e.g. "30 min · Video". */
  meta?: string;
  /** `label` is "Thu 16": weekday then date. */
  days: { value: string; label: string; times: string[] }[];
  onPick: (day: string, time: string) => void;
  /**
   * Day picker exploration (2026-10-14), compared in /wid:
   * `slider` (default, chosen 2026-10-14) · `tiles` equal tiles, chosen = plum · `tint` text days, chosen = lilac tint · `underline` text days with
   * a plum bar under the chosen one · `slider` a scrolling two-week strip (days without openings dimmed).
   */
  dayStyle?: 'tiles' | 'tint' | 'underline' | 'slider';
}

export function SlotPicker({ title, meta, days, onPick, dayStyle = 'slider' }: SlotPickerProps) {
  const [day, setDay] = useState(days.find((d) => d.times.length)?.value ?? '');
  const [picked, setPicked] = useState<string>();
  const current = days.find((d) => d.value === day);

  if (picked) return <p className={styles.done}><Icon name="calendar" size={16} /> {current?.label}, {picked}</p>;
  return (
    <section className={styles.root} data-day-style={dayStyle} aria-label={title}>
      <div>
        <p className={styles.title}>{title}</p>
        {meta && <p className={styles.meta}>{meta}</p>}
      </div>
      <div className={styles.days} role="radiogroup" aria-label="Day">
        {days.map((d) => {
          const [weekday, date] = d.label.split(' ');
          return (
            <button key={d.value} type="button" role="radio" aria-checked={d.value === day} disabled={!d.times.length} className={styles.day} onClick={() => setDay(d.value)}>
              <span className={styles.weekday}>{weekday}</span>
              <span className={styles.date}>{date}</span>
            </button>
          );
        })}
      </div>
      <InlineChoicePills key={day} label="Time" options={current?.times ?? []} onPick={(time) => { setPicked(time); onPick(current?.label ?? day, time); }} />
    </section>
  );
}
