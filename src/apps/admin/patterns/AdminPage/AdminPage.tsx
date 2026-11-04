/**
 * @pattern AdminPage — derived from web DerivedPage: Back (on detail pages), serif title with one
 *          primary action at the trailing edge, an optional toolbar row, then the body. No eyebrows.
 */
import type { ReactNode } from 'react';
import { Button, Icon } from '@admin/ui';
import { useAdminNav } from '@admin/navigation';
import { NotificationBell } from '../NotificationBell';
import styles from './AdminPage.module.css';

export interface AdminPageProps {
  title: string;
  /** Plain supporting line under the title (e.g. an email or a date). */
  subtitle?: ReactNode;
  action?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  /** Narrow trailing column for status and actions (detail pages). */
  aside?: ReactNode;
  /** Trail for pages reached from inside a section (e.g. Settings › Compliance); replaces Back. */
  crumbs?: { label: string; onClick?: () => void }[];
}

export function AdminPage({ title, subtitle, action, toolbar, children, aside, crumbs }: AdminPageProps) {
  const canBack = useAdminNav((s) => s.stack.length > 1);
  const pop = useAdminNav((s) => s.pop);
  return (
    <div className={styles.root}>
      {crumbs ? (
        <nav aria-label="Breadcrumb" className={styles.crumbs}>
          <ol>
            {crumbs.map((c, i) => (
              <li key={c.label}>
                {c.onClick ? <button type="button" onClick={c.onClick}>{c.label}</button> : <span aria-current="page">{c.label}</span>}
                {i < crumbs.length - 1 && <Icon name="chevron" size={14} className={styles.sep} />}
              </li>
            ))}
          </ol>
        </nav>
      ) : canBack && (
        <div className={styles.back}>
          <Button variant="ghost" size="sm" leadingIcon="back" onClick={pop}>Back</Button>
        </div>
      )}
      <header className={styles.head}>
        <div className={styles.titles}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div className={styles.trail}>
          {action && <div className={styles.action}>{action}</div>}
          {/* Same spot on every page; the phone top bar carries its own bell. */}
          <span className={styles.bell}><NotificationBell /></span>
        </div>
      </header>
      {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
      <div className={styles.body} data-aside={aside ? '' : undefined}>
        <div className={styles.main}>{children}</div>
        {aside && <aside className={styles.aside}>{aside}</aside>}
      </div>
    </div>
  );
}
