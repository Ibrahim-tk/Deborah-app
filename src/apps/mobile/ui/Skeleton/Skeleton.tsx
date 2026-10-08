/** @ui Skeleton — static Linen block (no shimmer). */
import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

export function Skeleton({ height = 20, width = '100%' }: { height?: number; width?: string | number }) {
  return <span className={styles.root} style={{ '--sk-h': `${height}px`, '--sk-w': typeof width === 'number' ? `${width}px` : width } as CSSProperties} aria-hidden="true" />;
}
