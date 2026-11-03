/**
 * @screen  A-5.3 · Support request (side drawer)
 * @flow    A5 Support request management
 * @states  open · resolved · emailing
 * @spec    docs/admin/README.md#a-53-support-request
 * @xref    web: none (admin only)
 */
import { formatDate, useAdminStore, type SupportType } from '@shared/admin';
import { Button, Drawer, KeyValueList, StatusText } from '@admin/ui';
import { ContactDialog, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useContact } from '@admin/hooks/useContact';
import { useSim } from '@admin/hooks/useSim';
import { CopyEmail } from '@admin/screens/common/CopyEmail';
import s from '@admin/screens/common/drawer/drawer.module.css';

const TYPE: Record<SupportType, string> = { escalate_to_deborah: 'Escalate to Deborah', billing: 'Billing', account: 'Account', technical: 'Technical' };

export default function SupportDrawer({ id }: { id: string | null }) {
  const req = useAdminStore((st) => st.supportRequests.find((r) => r.id === id));
  const client = useAdminStore((st) => st.clients.find((c) => c.id === req?.clientId));
  const { closeDrawer, openClient } = useAdminNav.getState();
  const contact = useContact(client?.name ?? '');
  const sim = useSim();
  if (!req) return null;

  return (
    <Drawer
      title={req.subject}
      subtitle={`Received ${formatDate(req.received)}`}
      onClose={closeDrawer}
      meta={req.resolved ? <StatusText tone="success">Resolved</StatusText> : <StatusText tone="accent">Open</StatusText>}
      actions={
        <>
          {!req.resolved && (
            <Button size="sm" loading={sim.busy} onClick={() => sim.run(() => useAdminStore.getState().resolveSupport(req.id), 'Request resolved')}>Mark resolved</Button>
          )}
          {client && <Button size="sm" variant="secondary" leadingIcon="mail" onClick={() => contact.setOpen(true)}>Reply by email</Button>}
        </>
      }
    >
      <Section title="Request">
        <KeyValueList
          items={[
            { label: 'Type', value: req.type === 'escalate_to_deborah' ? <StatusText tone="accent">{TYPE[req.type]}</StatusText> : TYPE[req.type] },
            { label: 'Subject', value: req.subject },
            { label: 'Received', value: formatDate(req.received) },
            { label: 'Status', value: req.resolved ? 'Resolved' : 'Waiting for a reply' },
          ]}
        />
        <p className={s.note}>Support is answered outside the console, by email. Mark the request resolved once you've replied.</p>
      </Section>
      {client && (
        <Section title="Client">
          <KeyValueList
            items={[
              { label: 'Name', value: <button type="button" className={s.link} onClick={() => openClient(client.id)}>{client.name}</button> },
              { label: 'Email', value: <CopyEmail email={client.email} /> },
              { label: 'Plan', value: client.planId === 'free' ? 'Free' : client.dependents.length ? 'Family' : 'Individual' },
            ]}
          />
        </Section>
      )}
      {contact.open && client && (
        <ContactDialog name={client.name} email={client.email} subject={`Re: ${req.subject}`} busy={contact.busy} onSend={contact.send} onClose={() => contact.setOpen(false)} />
      )}
    </Drawer>
  );
}
