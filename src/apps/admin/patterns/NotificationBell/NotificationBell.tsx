/** @pattern NotificationBell — bell with an unread dot; opens a panel of the latest notifications.
 *  Rows open their record; footer goes to the full page or to preferences. */
import { useState } from 'react';
import { dayBucket, useAdminNotifications, useAdminStore, visibleFor } from '@shared/admin';
import { IconButton, Popover } from '@admin/ui';
import { useAdminNav } from '@admin/navigation';
import { NotificationRow } from '../NotificationRow';
import styles from './NotificationBell.module.css';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const role = useAdminStore((s) => s.role);
  const all = useAdminNotifications((s) => s.items);
  const items = visibleFor(all, role);
  const unread = items.filter((n) => !n.read).length;
  const latest = items.slice(0, 8);
  const { openTarget, go } = useAdminNav.getState();

  const leave = (fn: () => void) => { setOpen(false); fn(); };

  return (
    <span className={styles.trigger}>
    <Popover
      open={open}
      onOpenChange={setOpen}
      label="Notifications"
      trigger={<IconButton icon="bell" label={unread ? `Notifications, ${unread} unread` : 'Notifications'} />}
    >
      <div className={styles.head}>
        <span className={styles.title}>Notifications</span>
        {unread > 0 && (
          <button type="button" className={styles.link} onClick={() => useAdminNotifications.getState().markAllRead(role)}>Mark all as read</button>
        )}
      </div>
      <div className={styles.list}>
        {latest.length === 0 ? (
          <p className={styles.empty}>You're all caught up.</p>
        ) : (
          latest.map((n, i) => (
            <div key={n.id}>
              {(i === 0 || dayBucket(latest[i - 1].at) !== dayBucket(n.at)) && <p className={styles.bucket}>{dayBucket(n.at) === 'Today' ? 'Today' : 'Earlier'}</p>}
              <NotificationRow
                compact
                item={n}
                onOpen={() => leave(() => { useAdminNotifications.getState().markRead(n.id); openTarget(n.target); })}
              />
            </div>
          ))
        )}
      </div>
      <div className={styles.foot}>
        <button type="button" className={styles.link} onClick={() => leave(() => go('notifications'))}>View all</button>
        <button type="button" className={styles.link} onClick={() => leave(() => useAdminNav.getState().openSettings('notifications'))}>Preferences</button>
      </div>
    </Popover>
    {unread > 0 && <span className={styles.dot} aria-hidden />}
    </span>
  );
}
