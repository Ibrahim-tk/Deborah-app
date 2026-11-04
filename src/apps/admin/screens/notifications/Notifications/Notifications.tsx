/**
 * @screen  A-12.1 · Notifications
 * @flow    A12 Notifications (admin and super admin; super admins also see billing, team, security, compliance)
 * @states  all · unread · by category · empty (caught up / nothing in this category)
 * @spec    docs/admin/README.md#a-121-notifications
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import {
  CATEGORIES, NOTIFICATION_ORDER, dayBucket, useAdminNotifications, useAdminStore, visibleFor, type NotificationCategory,
} from '@shared/admin';
import { Button, IconButton, Menu, Segmented, Select } from '@admin/ui';
import { AdminPage, NotificationRow } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import styles from './Notifications.module.css';

type Show = 'all' | 'unread';

export default function Notifications() {
  const role = useAdminStore((s) => s.role);
  const all = useAdminNotifications((s) => s.items);
  const { openTarget } = useAdminNav.getState();
  const [show, setShow] = useState<Show>('all');
  const [category, setCategory] = useState<'any' | NotificationCategory>('any');

  const mine = visibleFor(all, role);
  const unread = mine.filter((n) => !n.read).length;
  const rows = mine.filter((n) => (show === 'all' || !n.read) && (category === 'any' || n.category === category));
  const cats = NOTIFICATION_ORDER.filter((c) => role === 'super' || !CATEGORIES[c].superOnly);
  const store = useAdminNotifications.getState();

  return (
    <AdminPage
      title="Notifications"
      subtitle={unread ? `${unread} unread` : "You're all caught up."}
      action={
        <>
          <Button variant="ghost" onClick={() => useAdminNav.getState().openSettings('notifications')}>Preferences</Button>
          <Button variant="secondary" disabled={!unread} onClick={() => store.markAllRead(role)}>Mark all as read</Button>
        </>
      }
      toolbar={
        <div className={styles.toolbar}>
          <Segmented<Show> label="Show" value={show} onChange={setShow} options={[{ value: 'all', label: 'All' }, { value: 'unread', label: `Unread${unread ? ` (${unread})` : ''}` }]} />
          <Select<'any' | NotificationCategory>
            label="Category"
            hideLabel
            value={category}
            onChange={setCategory}
            options={[{ value: 'any', label: 'All categories' }, ...cats.map((c) => ({ value: c, label: CATEGORIES[c].label }))]}
          />
        </div>
      }
    >
      {rows.length === 0 ? (
        <p className={styles.empty}>{show === 'unread' ? 'No unread notifications.' : 'Nothing here yet.'}</p>
      ) : (
        <div className={styles.feed}>
          {rows.map((n, i) => (
            <div key={n.id}>
              {(i === 0 || dayBucket(rows[i - 1].at) !== dayBucket(n.at)) && <h2 className={styles.bucket}>{dayBucket(n.at)}</h2>}
              <NotificationRow
                item={n}
                onOpen={() => { store.markRead(n.id); openTarget(n.target); }}
                trailing={
                  <Menu
                    side="bottom"
                    align="end"
                    onSelect={(id) => (id === 'open' ? (store.markRead(n.id), openTarget(n.target)) : id === 'read' ? store.markRead(n.id) : store.markUnread(n.id))}
                    items={[{ id: 'open', label: 'Open' }, n.read ? { id: 'unread', label: 'Mark as unread' } : { id: 'read', label: 'Mark as read' }]}
                    trigger={<IconButton icon="more" size="sm" label={`Actions for ${n.title}`} />}
                  />
                }
              />
            </div>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
