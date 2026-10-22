/** @ui Sheet — bottom sheet surface: Paper, xl top corners, optional title + close in one header row (no grabber,
 *  design 2026-10-20). Motion and the close action come from ui/BottomSheet. */
import { useContext, type ReactNode } from 'react';
import { cx } from '@shared/utils';
import { GlassButton } from '../GlassButton';
import { Icon } from '../Icon';
import { SheetCloseContext } from './sheetClose';
import styles from './Sheet.module.css';

export interface SheetProps {
  title?: string;
  /** Trailing header slot (e.g. “2 of 3”), same row as the serif title. */
  titleEnd?: ReactNode;
  /** Line directly under the heading, full width (the close stays on the heading row). */
  subtitle?: ReactNode;
  children: ReactNode;
  /** Footer pinned below the scrolling content (primary actions). */
  footer?: ReactNode;
  detent?: 'medium' | 'large';
  className?: string;
  /** Round iOS-glass back button at the top-left (same as the nav bar). */
  onBack?: () => void;
  backLabel?: string;
}

export function Sheet({ title, titleEnd, subtitle, children, footer, detent = 'medium', className, onBack, backLabel = 'Back' }: SheetProps) {
  const onClose = useContext(SheetCloseContext);
  return (
    <div className={cx(styles.root, className)} data-detent={detent}>
      {onBack && (
        <div className={styles.nav}>
          <GlassButton icon="back" aria-label={backLabel} title={backLabel} onClick={onBack} />
        </div>
      )}
      {(title || titleEnd || onClose) && (
        // Heading left, close right, on one row; the close centres on the heading's FIRST line.
        <div className={styles.header} data-titled={title ? true : undefined}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {titleEnd}
          {onClose && (
            <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
              <Icon name="close" size={18} />
            </button>
          )}
        </div>
      )}
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.content} data-sheet-scroll>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
