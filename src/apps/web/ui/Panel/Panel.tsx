/** @ui Panel — quiet tonal panel; no border, no side stripe. Semantic tones always carry an icon + words. @xref mobile: apps/mobile/ui/Panel */
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
  /** ARIA role, e.g. "status" or "alert" for messages that appear dynamically. */
  role?: string;
  className?: string;
}

export function Panel({ children, tone = 'linen', icon, goldRule, role, className }: PanelProps) {
  return (
    <div role={role} className={cx(styles.root, styles[tone], goldRule && styles.goldRule, className)}>
      {icon && <Icon name={icon} size={22} className={styles.icon} />}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
