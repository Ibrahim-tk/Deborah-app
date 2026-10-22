/**
 * @ui ChoiceGroup — a row of compact one-tap choices (sex at birth, None / Yes add, suggestions).
 * Rounded rectangles on the control border, not pills (DESIGN.md bans pills and chips).
 * Single-select is a radiogroup; multi-select buttons are toggles. 44 pt minimum height.
 */
import { cx } from '@shared/utils';
import styles from './ChoiceGroup.module.css';

export interface Choice<T extends string> {
  value: T;
  label: string;
  /** Visually primary (e.g. "None" on the medication gate). */
  primary?: boolean;
}

export interface ChoiceGroupProps<T extends string> {
  label: string;
  choices: Choice<T>[];
  value?: T | T[];
  onChange: (value: T) => void;
  multi?: boolean;
  /** Fill the row evenly instead of wrapping. */
  fill?: boolean;
  className?: string;
}

export function ChoiceGroup<T extends string>({ label, choices, value, onChange, multi, fill, className }: ChoiceGroupProps<T>) {
  const on = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <div role={multi ? 'group' : 'radiogroup'} aria-label={label} className={cx(styles.root, fill && styles.fill, className)}>
      {choices.map((c) => (
        <button
          key={c.value}
          type="button"
          role={multi ? undefined : 'radio'}
          aria-checked={multi ? undefined : on(c.value)}
          aria-pressed={multi ? on(c.value) : undefined}
          className={cx(styles.choice, c.primary && styles.primary, on(c.value) && styles.on)}
          onClick={() => onChange(c.value)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
