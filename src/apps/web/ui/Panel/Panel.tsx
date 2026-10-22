/** @ui Panel — quiet tonal panel; no border, no side stripe. Every semantic tone carries an icon + words. */
import type { ReactNode } from 'react';
import { cx } from '@shared/utils';
import { Icon, type IconName } from '../Icon';
import styles from './Panel.module.css';

export interface PanelProps {
  children: ReactNode;
  tone?: 'linen' | 'lilac' | 'danger' | 'success' | 'warning';
  icon?: IconName;
  /** 2 px Signature Gold rule on top (A Word from Deborah). */
  goldRule?: boolean;
  className?: string;
}

export function Panel({ children, tone = 'linen', icon, goldRule, className }: PanelProps) {
  return (
    <div className={cx(styles.root, styles[tone], goldRule && styles.goldRule, className)}>
      {icon && <Icon name={icon} size={22} className={styles.icon} />}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
