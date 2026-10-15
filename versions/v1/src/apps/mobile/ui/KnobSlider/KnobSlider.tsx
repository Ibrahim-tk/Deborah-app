/**
 * @ui KnobSlider — a large value read-out above a slim pill track with one plain floating knob
 * over a faint ruler that fades at both ends. Drag the knob or use the keyboard (native range
 * input, so arrow / Page / Home / End all work).
 */
import type { CSSProperties } from 'react';
import styles from './KnobSlider.module.css';

export interface KnobSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}

export function KnobSlider({ value, min, max, onChange, label }: KnobSliderProps) {
  const pos = (value - min) / (max - min);
  return (
    <div className={styles.root}>
      <output className={styles.value} aria-hidden>{value}</output>
      <div className={styles.track} style={{ '--pos': pos } as CSSProperties}>
        <span className={styles.ruler} aria-hidden />
        <input
          type="range"
          className={styles.input}
          min={min}
          max={max}
          step={1}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className={styles.knob} aria-hidden />
      </div>
    </div>
  );
}
