/**
 * @screen  M-10.6 · Notifications (inbox)
 * @flow    F10 Account, privacy & data
 * @states  empty · unread / read · notifications off (banner to settings)
 * @figma   NOT IN WIREFRAMES — Miro "Notification & Reminders" (2026-10-20)
 * @spec    OPEN: add to docs/ux/F10-account-privacy.md
 * @xref    mobile: apps/mobile/screens/account/NotificationInbox (web: DerivedPage shell, 2026-10-28)
 *
 * What has arrived, newest first, each with its type. Tapping opens where it points; the gear opens
 * notification settings (M-10.4), a separate page.
 */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@shared/store';
import type { AppNotification, NotificationType } from '@shared/types/domain';
import { nowFrom } from '@shared/utils';
import { Icon, IconButton, IconWell, type IconName } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { useNav, useNavStore } from '@web/navigation';
import styles from './NotificationInbox.module.css';

const TYPE: Record<NotificationType, { label: string; icon: IconName }> = {
  followup: { label: 'Follow-up', icon: 'chat' },
  inactivity: { label: 'Reminder', icon: 'bell' },
  plan: { label: 'Wellness Plan', icon: 'calendar' },
  critical: { label: 'Important', icon: 'alert' },
  reconsent: { label: 'Policy update', icon: 'file' },
  booking: { label: 'Booking', icon: 'calendar' },
};

function ago(iso: string, now: Date): string {
  const mins = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

export default function NotificationInbox() {
  const { push } = useNav();
  const openDeepLink = useNavStore((s) => s.openDeepLink);
  const queue = useAppStore((s) => s.notifications.queue);
  const off = useAppStore((s) => s.notifications.enabled === false || s.notificationPermission === 'denied');
  const clock = useAppStore(useShallow((s) => ({ simulatedNow: s.simulatedNow, clockAnchor: s.clockAnchor })));
  const now = nowFrom(clock);
  const items = queue.filter((n) => n.delivered).sort((a, b) => b.deliverAt.localeCompare(a.deliverAt));

  const open = (n: AppNotification) => {
    useAppStore.getState().markRead(n.id);
    if (n.deepLink === 'terms') return push('M-10.5');
    openDeepLink(n.deepLink);
  };

  return (
    <DerivedPage
      title="Notifications"
      trailing={<IconButton icon="settings" label="Notification settings" onClick={() => push('M-10.4')} />}
      composerPlaceholder="Ask the Oracle about a reminder…"
    >
      <div className={styles.body} data-xref="M-10.6 · Notifications">
        {off && (
          <button type="button" className={styles.offBanner} onClick={() => push('M-10.4')}>
            <Icon name="bell" size={18} /> Notifications are off. Only important ones come through.
          </button>
        )}
        {items.length === 0 ? (
          // Centred empty state, no container (designer, 2026-10-28).
          <div className={styles.empty}>
            <IconWell icon="bell" size={28} tint="lilac" className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>You’re all caught up</p>
            <p className={styles.emptyText}>Reminders and follow-ups from the Oracle will show here.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {items.map((n) => {
              const t = TYPE[n.type ?? 'followup'];
              return (
                <li key={n.id}>
                  <button type="button" className={styles.row} data-unread={!n.read || undefined} aria-label={n.read ? undefined : `Unread: ${n.title}`} onClick={() => open(n)}>
                    <span className={styles.icon} data-type={n.type} aria-hidden><Icon name={t.icon} size={18} /></span>
                    <span className={styles.text}>
                      <span className={styles.meta}><span>{t.label}</span><span>{ago(n.deliverAt, now)}</span></span>
                      <span className={styles.title}>{n.title}</span>
                      <span className={styles.body2}>{n.body}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DerivedPage>
  );
}
