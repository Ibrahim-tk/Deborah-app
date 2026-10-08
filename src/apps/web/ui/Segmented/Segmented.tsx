/**
 * @ui   Segmented — Linen track, selected segment Paper with hairline and medium text. Tab semantics with
 *       arrow-key / Home / End navigation (roving tabindex). Also the web's "tabs" (e.g. W-9.1 segments).
 * @xref mobile: apps/mobile/ui/Segmented
 */
import { useRef, type KeyboardEvent } from 'react';
import { cx } from '@shared/utils';
import styles from './Segmented.module.css';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the group. */
  label: string;
  /** Stretch segments to the container width. */
  fullWidth?: boolean;
  className?: string;
}

export function Segmented<T extends string>({ options, value, onChange, label, fullWidth, className }: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = options.findIndex((o) => o.value === value);
    const last = options.length - 1;
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const target = (next + options.length) % options.length;
    onChange(options[target].value);
    refs.current[target]?.focus();
  };

  return (
    <div className={cx(styles.root, fullWidth && styles.fullWidth, className)} role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={styles.segment}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
