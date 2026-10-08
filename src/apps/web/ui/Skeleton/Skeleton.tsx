/** @ui Skeleton — static Linen block (no shimmer). @xref mobile: apps/mobile/ui/Skeleton */
import type { CSSProperties } from 'react';
import { cx } from '@shared/utils';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  height?: number;
  width?: string | number;
  radius?: 'md' | 'lg' | 'full';
  className?: string;
}

export function Skeleton({ height = 20, width = '100%', radius = 'md', className }: SkeletonProps) {
  return (
    <span
      className={cx(styles.root, styles[radius], className)}
      style={{ '--sk-h': `${height}px`, '--sk-w': typeof width === 'number' ? `${width}px` : width } as CSSProperties}
      aria-hidden="true"
    />
  );
}
