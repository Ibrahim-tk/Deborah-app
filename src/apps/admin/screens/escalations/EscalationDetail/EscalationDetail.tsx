/**
 * @screen  A-4.2 · Escalation detail
 * @flow    A4 Escalation & support management
 * @states  open · in review · resolved · emailing
 * @spec    docs/admin/README.md#a-42-escalation-detail
 * @xref    web: none (admin only)
 */
import { formatDate, useAdminStore } from '@shared/admin';
import { Button, KeyValueList } from '@admin/ui';
import { AdminPage, ContactDialog, EscalationStatusText, EscalationTypeText, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useContact } from '@admin/hooks/useContact';
import { useSim } from '@admin/hooks/useSim';
import styles from './EscalationDetail.module.css';

export default function EscalationDetail({ escalationId }: { escalationId: string }) {
  const esc = useAdminStore((s) => s.escalations.find((e) => e.id === escalationId));
  const client = useAdminStore((s) => s.clients.find((c) => c.id === esc?.clientId));
  const push = useAdminNav((s) => s.push);
  const contact = useContact(client?.name ?? '');
  const sim = useSim();

  if (!esc) return <AdminPage title="Case not found">This case may have been removed.</AdminPage>;
  const resolved = esc.status === 'resolved';
  const set = (status: 'resolved' | 'open' | 'in_review', done: string) =>
    sim.run(() => useAdminStore.getState().setEscalationStatus(esc.id, status), done);

  return (
    <AdminPage
      title={esc.reason}
      subtitle={`Opened ${formatDate(esc.opened)}`}
      action={
        resolved ? (
          <Button variant="secondary" loading={sim.busy} onClick={() => set('open', 'Case reopened')}>Reopen case</Button>
        ) : (
          <Button loading={sim.busy} onClick={() => set('resolved', 'Case closed')}>Close case</Button>
        )
      }
      aside={
        <>
          <Section title="Case" surface>
            <KeyValueList
              items={[
                { label: 'Type', value: <EscalationTypeText type={esc.type} /> },
                { label: 'Status', value: <EscalationStatusText status={esc.status} /> },
                ...(esc.closed ? [{ label: 'Closed', value: formatDate(esc.closed) }] : []),
              ]}
            />
          </Section>
          {client && (
            <div className={styles.actions}>
              <Button variant="secondary" fullWidth leadingIcon="mail" onClick={() => contact.setOpen(true)}>Email client</Button>
              {esc.status === 'open' && (
                <Button variant="ghost" fullWidth onClick={() => set('in_review', 'Marked as in review')}>Mark as in review</Button>
              )}
            </div>
          )}
        </>
      }
    >
      <Section title="Summary">
        <p className={styles.text}>{esc.summary}</p>
      </Section>
      <Section title="From the conversation">
        <blockquote className={styles.excerpt}>
          {esc.excerpt.map((line) => <p key={line}>{line}</p>)}
        </blockquote>
      </Section>
      {client && (
        <Section title="Client">
          <button type="button" className={styles.clientLink} onClick={() => push({ id: 'client', clientId: client.id })}>
            <span>{client.name}</span>
            <span className={styles.meta}>{client.email}</span>
          </button>
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
    </AdminPage>
  );
}
