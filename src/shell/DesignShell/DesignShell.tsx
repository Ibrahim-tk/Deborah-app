/**
 * @shell DesignShell — public, full-screen design pages with no prototype top nav:
 * /design-system (mobile), /design-system/web (desktop), /design-md. Under /internal the same pages
 * render inside Shell with the nav.
 */
import DesignSystemApp from '@mobile/DesignSystemApp';
import DesignMdApp from '@mobile/DesignMdApp';
import WebDesignSystemApp from '@web/DesignSystemApp';
import styles from './DesignShell.module.css';

export interface DesignShellProps {
  page: 'design-system' | 'design-system-web' | 'design-md';
}

export function DesignShell({ page }: DesignShellProps) {
  return (
    <div className={styles.root}>
      {page === 'design-system' ? <DesignSystemApp /> : page === 'design-system-web' ? <WebDesignSystemApp /> : <DesignMdApp />}
    </div>
  );
}
