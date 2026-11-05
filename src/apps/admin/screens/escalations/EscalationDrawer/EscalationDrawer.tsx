/**
 * @screen  A-4.2 · Escalation detail (side drawer)
 * @flow    A4 Escalation management (story 4.1)
 * @states  not yet reviewed · reviewed · teen (parent told) · family member · no response
 * @spec    docs/admin/stories.md#41---manage-escalations
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { formatDate, useAdminStore } from '@shared/admin';
import { Button, Drawer, KeyValueList, TextArea } from '@admin/ui';
import { EscalationStatusText, EscalationTypeText, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useViewLog } from '@admin/hooks/useViewLog';
import { useSim } from '@admin/hooks/useSim';
import { CopyEmail } from '@admin/screens/common/CopyEmail';
import { Conversation } from './parts/Conversation';
import styles from './EscalationDrawer.module.css';

/** Recorded for review only: the team doesn't contact the Client, so there's no email, overdue or close/reopen. */
export default function EscalationDrawer({ escalationId }: { escalationId: string }) {
  const esc = useAdminStore((s) => s.escalations.find((e) => e.id === escalationId));
  const client = useAdminStore((s) => s.clients.find((c) => c.id === esc?.clientId));
  const openClient = useAdminNav((s) => s.openClient);
  const close = useAdminNav((s) => s.closeDrawer);
  const sim = useSim();
  const [notes, setNotes] = useState(esc?.reviewNotes ?? '');

  useViewLog(esc?.id, `Viewed escalation ${escalationId}`);
  if (!esc) return null;
  const reviewed = esc.status === 'reviewed';
  const review = (next: boolean) =>
    sim.run(
      () => useAdminStore.getState().reviewEscalation(esc.id, next, notes),
      next ? 'This escalation has been marked as reviewed.' : 'Marked as not yet reviewed',
    );
  const profile =
    esc.profile.kind === 'family' ? `Family member ${esc.profile.name}, advocate ${esc.profile.advocate}`
    : esc.profile.kind === 'teen' ? `Teen with their own account (${esc.profile.name})`
    : 'The Client';
  // Minimum necessary: only the message that triggered the escalation, never the rest of the conversation.
  const trigger = { ...esc, messages: esc.messages.filter((m) => m.trigger) };

  return (
    <Drawer
      title={esc.reason}
      subtitle={formatDate(esc.opened)}
      onClose={close}
      meta={
        <>
          <EscalationTypeText type={esc.type} />
          <EscalationStatusText status={esc.status} />
        </>
      }
      actions={
        reviewed ? (
          <Button size="sm" variant="secondary" loading={sim.busy} onClick={() => review(false)}>Mark not yet reviewed</Button>
        ) : (
          <Button size="sm" loading={sim.busy} onClick={() => review(true)}>Mark as reviewed</Button>
        )
      }
    >
      <Section title="Why it escalated">
        <div className={styles.summary}>
          {esc.summary.map((para) => <p key={para} className={styles.text}>{para}</p>)}
        </div>
      </Section>
      <Section title="Triggering message">
        <Conversation esc={trigger} />
      </Section>
      <Section title="What happened">
        <KeyValueList
          items={[
            { label: 'Profile', value: profile },
            { label: 'Oracle showed', value: esc.oracleShowed },
            { label: 'Client chose', value: esc.clientChose },
            ...(esc.profile.kind === 'teen' ? [{ label: 'Parent told', value: esc.parentToldAt ? formatDate(esc.parentToldAt) : 'Not told' }] : []),
            { label: 'Device', value: esc.device },
            ...(reviewed ? [{ label: 'Reviewed', value: `${esc.reviewedBy ?? ''} · ${esc.reviewedAt ? formatDate(esc.reviewedAt) : ''}` }] : []),
          ]}
        />
      </Section>
      {client && (
        <Section title="Account">
          <KeyValueList
            items={[
              {
                label: 'Client',
                value: (
                  <button type="button" className={styles.clientLink} onClick={() => openClient(client.id)}>
                    {client.name}
                  </button>
                ),
              },
              { label: 'Email', value: <CopyEmail email={client.email} /> },
            ]}
          />
        </Section>
      )}
      <Section title="Review notes">
        <TextArea label="Review notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="For example, a possible false alarm" />
      </Section>
    </Drawer>
  );
}
