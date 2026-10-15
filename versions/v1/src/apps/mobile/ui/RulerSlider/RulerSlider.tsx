/**
 * @ui RulerSlider — horizontal ruler for height / weight: drag or scroll the ticks under a fixed
 * centre marker. Values are stored in metric; `format` renders the chosen unit. Works as an ARIA
 * slider (arrow keys step one unit, Page keys ten).
 */
import { useEffect, useRef } from 'react';
import styles from './RulerSlider.module.css';

export interface RulerSliderProps {
  value: number;
  min: number;
  max: number;
  /** Visible step between ticks, in the stored unit. */
  step?: number;
  onChange: (value: number) => void;
  label: string;
  format: (value: number) => string;
}

const GAP = 10; // px between ticks

export function RulerSlider({ value, min, max, step = 1, onChange, label, format }: RulerSliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const count = Math.round((max - min) / step);
  const settle = useRef<number>();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const left = ((value - min) / step) * GAP;
    if (Math.abs(el.scrollLeft - left) > 2) el.scrollTo({ left });
  }, [value, min, step]);

  const onScroll = () => {
    window.clearTimeout(settle.current);
    const el = ref.current;
    if (!el) return;
    // Live value while scrolling; snap settles it.
    const v = Math.min(max, Math.max(min, min + Math.round(el.scrollLeft / GAP) * step));
    settle.current = window.setTimeout(() => v !== value && onChange(v), 60);
  };

  const nudge = (d: number) => onChange(Math.min(max, Math.max(min, value + d * step)));

  return (
    <div className={styles.root}>
      <p className={styles.value} aria-hidden>{format(value)}</p>
      <div className={styles.track}>
        <span className={styles.marker} aria-hidden />
        <div
          ref={ref}
          className={styles.ruler}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={format(value)}
          onScroll={onScroll}
          onKeyDown={(e) => {
            const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[e.key];
            if (d) {
              e.preventDefault();
              nudge(d);
            }
          }}
        >
          <div className={styles.ticks}>
            {Array.from({ length: count + 1 }, (_, i) => (
              <span key={i} className={styles.tick} data-major={(min / step + i) % 10 === 0 || undefined} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
