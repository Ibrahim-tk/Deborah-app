/** @ui OptionList — vertical list (default) or 2-column grid of OptionRows; never a wrapping cloud. */
import type { ReactNode } from 'react';
import styles from './OptionList.module.css';

export interface OptionListProps {
  children: ReactNode;
  layout?: 'list' | 'grid2';
  label?: string;
  multi?: boolean;
}

export function OptionList({ children, layout = 'list', label, multi }: OptionListProps) {
  return (
    <div className={styles.root} data-layout={layout} role={multi ? 'group' : 'radiogroup'} aria-label={label}>
      {children}
    </div>
  );
}
