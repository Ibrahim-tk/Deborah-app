/**
 * @ui DeborahBlob (alias OracleAvatar) — the Oracle's presence: the tree-of-life mark, no portrait.
 * Oct 27 session: Deborah's name and photo are removed from every screen; the tree labels every response.
 * Sizes in use: 160 hero, 40 chat avatar, 24 chat bar.
 */
// OPEN: "Use the tree icon (the little original version of Maaz's tree)" — using /images/splash/tree-of-life.svg until the exact asset is confirmed.
import type { CSSProperties } from 'react';
import { cx } from '@shared/utils';
import styles from './DeborahBlob.module.css';

const TREE = '/images/splash/tree-of-life.svg';

export interface DeborahBlobProps {
  size?: number;
  label?: string;
  className?: string;
}

export function DeborahBlob({ size = 40, label, className }: DeborahBlobProps) {
  return (
    <span
      className={cx(styles.root, className)}
      style={{ '--blob-size': `${size}px` } as CSSProperties}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <img src={TREE} alt="" className={styles.tree} />
    </span>
  );
}

export const OracleAvatar = DeborahBlob;
