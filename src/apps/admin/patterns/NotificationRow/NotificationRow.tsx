/** @pattern NotificationRow — a small muted icon, title with time, one line of detail. Quiet by design:
 *  unread rows read darker, read rows step back to a light tone. No dots or badges.
 *  Used by the bell panel and the Notifications page. */
import type { ReactNode } from 'react';
import { timeAgo, type AdminNotification, type NotificationCategory } from '@shared/admin';
import { Icon, type IconName } from '@admin/ui';
import styles from './NotificationRow.module.css';

const ICON: Record<NotificationCategory, IconName> = {
  support: 'support',
  gaps: 'book',
  deletion: 'delete',
  deadline: 'calendar',
  content: 'file',
  policies: 'consent',
  admins: 'admins',
};

export interface NotificationRowProps {
  item: AdminNotification;
  onOpen: () => void;
  /** Trailing control, e.g. a ⋮ menu (page view). */
  trailing?: ReactNode;
  compact?: boolean;
}

export function NotificationRow({ item, onOpen, trailing, compact }: NotificationRowProps) {
  return (
    <div className={styles.row} data-unread={!item.read || undefined} data-severity={item.severity} data-compact={compact || undefined}>
      <button type="button" className={styles.main} onClick={onOpen}>
        <span className={styles.icon} aria-hidden><Icon name={ICON[item.category] ?? 'bell'} size={16} /></span>
        <span className={styles.text}>
          <span className={styles.top}>
            <span className={styles.title}>{!item.read && <span className={styles.srOnly}>Unread: </span>}{item.title}</span>
            <span className={styles.time}>{timeAgo(item.at)}</span>
          </span>
          <span className={styles.body}>{item.body}</span>
        </span>
      </button>
      {trailing && <span className={styles.trailing}>{trailing}</span>}
    </div>
  );
}
