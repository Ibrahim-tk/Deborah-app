/** @ui Sheet — bottom sheet surface: Paper, xl top corners, grabber, optional title. Motion is the navigator's. */
import type { ReactNode } from 'react';
import { cx } from '@shared/utils';
import styles from './Sheet.module.css';

export interface SheetProps {
  title?: string;
  children: ReactNode;
  /** Footer pinned below the scrolling content (primary actions). */
  footer?: ReactNode;
  detent?: 'medium' | 'large';
  className?: string;
}

export function Sheet({ title, children, footer, detent = 'medium', className }: SheetProps) {
  return (
    <div className={cx(styles.root, className)} data-detent={detent}>
      <span className={styles.grabber} aria-hidden="true" />
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.content}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
