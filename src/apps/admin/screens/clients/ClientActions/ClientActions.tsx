/** The client ⋮ menu (Email, Send reminder, Change email address, Deactivate / Reactivate) with its dialogs.
 *  Shared by the Clients table's Actions column and the client drawer header, so both behave the same. */
import { useState } from 'react';
import { useAdminStore, type Client } from '@shared/admin';
import { IconButton, Menu } from '@admin/ui';
import { ConfirmDialog, ContactDialog } from '@admin/patterns';
import { useContact } from '@admin/hooks/useContact';
import { useSim } from '@admin/hooks/useSim';
import { ChangeEmailDialog, DeactivateDialog } from '../ClientDrawer/parts/AccountDialogs';

/** Copy agreed for the in-app reminder (FigJam: Send reminder / notification). */
const REMINDER_TEXT = "Deborah's team is trying to get a hold of you";

export function ClientActions({ client }: { client: Client }) {
  const contact = useContact(client.name);
  const reminder = useSim();
  const toggle = useSim();
  const [dialog, setDialog] = useState<'email' | 'deactivate' | 'reactivate' | null>(null);
  const active = client.account === 'active';

  const sendReminder = () =>
    reminder.run(() => useAdminStore.getState().log(`Sent reminder to ${client.name}: "${REMINDER_TEXT}"`), 'Reminder sent');
  // Reactivation needs no reason; deactivation goes through DeactivateDialog.
  const reactivate = () =>
    toggle.run(() => {
      useAdminStore.getState().setClientAccount(client.id, true);
      setDialog(null);
    }, `${client.name}’s account has been reactivated.`);

  return (
    <>
      <Menu
        side="bottom"
        align="end"
        onSelect={(action) => {
          if (action === 'email') contact.setOpen(true);
          if (action === 'remind') sendReminder();
          if (action === 'change-email') setDialog('email');
          if (action === 'account') setDialog(active ? 'deactivate' : 'reactivate');
        }}
        items={[
          { id: 'email', label: 'Email', icon: 'mail' },
          { id: 'remind', label: 'Send reminder', icon: 'bell' },
          { id: 'change-email', label: 'Change email address', icon: 'edit' },
          { id: 'account', label: active ? 'Deactivate' : 'Reactivate', destructive: active },
        ]}
        trigger={<IconButton icon="columnMenu" size="sm" label={`Actions for ${client.name}`} />}
      />
      {contact.open && (
        <ContactDialog name={client.name} email={client.email} busy={contact.busy} onSend={contact.send} onClose={() => contact.setOpen(false)} />
      )}
      {dialog === 'email' && <ChangeEmailDialog client={client} onClose={() => setDialog(null)} />}
      {dialog === 'deactivate' && <DeactivateDialog client={client} onClose={() => setDialog(null)} />}
      {dialog === 'reactivate' && (
        <ConfirmDialog
          title={`Reactivate ${client.name}’s account?`}
          body="They’ll be able to sign in again."
          confirm="Reactivate"
          busy={toggle.busy}
          onConfirm={reactivate}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}
