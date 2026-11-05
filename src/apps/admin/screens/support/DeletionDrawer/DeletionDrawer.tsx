/**
 * @screen  A-5.2 · Data deletion request (side drawer)
 * @flow    A5 Deletion requests (story 5.2)
 * @states  pending review · waiting for transfer · checklist incomplete · confirm · on legal hold · completed
 * @spec    docs/admin/stories.md#52---manage-data-deletion-requests
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { deletionDueDate, formatDate, useAdminStore } from '@shared/admin';
import { Button, Checkbox, Drawer, KeyValueList, StatusText, TextArea } from '@admin/ui';
import { ConfirmDialog, DELETION_OPTION, DELETION_STATUS, DELETION_TYPE, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import { useAdminToast } from '@admin/hooks/toast.store';
import { DeadlineText } from '../Support/parts/DeletionTable';
import s from '@admin/screens/common/drawer/drawer.module.css';
import styles from './DeletionDrawer.module.css';

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
  const waiting = req.decisions.filter((d) => d.action === 'transfer' && d.transfer !== 'accepted');
  const checklistDone = req.checklist.identity && req.checklist.legalHold;
  const depName = (id: string) => client?.dependents.find((d) => d.id === id)?.name ?? id;
  const deletes =
    req.type === 'teen' ? 'The teen’s account and data. If they’re in a parent’s family they’re removed and the place is freed; the parent isn’t told why.'
    : req.type === 'family_member' ? `${depName(req.aboutProfile ?? '')}’s data only. Their place in the family is freed.`
    : req.option ? DELETION_OPTION[req.option] : '';

  const tryComplete = () => (checklistDone ? setConfirm('complete') : toast('Please complete the review checklist first.'));
  const complete = () =>
    sim.run(() => {
      store.completeDeletion(req.id);
      setConfirm(null);
    }, `The deletion is complete, and ${first} has been emailed.`, 1200);

  return (
    <Drawer
      title={`${DELETION_TYPE[req.type]} · ${first}`}
      subtitle={`Received ${formatDate(req.received)} · Due ${formatDate(deletionDueDate(req.received))}`}
      meta={<DeadlineText request={req} />}
      onClose={closeDrawer}
      actions={
        !done && (
          <>
            <Button size="sm" variant="destructive" disabled={req.status === 'legal_hold' || waiting.length > 0} onClick={tryComplete}>Complete deletion</Button>
            {req.status === 'legal_hold' ? (
              <Button size="sm" variant="secondary" onClick={() => sim.run(() => store.setLegalHold(req.id, false, ''), 'The legal hold has been lifted.')}>Lift legal hold</Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setConfirm('hold')}>Place on legal hold</Button>
            )}
          </>
        )
      }
    >
      <Section title="Request">
        <KeyValueList
          items={[
            { label: 'Type', value: DELETION_TYPE[req.type] },
            { label: 'Source', value: req.source === 'email' ? 'By email (created by the support team)' : 'In app' },
            { label: 'Status', value: DELETION_STATUS[req.status] },
            ...(client ? [{ label: 'Account', value: <button type="button" className={s.link} onClick={() => openClient(client.id)}>{client.name} · {client.email}</button> }] : []),
            ...(req.createdBy ? [{ label: 'Created by', value: req.createdBy }] : []),
            ...(done ? [{ label: 'Completed', value: `${req.completedBy ?? ''} · ${req.completedAt ? formatDate(req.completedAt) : ''}` }] : []),
          ]}
        />
      </Section>
      <Section title="What will be deleted">
        <p className={styles.muted}>{deletes}</p>
        {req.decisions.length > 0 && (
          <ul className={styles.list}>
            {req.decisions.map((d) => (
              <li key={d.dependentId} className={styles.row}>
                <span className={styles.depName}>{depName(d.dependentId)}</span>
                {d.action === 'delete' ? (
                  <span className={styles.muted}>Deleted with the account</span>
                ) : (
                  <span className={styles.transfer}>
                    <span className={styles.muted} title={d.email}>Transfer to {d.email}</span>
                    {d.transfer === 'accepted' ? (
                      <StatusText tone="success">Accepted</StatusText>
                    ) : (
                      <>
                        <StatusText tone="accent">Waiting for transfer</StatusText>
                        {/* Prototype control: stands in for the family member accepting by email. */}
                        <Button size="sm" variant="ghost" onClick={() => store.acceptTransfer(req.id, d.dependentId)}>Simulate acceptance</Button>
                      </>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className={s.note}>Data is deleted permanently, including from backups. Deleting a parent’s account never deletes their invited teens’ data.</p>
      </Section>
      {!done && (
        <Section title="Review checklist">
          <div className={styles.checks}>
            <Checkbox
              label={req.source === 'email' ? 'Identity confirmed: the email came from the registered address' : 'Identity confirmed: the request came from the signed-in account holder'}
              checked={req.checklist.identity}
              onChange={(v) => store.setDeletionCheck(req.id, 'identity', v)}
            />
            <Checkbox label="Legal hold checked" checked={req.checklist.legalHold} onChange={(v) => store.setDeletionCheck(req.id, 'legalHold', v)} />
          </div>
        </Section>
      )}
      <Section title="Internal notes">
        <TextArea label="Internal notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div>
          <Button size="sm" variant="secondary" disabled={notes === req.notes} onClick={() => { store.saveDeletionNote(req.id, notes); toast('Your note has been saved.'); }}>Save note</Button>
        </div>
      </Section>

      {confirm === 'complete' && (
        <ConfirmDialog
          title="Complete deletion?"
          body="Permanently delete this data? This can't be undone."
          confirm="Complete deletion"
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
