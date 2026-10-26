/** @ui Checkbox — 22 pt box, whole row tappable; label may contain links (they stop propagation). */
import { useId, type ReactNode } from 'react';
import { Icon } from '../Icon';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  /** Medium-weight label, for choices that must stand out from the copy around them (e.g. consent). */
  emphasis?: boolean;
  /** Compact rows (e.g. in-chat review card): 14 pt box, subhead label. */
  size?: 'md' | 'sm';
  /** Circular check, matching the option tiles and chat checklist (design 2026-10-26). */
  round?: boolean;
}

export function Checkbox({ checked, onChange, label, description, emphasis, size = 'md', round }: CheckboxProps) {
  const id = useId();
  return (
    <div className={styles.root} data-size={size} data-round={round || undefined}>
      <input id={id} type="checkbox" className={styles.input} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id} className={styles.row}>
        <span className={styles.box} data-checked={checked} aria-hidden="true">
          {checked && <Icon name="check" size={size === 'sm' ? 10 : 15} strokeWidth={2.25} />}
        </span>
        <span className={styles.text}>
          <span className={styles.label} data-emphasis={emphasis || undefined}>{label}</span>
          {description && <span className={styles.description}>{description}</span>}
        </span>
      </label>
    </div>
  );
}
