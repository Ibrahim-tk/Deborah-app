/**
 * @ui Header — iOS app bar. `large`: display title on tab roots, folding into the inline title-3
 * title when `collapsed` (the screen has scrolled). Otherwise an inline header with a centred
 * title; `onBack` shows a round glass back chevron (iOS 26). Titles wrap rather than
 * truncate at large text sizes (DESIGN.md › Text size control).
 */
import type { ReactNode } from 'react';
import { cx } from '@shared/utils';
import { GlassButton } from '../GlassButton';
import styles from './Header.module.css';

export interface HeaderProps {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  large?: boolean;
  transparent?: boolean;
  /** Back button; `backLabel` is the previous screen's title. */
  onBack?: () => void;
  backLabel?: string;
  /** Pad for the status bar (screens at the top of the phone). */
  safeTop?: boolean;
  /** Large title only: the content has scrolled, so the title moves into the bar. */
  collapsed?: boolean;
}

export function Header({ title, left, right, large, transparent, onBack, backLabel = 'Back', safeTop = true, collapsed = false }: HeaderProps) {
  // iOS 26 nav bar: a round Liquid Glass back button with only the chevron; the previous
  // title lives in the accessible name (and the button's tooltip).
  const back = onBack && <GlassButton icon="back" aria-label={`Back to ${backLabel}`} title={backLabel} onClick={onBack} />;
  const inlineTitle = title && (!large || collapsed);
  return (
    <header className={cx(styles.root, transparent && styles.transparent, safeTop && styles.safeTop)}>
      <div className={styles.bar}>
        <div className={styles.side}>{back ?? left}</div>
        {large ? (
          // Same text as the large title, so it stays out of the accessibility tree.
          <span className={styles.title} data-inline-large data-shown={inlineTitle || undefined} aria-hidden="true">
            {title}
          </span>
        ) : (
          inlineTitle && <h1 className={styles.title}>{title}</h1>
        )}
        <div className={cx(styles.side, styles.right)}>{right}</div>
      </div>
      {large && title && (
        <div className={styles.largeWrap} data-collapsed={collapsed || undefined}>
          <h1 className={styles.large}>{title}</h1>
        </div>
      )}
    </header>
  );
}
