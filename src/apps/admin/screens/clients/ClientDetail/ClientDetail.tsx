/**
 * @screen  A-3.2 · Client detail
 * @flow    A3 Client management
 * @states  active · deactivated · emailing · reminder sent · confirm deactivate
 * @spec    docs/admin/README.md#a-32-client-detail
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { formatDate, useAdminStore } from '@shared/admin';
import { Button, KeyValueList } from '@admin/ui';
import {
  AccountStatusText, AdminPage, ConfirmDialog, ContactDialog, Section, SubscriptionStatusText,
} from '@admin/patterns';
import { useContact } from '@admin/hooks/useContact';
import { useSim } from '@admin/hooks/useSim';
import { ClientTables } from './parts/ClientTables';
import styles from './ClientDetail.module.css';

/** Copy agreed for the in-app reminder (FigJam: Send reminder / notification). */
export const REMINDER_TEXT = "Deborah's team is trying to get a hold of you";

export default function ClientDetail({ clientId }: { clientId: string }) {
  const client = useAdminStore((s) => s.clients.find((c) => c.id === clientId));
  const plan = useAdminStore((s) => s.plans.find((p) => p.id === client?.planId));
  const contact = useContact(client?.name ?? '');
  const reminder = useSim();
  const toggle = useSim();
  const [confirming, setConfirming] = useState(false);

  if (!client) return <AdminPage title="Client not found">This client may have been deleted.</AdminPage>;
  const active = client.account === 'active';

  const sendReminder = () =>
    reminder.run(() => useAdminStore.getState().log(`Sent reminder to ${client.name}`), 'Reminder sent');
  const setAccount = () =>
    toggle.run(() => {
      useAdminStore.getState().setClientAccount(client.id, !active);
      setConfirming(false);
    }, active ? 'Client deactivated' : 'Client reactivated');

  return (
    <AdminPage
      title={client.name}
      subtitle={client.email}
      action={<Button leadingIcon="mail" onClick={() => contact.setOpen(true)}>Email client</Button>}
      aside={
        <>
          <Section title="Status" surface>
            <KeyValueList
              items={[
                { label: 'Account', value: <AccountStatusText status={client.account} /> },
                { label: 'Subscription', value: <SubscriptionStatusText status={client.subscription} /> },
                { label: 'Plan', value: plan?.name ?? '—' },
              ]}
            />
          </Section>
          <div className={styles.actions}>
            <Button variant="secondary" fullWidth leadingIcon="bell" loading={reminder.busy} onClick={sendReminder}>Send reminder</Button>
            <p className={styles.hint}>Shows "{REMINDER_TEXT}" in the client's app.</p>
            <Button variant={active ? 'ghost' : 'secondary'} fullWidth onClick={() => (active ? setConfirming(true) : setAccount())} loading={!confirming && toggle.busy}>
              {active ? 'Deactivate client' : 'Reactivate client'}
            </Button>
          </div>
        </>
      }
    >
      <Section title="Client information">
        <KeyValueList
          items={[
            { label: 'Email', value: client.email },
            { label: 'Phone', value: client.phone },
            { label: 'Location', value: client.location },
            { label: 'Joined', value: formatDate(client.joined) },
            { label: 'Last active', value: formatDate(client.lastActive) },
            { label: 'Conversations', value: client.conversations },
          ]}
        />
      </Section>
      <Section title="Health profile">
        <KeyValueList
          items={[
            { label: 'Age', value: client.health.age },
            { label: 'Stage', value: client.health.stage },
            { label: 'Main concerns', value: client.health.concerns.join(', ') },
            { label: 'Medications', value: client.health.medications.join(', ') },
          ]}
        />
      </Section>
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
    </AdminPage>
  );
}
