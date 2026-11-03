/** A-7.4 Stripe integration card: connect, health at a glance, mode switch, events, disconnect. */
import { useState } from 'react';
import { formatDate, useAdminStore } from '@shared/admin';
import { Button, Icon, IconButton, KeyValueList, Menu, StatusText } from '@admin/ui';
import { ConfirmDialog, IntegrationCard } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import { CopyText } from '@admin/screens/common/CopyEmail';
import styles from './Stripe.module.css';

type Confirm = 'live' | 'test' | 'disconnect' | null;

export function StripeCard() {
  const stripe = useAdminStore((s) => s.stripe);
  const canEdit = useAdminStore((s) => s.role === 'super');
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const check = useSim();
  const act = useSim();

  const connected = stripe.status === 'connected' && stripe.account;
  const dashboard = `https://dashboard.stripe.com${stripe.mode === 'test' ? '/test' : ''}`;

  const status = connected ? (
    <>
      <StatusText tone="success">Connected</StatusText>
      <StatusText tone={stripe.mode === 'live' ? 'success' : 'warning'}>{stripe.mode === 'live' ? 'Live mode' : 'Test mode'}</StatusText>
    </>
  ) : (
    <StatusText>Not connected</StatusText>
  );

  const actions = !canEdit ? null : connected ? (
    <>
      <a className={styles.extLink} href={dashboard} target="_blank" rel="noreferrer">
        Open Stripe dashboard <Icon name="external" size={16} />
      </a>
      <Button size="sm" variant="secondary" loading={check.busy} onClick={() => check.run(() => undefined, 'Connection is working', 1200)}>
        Check connection
      </Button>
      <Menu
        side="bottom"
        align="end"
        onSelect={(id) => (id === 'events' ? openDrawer({ kind: 'stripeEvents', id: null }) : setConfirm(id as Confirm))}
        items={[
          stripe.mode === 'test' ? { id: 'live', label: 'Switch to live mode' } : { id: 'test', label: 'Switch to test mode' },
          { id: 'events', label: 'View webhook events' },
          { id: 'disconnect', label: 'Disconnect', destructive: true },
        ]}
        trigger={<IconButton icon="more" label="Stripe actions" />}
      />
    </>
  ) : null;

  // Not connected: one plain block and Stripe's own branded, pill-shaped Connect button.
  // Only the connected view lives here; the Connect tile is in the Available grid.
  if (!connected) return null;

  return (
    <>
      <IntegrationCard
        mark={<Icon name="stripe" size={26} />}
        markColor="#635bff"
        name="Stripe"
        description={
          connected
            ? 'Takes payments for plans and subscriptions.'
            : "Accept payments for plans and subscriptions. You'll be sent to Stripe to sign in or create an account."
        }
        status={status}
        actions={actions}
      >
        {connected && stripe.account && stripe.webhook && (
          <KeyValueList
            items={[
              { label: 'Account', value: stripe.account.name },
              { label: 'Account ID', value: <CopyText value={stripe.account.id} label="account ID" /> },
              { label: 'Payouts', value: stripe.account.payoutsEnabled ? <StatusText tone="success">Enabled</StatusText> : <StatusText tone="warning">Needs details</StatusText> },
              { label: 'Webhook', value: <StatusText tone={stripe.webhook.status === 'active' ? 'success' : 'danger'}>{stripe.webhook.status === 'active' ? 'Active' : 'Failing'}</StatusText> },
              { label: 'Last event', value: formatDate(stripe.webhook.lastEventAt) },
            ]}
          />
        )}
      </IntegrationCard>

      {confirm === 'disconnect' && (
        <ConfirmDialog
          title="Disconnect Stripe?"
          body="New checkouts and renewals stop until you connect again. Existing data in Stripe isn't deleted."
          confirm="Disconnect"
          destructive
          busy={act.busy}
          onConfirm={() => act.run(() => { useAdminStore.getState().disconnectStripe(); setConfirm(null); }, 'Stripe disconnected')}
          onClose={() => setConfirm(null)}
        />
      )}
      {(confirm === 'live' || confirm === 'test') && (
        <ConfirmDialog
          title={confirm === 'live' ? 'Switch to live mode?' : 'Switch to test mode?'}
          body={
            confirm === 'live'
              ? stripe.account?.detailsComplete
                ? 'Clients will be charged for real from now on. Make sure your plan prices are right first.'
                : 'Stripe needs your business and bank details before you can go live. Finish them in the Stripe dashboard.'
              : 'Payments stop being real. Use this to try changes safely.'
          }
          confirm={confirm === 'live' ? 'Switch to live' : 'Switch to test'}
          busy={act.busy}
          onConfirm={() => {
            if (confirm === 'live' && !stripe.account?.detailsComplete) return setConfirm(null);
            act.run(() => { useAdminStore.getState().setStripeMode(confirm); setConfirm(null); }, confirm === 'live' ? 'Live mode on' : 'Test mode on');
          }}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}
