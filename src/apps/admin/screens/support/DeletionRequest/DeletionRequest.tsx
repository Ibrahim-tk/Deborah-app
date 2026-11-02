/**
 * @screen  A-5.2 · Data deletion request
 * @flow    A5 Support request management (compliance)
 * @states  pending (transfers outstanding) · ready to approve · confirm · deleted · rejected
 * @spec    docs/admin/README.md#a-52-data-deletion-request
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { deletionDaysLeft, formatDate, useAdminStore } from '@shared/admin';
import { Button, KeyValueList, StatusText } from '@admin/ui';
import { AdminPage, ConfirmDialog, Section } from '@admin/patterns';
import { useSim } from '@admin/hooks/useSim';
import { DeadlineText } from '../Support/parts/DeletionTable';
import styles from './DeletionRequest.module.css';

export default function DeletionRequest({ requestId }: { requestId: string }) {
  const req = useAdminStore((s) => s.deletionRequests.find((r) => r.id === requestId));
  const client = useAdminStore((s) => s.clients.find((c) => c.id === req?.clientId));
  const [confirm, setConfirm] = useState<'approve' | 'reject' | null>(null);
  const sim = useSim();
  if (!req) return <AdminPage title="Request not found">This request may have been removed.</AdminPage>;

  const pending = req.status === 'pending';
  const waiting = req.decisions.filter((d) => d.action === 'transfer' && d.transfer !== 'accepted');
  const depName = (id: string) => client?.dependents.find((d) => d.id === id)?.name ?? id;
  const decide = (approve: boolean) =>
    sim.run(() => {
      useAdminStore.getState().decideDeletion(req.id, approve);
      setConfirm(null);
    }, approve ? 'Account data deleted' : 'Request rejected', 1200);

  return (
    <AdminPage
      title={`Delete data for ${client?.name ?? 'client'}`}
      subtitle={`Received ${formatDate(req.received)}`}
      action={
        pending && (
          <>
            <Button variant="secondary" onClick={() => setConfirm('reject')}>Reject request</Button>
            <Button variant="destructive" disabled={waiting.length > 0} onClick={() => setConfirm('approve')}>Approve and delete</Button>
          </>
        )
      }
      aside={
        <Section title="Deadline" surface>
          <KeyValueList
            items={[
              { label: 'Regulation', value: req.regulation === 'GDPR' ? 'GDPR (1 month)' : 'CCPA / CPRA (45 days)' },
              { label: 'Status', value: <DeadlineText request={req} /> },
              ...(pending ? [{ label: 'Due', value: `${deletionDaysLeft(req.received, req.regulation)} days from today` }] : []),
            ]}
          />
        </Section>
      }
    >
      {pending && waiting.length > 0 && (
        <p className={styles.blocker} role="status">
          Approve once every dependent transfer is accepted. {waiting.length === 1 ? '1 transfer is' : `${waiting.length} transfers are`} still waiting.
        </p>
      )}
      <Section title="Dependent profiles">
        {req.decisions.length === 0 ? (
          <p className={styles.muted}>No dependent profiles. Only the primary account will be deleted.</p>
        ) : (
          <ul className={styles.list}>
            {req.decisions.map((d) => (
              <li key={d.dependentId} className={styles.row}>
                <span className={styles.depName}>{depName(d.dependentId)}</span>
                {d.action === 'delete' ? (
                  <span className={styles.muted}>Delete with the account</span>
                ) : (
                  <span className={styles.transfer}>
                    <span className={styles.muted} title={d.email}>Transfer to {d.email}</span>
                    {d.transfer === 'accepted' ? (
                      <StatusText tone="success">Ownership accepted</StatusText>
                    ) : (
                      <>
                        <StatusText tone="accent">Invite sent</StatusText>
                        {/* Prototype control: stands in for the new owner accepting by email. */}
                        <Button size="sm" variant="ghost" onClick={() => useAdminStore.getState().acceptTransfer(req.id, d.dependentId)}>
                          Simulate acceptance
                        </Button>
                      </>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section title="What gets deleted">
        <p className={styles.muted}>
          The account, health profile, conversations, documents and any dependent profiles marked for deletion. Transferred profiles move to their new owner first.
        </p>
      </Section>

      {confirm && (
        <ConfirmDialog
          title={confirm === 'approve' ? 'Delete this account?' : 'Reject this request?'}
          body={
            confirm === 'approve'
              ? `${client?.name}'s data is permanently deleted. This can't be undone.`
              : 'The client keeps their account. Email them the reason you rejected it.'
          }
          confirm={confirm === 'approve' ? 'Approve and delete' : 'Reject request'}
          destructive={confirm === 'approve'}
          busy={sim.busy}
          onConfirm={() => decide(confirm === 'approve')}
          onClose={() => setConfirm(null)}
        />
      )}
    </AdminPage>
  );
}
