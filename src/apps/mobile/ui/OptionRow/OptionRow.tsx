/** @ui OptionRow — full-width choice row; replaces chips and pills everywhere (DESIGN.md › Option rows). */
import type { ReactNode } from 'react';
import { cx } from '@shared/utils';
import { Icon, type IconName } from '../Icon';
import styles from './OptionRow.module.css';

export interface OptionRowProps {
  children: ReactNode;
  /** Pass for choice rows (radio / checkbox semantics); omit for action rows like suggestions. */
  selected?: boolean;
  /** Multi-select rows behave as checkboxes; single rows as radios / plain buttons. */
  multi?: boolean;
  leadingIcon?: IconName;
  /** Show a trailing chevron instead of a check (navigational rows). */
  chevron?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function OptionRow({ children, selected, multi = false, leadingIcon, chevron, disabled, onSelect, className }: OptionRowProps) {
  const role = multi ? 'checkbox' : selected !== undefined ? 'radio' : undefined;
  return (
    <button
      type="button"
      role={role}
      aria-checked={role ? selected : undefined}
      disabled={disabled}
      className={cx(styles.root, selected && styles.selected, className)}
      onClick={onSelect}
    >
      {leadingIcon && <Icon name={leadingIcon} size={22} className={styles.leading} />}
      <span className={styles.label}>{children}</span>
      {chevron ? <Icon name="chevron" size={20} className={styles.trailing} /> : selected && <Icon name="check" size={22} className={styles.check} />}
    </button>
  );
}
