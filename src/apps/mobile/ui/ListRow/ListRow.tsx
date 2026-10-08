/** @ui ListRow — ≥ 56 pt, title headline, subtitle subhead, trailing chevron / value / custom. */
import type { ReactNode } from 'react';
import { cx } from '@shared/utils';
import { Icon } from '../Icon';
import styles from './ListRow.module.css';

export interface ListRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: 'chevron' | ReactNode;
  value?: string;
  destructive?: boolean;
  onPress?: () => void;
}

export function ListRow({ title, subtitle, leading, trailing = 'chevron', value, destructive, onPress }: ListRowProps) {
  const content = (
    <>
      {leading && <span className={styles.leading}>{leading}</span>}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
      {value && <span className={styles.value}>{value}</span>}
      {trailing === 'chevron' ? onPress && <Icon name="chevron" size={20} className={styles.chevron} /> : trailing}
    </>
  );
  const cls = cx(styles.root, destructive && styles.destructive);
  return onPress ? <button type="button" className={cls} onClick={onPress}>{content}</button> : <div className={cls}>{content}</div>;
}
