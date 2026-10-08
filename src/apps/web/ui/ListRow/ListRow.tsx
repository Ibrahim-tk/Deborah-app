/**
 * @ui   ListRow — ≥ 48 px, title `headline`, subtitle `subhead`, trailing chevron / value / custom.
 *       Interactive via `onPress` (button) or `href` (link; onPress intercepts plain clicks). Hover Linen.
 * @xref mobile: apps/mobile/ui/ListRow
 */
import type { MouseEvent, ReactNode } from 'react';
import { cx } from '@shared/utils';
import { Icon } from '../Icon';
import styles from './ListRow.module.css';

export interface ListRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  /** 'chevron' (default, shown only when interactive) · 'none' · any node (e.g. a Toggle or Button). */
  trailing?: 'chevron' | 'none' | ReactNode;
  /** Right-aligned `data` value (dates, prices, counts). */
  value?: ReactNode;
  destructive?: boolean;
  onPress?: () => void;
  href?: string;
  /** Horizontal inset: 'none' for rows inside a padded card, 'md' (16) default. */
  inset?: 'none' | 'md';
  className?: string;
}

const isPlainClick = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

export function ListRow({ title, subtitle, leading, trailing = 'chevron', value, destructive, onPress, href, inset = 'md', className }: ListRowProps) {
  const interactive = Boolean(onPress || href);
  const trailingNode =
    trailing === 'chevron' ? interactive && <Icon name="chevron" size={18} className={styles.chevron} /> : trailing === 'none' ? null : trailing;
  const content = (
    <>
      {leading && <span className={styles.leading}>{leading}</span>}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
      {value && <span className={styles.value}>{value}</span>}
      {trailingNode}
    </>
  );
  const cls = cx(styles.root, styles[`inset-${inset}`], interactive && styles.interactive, destructive && styles.destructive, className);
  if (href) {
    return (
      <a
        href={href}
        className={cls}
        onClick={(e) => {
          if (onPress && isPlainClick(e)) {
            e.preventDefault();
            onPress();
          }
        }}
      >
        {content}
      </a>
    );
  }
  if (onPress) {
    return (
      <button type="button" className={cls} onClick={onPress}>
        {content}
      </button>
    );
  }
  return <div className={cls}>{content}</div>;
}
