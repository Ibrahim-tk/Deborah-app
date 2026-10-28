/**
 * @screen  M-10.6 · Notifications (inbox)
 * @flow    F10 Account, privacy & data
 * @states  empty · unread / read · notifications off (banner to settings)
 * @figma   NOT IN WIREFRAMES — Miro "Notification & Reminders" (2026-10-20)
 * @spec    OPEN: add to docs/ux/F10-account-privacy.md
 * @xref    web: W-10.6 — not built
 *
 * What has arrived, newest first, each with its type. Tapping opens where it points; the gear opens
 * notification settings (M-10.4), a separate page.
 */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@shared/store';
import type { AppNotification, NotificationType } from '@shared/types/domain';
import { nowFrom } from '@shared/utils';
import { GlassButton, Header, Icon, type IconName } from '@mobile/ui';
import { EmptyState } from '@mobile/patterns/health';
import { useNav, useNavStore, useRoute } from '@mobile/navigation';
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
  const { pop, push } = useNav();
  const { previousTitle } = useRoute();
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
    <div className={styles.root} data-xref="M-10.6 · Notifications">
      <Header
        title="Notifications"
        onBack={pop}
        backLabel={previousTitle}
        right={<GlassButton icon="settings" aria-label="Notification settings" onClick={() => push('M-10.4')} />}
      />
      <div className={styles.body}>
        {off && (
          <button type="button" className={styles.offBanner} onClick={() => push('M-10.4')}>
            <Icon name="bell" size={18} /> Notifications are off. Only important ones come through.
          </button>
        )}
        {items.length === 0 ? (
          <div className={styles.empty}><EmptyState icon="calendar" title="You’re all caught up" text="Reminders and follow-ups from the Oracle will show here." /></div>
        ) : (
          <>
            <ul className={styles.list}>
              {items.map((n) => {
                const t = TYPE[n.type ?? 'followup'];
                return (
                  <li key={n.id}>
                    <button type="button" className={styles.row} data-unread={!n.read || undefined} aria-label={n.read ? undefined : `Unread: ${n.title}`} onClick={() => open(n)}>
                      <span className={styles.icon} data-type={n.type} aria-hidden><Icon name={t.icon} size={18} /></span>
                      <span className={styles.text}>
                        <span className={styles.meta}><span className={styles.kind}>{t.label}</span><span>{ago(n.deliverAt, now)}</span></span>
                        <span className={styles.title}>{n.title}</span>
                        <span className={styles.body2}>{n.body}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
