/** @shell BrowserFrame — desktop browser chrome around WebApp (docs/03-prototype-shell.md §5). */
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './BrowserFrame.module.css';

export interface BrowserFrameProps {
  children: ReactNode;
}

export function BrowserFrame({ children }: BrowserFrameProps) {
  const route = useLocation().pathname.replace(/^\/web\/?/, '');
  return (
    <div className={styles.root}>
      <div className={styles.window}>
        <div className={styles.chrome}>
          <span className={styles.lights} aria-hidden="true">
            <i /><i /><i />
          </span>
          <span className={styles.url}>app.oracleclinician.com/{route}</span>
        </div>
        <div className={styles.viewport}>{children}</div>
      </div>
    </div>
  );
}
