/**
 * @screen  A-3.2 · Client detail (side drawer)
 * @flow    A3 Client management
 * @states  tabs: overview · health profile · family · activity · change email · deactivate (reason) · reactivate · deactivated · emailing · reminder sent · confirm deactivate
 * @spec    docs/admin/README.md#a-32-client-detail
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { useAdminStore } from '@shared/admin';
import { Drawer, IconButton, Menu, Tabs } from '@admin/ui';
import { AccountStatusText, ConfirmDialog, ContactDialog } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useContact } from '@admin/hooks/useContact';
import { useSim } from '@admin/hooks/useSim';
import { useViewLog } from '@admin/hooks/useViewLog';
import { ClientTables } from './parts/ClientTables';
import { Dependents } from './parts/Dependents';
import { CopyEmail } from '@admin/screens/common/CopyEmail';
import { HealthProfile } from './parts/HealthProfile';
import { Overview } from './parts/Overview';
import { ChangeEmailDialog, DeactivateDialog } from './parts/AccountDialogs';

/** Copy agreed for the in-app reminder (FigJam: Send reminder / notification). */
const REMINDER_TEXT = "Deborah's team is trying to get a hold of you";

type Tab = 'overview' | 'health' | 'family' | 'activity';

export default function ClientDrawer({ clientId }: { clientId: string }) {
  const client = useAdminStore((s) => s.clients.find((c) => c.id === clientId));
  const close = useAdminNav((s) => s.closeDrawer);
  const contact = useContact(client?.name ?? '');
  const reminder = useSim();
  const toggle = useSim();
  const [dialog, setDialog] = useState<'email' | 'deactivate' | 'reactivate' | null>(null);
  const [tab, setTab] = useState<Tab>('overview');

  useViewLog(client?.id, `Viewed client ${client?.name ?? ''}`);

  if (!client) return null;
  const active = client.account === 'active';

  const sendReminder = () =>
    reminder.run(() => useAdminStore.getState().log(`Sent reminder to ${client.name}: "${REMINDER_TEXT}"`), 'Reminder sent');
  // Reactivation needs no reason; deactivation goes through DeactivateDialog.
  const reactivate = () =>
    toggle.run(() => {
      useAdminStore.getState().setClientAccount(client.id, true);
      setDialog(null);
    }, `${client.name}\u2019s account has been reactivated.`);

  return (
    <Drawer
      title={client.name}
      subtitle={<CopyEmail email={client.email} />}
      size="wide"
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
            if (action === 'change-email') setDialog('email');
            if (action === 'account') {
              if (active) setDialog('deactivate');
              else setDialog('reactivate');
            }
          }}
          items={[
            { id: 'email', label: 'Email', icon: 'mail' },
            { id: 'remind', label: 'Send reminder', icon: 'bell' },
            { id: 'change-email', label: 'Change email address', icon: 'edit' },
            { id: 'account', label: active ? 'Deactivate' : 'Reactivate', destructive: active },
          ]}
          trigger={<IconButton icon="more" label="Client actions" />}
        />
      }
    >
      <Tabs<Tab>
        label="Client details"
        value={tab}
        onChange={setTab}
        tabs={[
          {
            value: 'overview',
            label: 'Overview',
            content: <Overview client={client} />,
          },
          { value: 'health', label: 'Health profile', content: <HealthProfile client={client} /> },
          { value: 'family', label: 'Dependents', content: <Dependents client={client} /> },
          { value: 'activity', label: 'Documents and escalations', content: <ClientTables client={client} /> },
        ]}
      />

      {contact.open && (
        <ContactDialog name={client.name} email={client.email} busy={contact.busy} onSend={contact.send} onClose={() => contact.setOpen(false)} />
      )}
      {dialog === 'email' && <ChangeEmailDialog client={client} onClose={() => setDialog(null)} />}
      {dialog === 'deactivate' && <DeactivateDialog client={client} onClose={() => setDialog(null)} />}
      {dialog === 'reactivate' && (
        <ConfirmDialog
          title={`Reactivate ${client.name}\u2019s account?`}
          body="They\u2019ll be able to sign in again."
          confirm="Reactivate"
          busy={toggle.busy}
          onConfirm={reactivate}
          onClose={() => setDialog(null)}
        />
      )}
    </Drawer>
  );
}
