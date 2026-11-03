/**
 * @screen  A-7.5 · Stripe webhook events (side drawer)
 * @flow    A7 Subscription & billing management (super admin only)
 * @states  events · none yet (just connected)
 * @spec    docs/admin/README.md#a-74-stripe-integration
 * @xref    web: none (admin only)
 */
import { formatDate, useAdminStore } from '@shared/admin';
import { Drawer, StatusText } from '@admin/ui';
import { useAdminNav } from '@admin/navigation';
import styles from './StripeEventsDrawer.module.css';

export default function StripeEventsDrawer() {
  const events = useAdminStore((s) => s.stripeEvents);
  const webhook = useAdminStore((s) => s.stripe.webhook);
  const close = useAdminNav((s) => s.closeDrawer);

  return (
    <Drawer title="Webhook events" subtitle={webhook?.url ?? 'Stripe is not connected'} onClose={close}>
      <ol className={styles.list}>
        {events.map((e) => (
          <li key={e.id} className={styles.item}>
            <div className={styles.row}>
              <code className={styles.type}>{e.type}</code>
              <StatusText tone={e.status === 'succeeded' ? 'success' : 'danger'}>{e.status === 'succeeded' ? 'Succeeded' : 'Failed'}</StatusText>
              <span className={styles.time}>{formatDate(e.at)}</span>
            </div>
            <p className={styles.summary}>{e.summary}</p>
          </li>
        ))}
      </ol>
    </Drawer>
  );
}
