/**
 * @screen  A-5.2 · Data deletion request (side drawer)
 * @flow    A5 Deletion requests (story 5.2)
 * @states  pending review · confirm · on legal hold · completed
 * @spec    docs/admin/stories.md#52---manage-data-deletion-requests
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { deletionDueDate, formatDate, useAdminStore } from '@shared/admin';
import { Button, Drawer, KeyValueList, TextArea } from '@admin/ui';
import { ConfirmDialog, DELETION_STATUS, DELETION_TYPE, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import { useAdminToast } from '@admin/hooks/toast.store';
import { DeadlineText } from '../DeletionRequests/parts/DeletionTable';
import s from '@admin/screens/common/drawer/drawer.module.css';

export default function DeletionDrawer({ id: requestId }: { id: string | null }) {
  const req = useAdminStore((st) => st.deletionRequests.find((r) => r.id === requestId));
  const client = useAdminStore((st) => st.clients.find((c) => c.id === req?.clientId));
  const [confirm, setConfirm] = useState<'complete' | 'hold' | null>(null);
  const [notes, setNotes] = useState(req?.notes ?? '');
  const [holdNote, setHoldNote] = useState('');
  const sim = useSim();
  const toast = useAdminToast();
  const { closeDrawer, openClient } = useAdminNav.getState();
  if (!req) return null;

  const store = useAdminStore.getState();
  const first = client?.name ?? 'the Client';
  const done = req.status === 'completed';
  const depName = (id: string) => client?.dependents.find((d) => d.id === id)?.name ?? id;
  const profile = req.type === 'family_member' ? depName(req.aboutProfile ?? '') : req.type === 'teen' ? `${first} (teen account)` : `${first} (own account)`;
  const complete = () =>
    sim.run(() => {
      store.completeDeletion(req.id);
      setConfirm(null);
    }, `The deletion is complete, and ${first} has been emailed.`, 1200);

  return (
    <Drawer
      title={first}
      subtitle={DELETION_TYPE[req.type]}
      meta={<DeadlineText request={req} />}
      onClose={closeDrawer}
      actions={
        <>
          <Button size="sm" variant="ghost" disabled={notes === req.notes} onClick={() => { store.saveDeletionNote(req.id, notes); toast('Your note has been saved.'); }}>Save note</Button>
          {!done && (
          <>
            <Button size="sm" variant="destructive" disabled={req.status === 'legal_hold'} onClick={() => setConfirm('complete')}>Delete data</Button>
            {req.status === 'legal_hold' ? (
              <Button size="sm" variant="secondary" onClick={() => sim.run(() => store.setLegalHold(req.id, false, ''), 'The legal hold has been lifted.')}>Lift legal hold</Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setConfirm('hold')}>Place on legal hold</Button>
            )}
          </>
          )}
        </>
      }
    >
      <Section title="Request details">
        <KeyValueList
          items={[
            { label: 'Status', value: DELETION_STATUS[req.status] },
            { label: 'Deleting', value: profile },
            ...(client ? [{ label: 'Email', value: <button type="button" className={s.link} onClick={() => openClient(client.id)}>{client.email}</button> }] : []),
            { label: 'Requested on', value: formatDate(req.received) },
            { label: 'Due by', value: formatDate(deletionDueDate(req.received)) },
            { label: 'Sent', value: req.source === 'email' ? 'By email, logged by the support team' : 'From the app' },
            ...(req.createdBy ? [{ label: 'Logged by', value: req.createdBy }] : []),
            ...(done ? [{ label: 'Completed', value: `${req.completedBy ?? ''} · ${req.completedAt ? formatDate(req.completedAt) : ''}` }] : []),
          ]}
        />
      </Section>
      <Section title="Internal notes">
        <TextArea label="Internal notes" hideLabel placeholder="Only the team sees these notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Section>

      {confirm === 'complete' && (
        <ConfirmDialog
          title="Delete data?"
          body="Permanently delete this data? This can't be undone."
          confirm="Delete data"
          destructive
          busy={sim.busy}
          onConfirm={complete}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === 'hold' && (
        <ConfirmDialog
          title="Place on legal hold?"
          body={<TextArea label="Note" value={holdNote} onChange={(e) => setHoldNote(e.target.value)} placeholder="Why the hold applies" />}
          confirm="Place on legal hold"
          busy={sim.busy}
          onConfirm={() => sim.run(() => { store.setLegalHold(req.id, true, holdNote); setConfirm(null); }, 'This request is on legal hold. The Client has been told.')}
          onClose={() => setConfirm(null)}
        />
      )}
    </Drawer>
  );
}
