/**
 * @screen  A-4.2 · Escalation detail (side drawer)
 * @flow    A4 Escalation & support management
 * @states  open · in review · resolved · emailing
 * @spec    docs/admin/README.md#a-42-escalation-detail
 * @xref    web: none (admin only)
 */
import { formatDate, useAdminStore } from '@shared/admin';
import { Button, Drawer, KeyValueList } from '@admin/ui';
import { ContactDialog, EscalationStatusText, EscalationTypeText, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useContact } from '@admin/hooks/useContact';
import { useSim } from '@admin/hooks/useSim';
import { CopyEmail } from '@admin/screens/common/CopyEmail';
import { Conversation } from './parts/Conversation';
import styles from './EscalationDrawer.module.css';

export default function EscalationDrawer({ escalationId }: { escalationId: string }) {
  const esc = useAdminStore((s) => s.escalations.find((e) => e.id === escalationId));
  const client = useAdminStore((s) => s.clients.find((c) => c.id === esc?.clientId));
  const openClient = useAdminNav((s) => s.openClient);
  const close = useAdminNav((s) => s.closeDrawer);
  const contact = useContact(client?.name ?? '');
  const sim = useSim();

  if (!esc) return null;
  const resolved = esc.status === 'resolved';
  const set = (status: 'resolved' | 'open' | 'in_review', done: string) =>
    sim.run(() => useAdminStore.getState().setEscalationStatus(esc.id, status), done);

  return (
    <Drawer
      title={esc.reason}
      subtitle={`Opened ${formatDate(esc.opened)}${esc.closed ? ` · Closed ${formatDate(esc.closed)}` : ''}`}
      onClose={close}
      meta={
        <>
          <EscalationTypeText type={esc.type} />
          <EscalationStatusText status={esc.status} />
        </>
      }
      actions={
        <>
          {resolved ? (
            <Button size="sm" variant="secondary" loading={sim.busy} onClick={() => set('open', 'Case reopened')}>Reopen case</Button>
          ) : (
            <Button size="sm" loading={sim.busy} onClick={() => set('resolved', 'Case closed')}>Close case</Button>
          )}
          {esc.status === 'open' && (
            <Button size="sm" variant="secondary" onClick={() => set('in_review', 'Marked as in review')}>Mark as in review</Button>
          )}
          {client && (
            <Button size="sm" variant="ghost" leadingIcon="mail" className={styles.end} onClick={() => contact.setOpen(true)}>Email client</Button>
          )}
        </>
      }
    >
      <Section title="Summary">
        <div className={styles.summary}>
          {esc.summary.map((para) => <p key={para} className={styles.text}>{para}</p>)}
        </div>
      </Section>
      <Section title="Conversation">
        <Conversation esc={esc} />
      </Section>
      {client && (
        <Section title="Client">
          <KeyValueList
            items={[
              {
                label: 'Name',
                value: (
                  <button type="button" className={styles.clientLink} onClick={() => openClient(client.id)}>
                    {client.name}
                  </button>
                ),
              },
              { label: 'Email', value: <CopyEmail email={client.email} /> },
              { label: 'Location', value: client.location },
              { label: 'Hormonal stage', value: client.health.stage },
              { label: 'Main concerns', value: client.health.concerns.join(', ') },
            ]}
          />
        </Section>
      )}
      {contact.open && client && (
        <ContactDialog
          name={client.name}
          email={client.email}
          subject="Following up on your conversation"
          busy={contact.busy}
          onSend={contact.send}
          onClose={() => contact.setOpen(false)}
        />
      )}
    </Drawer>
  );
}
