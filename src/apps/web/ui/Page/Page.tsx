/**
 * @ui   Page — standard screen root for routed web pages: its own scroll area that fills the main
 *       column, 32 px page padding, a centred container (reading 720 / page 1120 / full), an optional
 *       `display` title row with right-aligned actions, and 48 px between sections.
 *       Screens with a bespoke layout (e.g. W-2.1 Conversation) skip Page and fill the main column
 *       themselves (height 100%, own scroll areas).
 * @xref mobile: apps/mobile/ui/Header (large title) — no direct counterpart
 */
import type { ReactNode } from 'react';
import { cx } from '@shared/utils';
import styles from './Page.module.css';

export interface PageProps {
  /** Page title in Cormorant `display` (rendered as the page's h1). Omit for a title-less page. */
  title?: ReactNode;
  /** One `subhead` line under the title. */
  description?: ReactNode;
  /** Right side of the title row (buttons). */
  actions?: ReactNode;
  /** Above the title: a back link or breadcrumb. */
  leading?: ReactNode;
  /** reading 720 px · page 1120 px (default) · full width of the main column. */
  width?: 'reading' | 'page' | 'full';
  children: ReactNode;
  /** Stable hook for the shell's "show IDs" overlay and tests, e.g. "W-7.2". */
  screenId?: string;
  className?: string;
}

export function Page({ title, description, actions, leading, width = 'page', children, screenId, className }: PageProps) {
  return (
    <div className={styles.scroll} data-screen-id={screenId}>
      <div className={cx(styles.container, styles[width], className)}>
        {(title || actions || leading) && (
          <header className={styles.header}>
            {leading && <div className={styles.leading}>{leading}</div>}
            <div className={styles.titleRow}>
              {title && (
                <div className={styles.titles}>
                  <h1 className={styles.title}>{title}</h1>
                  {description && <p className={styles.description}>{description}</p>}
                </div>
              )}
              {actions && <div className={styles.actions}>{actions}</div>}
            </div>
          </header>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
