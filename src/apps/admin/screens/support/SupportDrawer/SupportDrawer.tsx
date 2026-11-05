/**
 * @screen  A-5.3 · Support request (side drawer)
 * @flow    A5 Support request management (story 5.1)
 * @states  open · resolved · knowledge gap · email change · consultation · note saved
 * @spec    docs/admin/stories.md#51---manage-support-requests
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { formatDate, useAdminStore } from '@shared/admin';
import { Button, Drawer, KeyValueList, StatusText, TextArea } from '@admin/ui';
import { Section, SUPPORT_TYPE } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import { useAdminToast } from '@admin/hooks/toast.store';
import { CopyEmail } from '@admin/screens/common/CopyEmail';
import s from '@admin/screens/common/drawer/drawer.module.css';

/** Replies go out by email outside the app; there's no phone contact and no in-app reply (Session 9). */
export default function SupportDrawer({ id }: { id: string | null }) {
  const req = useAdminStore((st) => st.supportRequests.find((r) => r.id === id));
  const client = useAdminStore((st) => st.clients.find((c) => c.id === req?.clientId));
  const { closeDrawer, openClient } = useAdminNav.getState();
  const toast = useAdminToast();
  const sim = useSim();
  const [notes, setNotes] = useState(req?.notes ?? '');
  if (!req) return null;

  const store = useAdminStore.getState();
  const changeEmail = () =>
    sim.run(() => client && req.newEmail && store.changeClientEmail(client.id, req.newEmail), `${client?.name.split(' ')[0] ?? 'The Client'}'s email address has been changed.`);

  return (
    <Drawer
      title={req.subject}
      subtitle={`${SUPPORT_TYPE[req.type]} · Received ${formatDate(req.received)}`}
      onClose={closeDrawer}
      meta={req.resolved ? <StatusText tone="success">Resolved</StatusText> : <StatusText tone="accent">Open</StatusText>}
      actions={
        req.resolved ? (
          <Button size="sm" variant="secondary" loading={sim.busy} onClick={() => sim.run(() => store.setSupportResolved(req.id, false), 'This request has been reopened.')}>Reopen</Button>
        ) : (
          <>
            <Button size="sm" loading={sim.busy} onClick={() => sim.run(() => store.setSupportResolved(req.id, true), 'This request has been marked as resolved.')}>Mark as resolved</Button>
            {req.type === 'email_change' && client && <Button size="sm" variant="secondary" onClick={changeEmail}>Change email address</Button>}
          </>
        )
      }
    >
      <Section title="Request">
        <KeyValueList
          items={[
            { label: 'Type', value: SUPPORT_TYPE[req.type] },
            ...(req.aboutProfile && client ? [{ label: 'About', value: `Sent by ${client.name.split(' ')[0]} about ${req.aboutProfile}` }] : []),
            ...(req.question ? [{ label: 'Question', value: req.question }] : []),
            ...(req.newEmail ? [{ label: 'New email', value: <CopyEmail email={req.newEmail} /> }] : []),
            ...(req.helpWith ? [{ label: 'Help with', value: req.helpWith }] : []),
            ...(req.resolved && req.resolvedBy ? [{ label: 'Resolved', value: `${req.resolvedBy} · ${req.resolvedAt ? formatDate(req.resolvedAt) : ''}` }] : []),
          ]}
        />
        <p className={s.message}>{req.message}</p>
        <p className={s.note}>
          {req.type === 'knowledge_gap'
            ? 'This question was also sent to Knowledge Base as a knowledge gap.'
            : req.type === 'consultation'
              ? 'Contact the Client by email to decide whether a consultation is right for them. Booking and payment happen outside the app.'
              : 'Replies go out by email, outside the app. Mark the request resolved once you’ve replied.'}
        </p>
      </Section>
      {client && (
        <Section title="Client">
          <KeyValueList
            items={[
              { label: 'Name', value: <button type="button" className={s.link} onClick={() => openClient(client.id)}>{client.name}</button> },
              { label: 'Email', value: <CopyEmail email={client.email} /> },
            ]}
          />
        </Section>
      )}
      <Section title="Internal notes">
        <TextArea label="Internal notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="For example, Emailed on 2 Nov" />
        <div>
          <Button size="sm" variant="secondary" disabled={notes === req.notes} onClick={() => { store.saveSupportNote(req.id, notes); toast('Your note has been saved.'); }}>Save note</Button>
        </div>
      </Section>
    </Drawer>
  );
}
