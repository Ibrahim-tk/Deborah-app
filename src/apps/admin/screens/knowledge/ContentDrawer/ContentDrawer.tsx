/**
 * @screen  A-13.2 · Knowledge Base content (side drawer)
 * @flow    A13 Knowledge Base management (stories 6.1 and 6.2)
 * @states  draft · pending (approve / reject — Super Admin only) · published · rejected · archived · editing · new · answer to a gap
 * @spec    docs/admin/stories.md#61---view--edit-knowledge-base-content
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { CONTENT_STATUS, contentText, formatDate, useAdminStore, useKnowledge } from '@shared/admin';
import { Button, Drawer, KeyValueList, TextArea } from '@admin/ui';
import { ConfirmDialog, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import { ContentForm } from './ContentForm';
import styles from './ContentDrawer.module.css';

type Confirm = null | 'reject' | 'archive' | { rollBack: number };

export default function ContentDrawer({ id }: { id: string | null }) {
  const gapId = id?.startsWith('new:') ? id.slice(4) : undefined;
  const item = useKnowledge((s) => s.items.find((c) => c.id === id));
  const gap = useKnowledge((s) => s.gaps.find((g) => g.id === (gapId ?? item?.gapId)));
  const isSuper = useAdminStore((s) => s.role === 'super');
  const close = useAdminNav((s) => s.closeDrawer);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const sim = useSim();

  if (!item) return <ContentForm gap={gapId ? gap : undefined} onCancel={close} />;
  if (editing) return <ContentForm item={item} onCancel={() => setEditing(false)} />;

  const kb = useKnowledge.getState();
  const reject = () => {
    if (!reason.trim()) return setTouched(true);
    sim.run(() => { kb.reject(item.id, reason.trim()); setConfirm(null); }, 'This content has been rejected.');
  };

  return (
    <Drawer
      title={item.title}
      subtitle={`${item.type} · version ${item.version} · ${CONTENT_STATUS[item.status]}`}
      onClose={close}
      actions={
        <>
          {item.status === 'pending' && isSuper && (
            <>
              <Button size="sm" loading={sim.busy} onClick={() => sim.run(() => kb.approve(item.id), 'This content has been published. The Oracle will start using it shortly.')}>Approve &amp; publish</Button>
              <Button size="sm" variant="secondary" onClick={() => setConfirm('reject')}>Reject</Button>
            </>
          )}
          <Button size="sm" variant={item.status === 'pending' && isSuper ? 'ghost' : 'secondary'} onClick={() => setEditing(true)}>Edit</Button>
          {item.status === 'archived' ? (
            <Button size="sm" variant="ghost" onClick={() => sim.run(() => kb.restore(item.id), 'This content has been restored.')}>Restore</Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirm('archive')}>Archive</Button>
          )}
        </>
      }
    >
      <Section title="Details">
        <KeyValueList
          items={[
            { label: 'Status', value: CONTENT_STATUS[item.status] },
            { label: 'Source', value: item.source },
            { label: 'Last updated', value: formatDate(item.updated) },
            ...(item.rejectReason && item.status === 'rejected' ? [{ label: 'Rejected because', value: item.rejectReason }] : []),
            ...(gap ? [{ label: 'Answers the gap', value: gap.question }] : []),
            ...(item.wellness ? [{ label: 'Wellness Plan', value: 'Shown to Clients as a Wellness Protocol' }] : []),
          ]}
        />
        {item.status === 'pending' && !isSuper && <p className={styles.note}>Waiting for the Super Admin to approve it. The Oracle doesn&rsquo;t use it yet.</p>}
      </Section>
      <Section title="Content">
        <p className={styles.text}>{contentText(item)}</p>
      </Section>
      <Section title="Version history">
        <ul className={styles.history}>
          {[...item.history].reverse().map((h) => (
            <li key={h.version} className={styles.version}>
              <span className={styles.vName}>Version {h.version}{h.version === item.version ? ' · current' : ''}</span>
              <span className={styles.meta}>{h.by} · {formatDate(h.at)}</span>
              {h.version !== item.version && <Button size="sm" variant="ghost" onClick={() => setConfirm({ rollBack: h.version })}>Roll back</Button>}
            </li>
          ))}
        </ul>
      </Section>

      {confirm === 'reject' && (
        <ConfirmDialog
          title="Reject this content?"
          body={<TextArea label="Reason" value={reason} hint={touched && !reason.trim() ? 'Please add a reason for rejecting this content.' : undefined} onChange={(e) => setReason(e.target.value)} />}
          confirm="Reject"
          destructive
          busy={sim.busy}
          onConfirm={reject}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === 'archive' && (
        <ConfirmDialog
          title="Archive this content?"
          body="Archive this content? The Oracle will stop using it, but you can restore it later."
          confirm="Archive"
          busy={sim.busy}
          onConfirm={() => sim.run(() => { kb.archive(item.id); setConfirm(null); }, 'This content has been archived.')}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm && typeof confirm === 'object' && (
        <ConfirmDialog
          title="Roll back?"
          body={`Publish version ${confirm.rollBack} instead of the current version?`}
          confirm="Roll back"
          busy={sim.busy}
          onConfirm={() => sim.run(() => { kb.rollBack(item.id, confirm.rollBack); setConfirm(null); }, isSuper ? 'This content has been published.' : 'Your content has been sent to the Super Admin for approval.')}
          onClose={() => setConfirm(null)}
        />
      )}
    </Drawer>
  );
}
