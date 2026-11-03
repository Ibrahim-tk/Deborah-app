/**
 * @screen  A-3.2 · Client detail (side drawer)
 * @flow    A3 Client management
 * @states  active · deactivated · emailing · reminder sent · confirm deactivate
 * @spec    docs/admin/README.md#a-32-client-detail
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { formatDate, planLabel, useAdminStore } from '@shared/admin';
import { Drawer, IconButton, KeyValueList, Menu } from '@admin/ui';
import { AccountStatusText, ConfirmDialog, ContactDialog, Section, SubscriptionStatusText } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useContact } from '@admin/hooks/useContact';
import { useSim } from '@admin/hooks/useSim';
import { ClientTables } from './parts/ClientTables';
import { Dependents } from './parts/Dependents';
import { CopyEmail } from '@admin/screens/common/CopyEmail';
import { HealthProfile } from './parts/HealthProfile';

/** Copy agreed for the in-app reminder (FigJam: Send reminder / notification). */
const REMINDER_TEXT = "Deborah's team is trying to get a hold of you";

export default function ClientDrawer({ clientId }: { clientId: string }) {
  const client = useAdminStore((s) => s.clients.find((c) => c.id === clientId));
  const plan = useAdminStore((s) => s.plans.find((p) => p.id === client?.planId));
  const close = useAdminNav((s) => s.closeDrawer);
  const contact = useContact(client?.name ?? '');
  const reminder = useSim();
  const toggle = useSim();
  const [confirming, setConfirming] = useState(false);

  if (!client) return null;
  const active = client.account === 'active';

  const sendReminder = () =>
    reminder.run(() => useAdminStore.getState().log(`Sent reminder to ${client.name}: "${REMINDER_TEXT}"`), 'Reminder sent');
  const setAccount = () =>
    toggle.run(() => {
      useAdminStore.getState().setClientAccount(client.id, !active);
      setConfirming(false);
    }, active ? 'Client deactivated' : 'Client reactivated');

  return (
    <Drawer
      title={client.name}
      subtitle={<CopyEmail email={client.email} />}
      onClose={close}
      // Header carries the account state only; the subscription state sits with the plan below, so the two
      // statuses never read as a duplicate pair.
      meta={<AccountStatusText status={client.account} />}
      headerControls={
        <Menu
          side="bottom"
          align="end"
          onSelect={(action) => {
            if (action === 'email') contact.setOpen(true);
            if (action === 'remind') sendReminder();
            if (action === 'account') {
              if (active) setConfirming(true);
              else setAccount();
            }
          }}
          items={[
            { id: 'email', label: 'Email', icon: 'mail' },
            { id: 'remind', label: 'Send reminder', icon: 'bell' },
            { id: 'account', label: active ? 'Deactivate' : 'Reactivate', destructive: active },
          ]}
          trigger={<IconButton icon="more" label="Client actions" />}
        />
      }
    >
      <Section title="Client information">
        <KeyValueList
          items={[
            { label: 'Plan', value: planLabel(plan) },
            { label: 'Subscription', value: <SubscriptionStatusText status={client.subscription} /> },
            { label: 'Location', value: client.location },
            { label: 'Joined', value: formatDate(client.joined) },
            { label: 'Last active', value: formatDate(client.lastActive) },
            { label: 'Conversations', value: client.conversations },
          ]}
        />
      </Section>
      <HealthProfile client={client} />
      <Dependents client={client} />
      <ClientTables client={client} />

      {contact.open && (
        <ContactDialog name={client.name} email={client.email} busy={contact.busy} onSend={contact.send} onClose={() => contact.setOpen(false)} />
      )}
      {confirming && (
        <ConfirmDialog
          title={`Deactivate ${client.name}?`}
          body="They won't be able to sign in or ask questions until you reactivate them. Their data stays as it is."
          confirm="Deactivate client"
          destructive
          busy={toggle.busy}
          onConfirm={setAccount}
          onClose={() => setConfirming(false)}
        />
      )}
    </Drawer>
  );
}
