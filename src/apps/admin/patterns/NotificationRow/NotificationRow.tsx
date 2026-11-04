/** @pattern NotificationRow — a quiet row: unread dot, title with time, one line of detail.
 *  Emergencies use a red dot. Used by the bell panel and the Notifications page. */
import type { ReactNode } from 'react';
import { timeAgo, type AdminNotification } from '@shared/admin';
import styles from './NotificationRow.module.css';

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
        <span className={styles.dot} aria-label={item.read ? undefined : 'Unread'} />
        <span className={styles.text}>
          <span className={styles.top}>
            <span className={styles.title}>{item.title}</span>
            <span className={styles.time}>{timeAgo(item.at)}</span>
          </span>
          <span className={styles.body}>{item.body}</span>
        </span>
      </button>
      {trailing && <span className={styles.trailing}>{trailing}</span>}
    </div>
  );
}
