/**
 * @pattern ScaleCheck — "how much, from 0 to 10", compact (design direction 2026-10-14): one header row
 *          with the question and the value, a slim filled track with end labels, and a small Done.
 *          Afterwards it stays as a one-line record of the value.
 * @usedBy  widget lab (/wid)
 */
import { useState, type CSSProperties } from 'react';
import { Button, Icon } from '@mobile/ui';
import styles from './ScaleCheck.module.css';

export interface ScaleCheckProps {
  title: string;
  low: string;
  high: string;
  initial?: number;
  onDone: (value: number) => void;
}

const MAX = 10;

export function ScaleCheck({ title, low, high, initial = 5, onDone }: ScaleCheckProps) {
  const [value, setValue] = useState(initial);
  const [done, setDone] = useState(false);
  if (done) return <p className={styles.done}><Icon name="check" size={16} /> {title}: {value} of {MAX}</p>;
  return (
    <section className={styles.root} aria-label={title}>
      <div className={styles.head}>
        <p className={styles.title}>{title}</p>
        <p className={styles.value} aria-hidden><span className={styles.number}>{value}</span> / {MAX}</p>
      </div>
      <input
        type="range"
        min={0}
        max={MAX}
        step={1}
        value={value}
        aria-label={title}
        aria-valuetext={`${value} of ${MAX}`}
        className={styles.range}
        style={{ '--pos': value / MAX } as CSSProperties}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <div className={styles.ends} aria-hidden>
        <span>{low}</span>
        <span>{high}</span>
      </div>
      <Button size="md" fullWidth className={styles.doneButton} onClick={() => { setDone(true); onDone(value); }}>Done</Button>
    </section>
  );
}
