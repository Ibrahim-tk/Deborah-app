/**
 * @ui   Card — Paper on Parchment, lg radius, hairline, no shadow (it scrolls, so it's flat).
 *       Interactive when `onPress` (button) or `href` (link; `onPress` intercepts plain clicks for
 *       client-side routing). Hover: hairline → control border.
 * @xref mobile: apps/mobile/ui/Card
 */
import type { MouseEvent, ReactNode } from 'react';
import { cx } from '@shared/utils';
import styles from './Card.module.css';

export interface CardProps {
  children: ReactNode;
  tone?: 'default' | 'subtle' | 'emphasis' | 'danger';
  /** Renders as a button (or intercepts the link click when `href` is set). */
  onPress?: () => void;
  /** Renders as a link (keeps open-in-new-tab and link semantics). */
  href?: string;
  /** Accessible name when the card's text alone is unclear. */
  label?: string;
  padding?: 'md' | 'lg';
  className?: string;
}

const isPlainClick = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

export function Card({ children, tone = 'default', onPress, href, label, padding = 'md', className }: CardProps) {
  const interactive = Boolean(onPress || href);
  const cls = cx(styles.root, styles[tone], styles[padding], interactive && styles.interactive, className);
  if (href) {
    return (
      <a
        href={href}
        aria-label={label}
        className={cls}
        onClick={(e) => {
          if (onPress && isPlainClick(e)) {
            e.preventDefault();
            onPress();
          }
        }}
      >
        {children}
      </a>
    );
  }
  if (onPress) {
    return (
      <button type="button" aria-label={label} className={cls} onClick={onPress}>
        {children}
      </button>
    );
  }
  return <div className={cls}>{children}</div>;
}
