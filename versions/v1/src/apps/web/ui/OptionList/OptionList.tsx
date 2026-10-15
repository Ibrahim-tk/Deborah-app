/** @ui OptionList — vertical list (default) or a 2/3-column grid of OptionRows; never a wrapping cloud. @xref mobile: apps/mobile/ui/OptionList */
import type { ReactNode } from 'react';
import styles from './OptionList.module.css';

export interface OptionListProps {
  children: ReactNode;
  layout?: 'list' | 'grid2' | 'grid3';
  /** Accessible group label. */
  label?: string;
  /** checkbox group (multi) vs radio group (single). Pass `role="list"`-like action rows with `actions`. */
  multi?: boolean;
  /** Action rows (suggestions) rather than a choice set: renders a plain group. */
  actions?: boolean;
}

export function OptionList({ children, layout = 'list', label, multi, actions }: OptionListProps) {
  const role = actions || multi ? 'group' : 'radiogroup';
  return (
    <div className={styles.root} data-layout={layout} role={role} aria-label={label}>
      {children}
    </div>
  );
}
