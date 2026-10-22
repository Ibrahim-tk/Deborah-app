/**
 * @ui OptionWheel — same iOS-style faded drum as YearWheel, for string options (e.g. phone country codes).
 * Shares YearWheel visuals: selection band, soft fade, center zoom, snap scroll; cinematic tilt opt-in.
 */
import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { cx } from '@shared/utils';
import styles from '../YearWheel/YearWheel.module.css';

export interface OptionWheelOption {
  value: string;
  /** Visible row content (flag + code, etc.). */
  label: ReactNode;
  /** Spoken value for the slider; defaults to `value`. */
  spoken?: string;
}

export interface OptionWheelProps {
  options: OptionWheelOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  /** Opt-in 3D drum (same as YearWheel `cinematic`). */
  cinematic?: boolean;
}

const ITEM_CLEAN = 40;
const ITEM_CINEMA = 44;

export function OptionWheel({ options, value, onChange, label, cinematic = false }: OptionWheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<number>();
  const frame = useRef<number>();
  const item = cinematic ? ITEM_CINEMA : ITEM_CLEAN;
  const rows = 5;
  const index = Math.max(0, options.findIndex((o) => o.value === value));

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
    const top = index * item;
    if (Math.abs(el.scrollTop - top) > 2) el.scrollTo({ top });
    paint();
  }, [index, item, paint]);
  useEffect(() => () => cancelAnimationFrame(frame.current ?? 0), []);

  const onScroll = () => {
    cancelAnimationFrame(frame.current ?? 0);
    frame.current = requestAnimationFrame(paint);
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el || options.length === 0) return;
      const i = Math.min(options.length - 1, Math.max(0, Math.round(el.scrollTop / item)));
      const next = options[i]?.value;
      if (next && next !== value) onChange(next);
    }, 90);
  };

  const step = (d: number) => {
    const i = Math.min(options.length - 1, Math.max(0, index + d));
    const next = options[i]?.value;
    if (next) onChange(next);
  };

  const current = options[index];

  return (
    <div className={cx(styles.root, cinematic && styles.cinematic)} style={{ '--rows': rows } as CSSProperties}>
      <span className={styles.band} aria-hidden />
      <div
        ref={ref}
        className={styles.wheel}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={Math.max(0, options.length - 1)}
        aria-valuenow={index}
        aria-valuetext={current?.spoken ?? current?.value ?? ''}
        onScroll={onScroll}
        onKeyDown={(e) => {
          const d = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1, PageUp: -3, PageDown: 3 }[e.key];
          if (d) {
            e.preventDefault();
            step(d);
          }
        }}
      >
        <div className={styles.pad} />
        {options.map((o, i) => (
          <button
            key={o.value}
            type="button"
            tabIndex={-1}
            className={styles.item}
            data-i={i}
            data-on={o.value === value || undefined}
            onClick={() => onChange(o.value)}
          >
            <span className={styles.year}>{o.label}</span>
          </button>
        ))}
        <div className={styles.pad} />
      </div>
    </div>
  );
}
