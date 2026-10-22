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
  /** Highlight for master–detail list selection (desktop). */
  selected?: boolean;
  /** `compact`: 48 pt, regular-weight callout title in body ink — for dense settings lists. */
  density?: 'default' | 'compact';
}

export function ListRow({ title, subtitle, leading, trailing = 'chevron', value, destructive, onPress, selected = false, density = 'default' }: ListRowProps) {
  const content = (
    <>
      {leading && <span className={styles.leading}>{leading}</span>}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
      {value && <span className={styles.value}>{value}</span>}
      {trailing === 'chevron' ? onPress && <Icon name="chevron" size={density === 'compact' ? 18 : 20} className={styles.chevron} /> : trailing}
    </>
  );
  const cls = cx(styles.root, density === 'compact' && styles.compact, destructive && styles.destructive, selected && styles.selected);
  const selectedAttr = selected || undefined;
  return onPress ? (
    <button type="button" className={cls} onClick={onPress} aria-current={selectedAttr ? 'true' : undefined} data-selected={selectedAttr}>
      {content}
    </button>
  ) : (
    <div className={cls} data-selected={selectedAttr}>{content}</div>
  );
}
