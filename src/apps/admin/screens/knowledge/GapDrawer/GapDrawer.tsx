/**
 * @screen  A-13.4 · Knowledge gap (side drawer)
 * @flow    A13 Knowledge Base management (story 6.3)
 * @states  new · answered · dismissed (with reason) · reopened
 * @spec    docs/admin/stories.md#63---get-alerted-to-knowledge-gaps
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { GAP_STATUS, formatDate, useKnowledge } from '@shared/admin';
import { Button, Drawer, KeyValueList, TextArea } from '@admin/ui';
import { ConfirmDialog, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import s from '@admin/screens/common/drawer/drawer.module.css';

/** Only the question shows; the Client's details live in the linked support request (story 5.1). */
export default function GapDrawer({ id }: { id: string }) {
  const gap = useKnowledge((st) => st.gaps.find((g) => g.id === id));
  const answer = useKnowledge((st) => st.items.find((c) => c.gapId === id));
  const { closeDrawer, openDrawer } = useAdminNav.getState();
  const [dismissing, setDismissing] = useState(false);
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const sim = useSim();
  if (!gap) return null;
  const kb = useKnowledge.getState();

  return (
    <Drawer
      title={gap.question}
      subtitle={`${gap.topic} · asked ${gap.timesAsked} times`}
      onClose={closeDrawer}
      actions={
        gap.status === 'new' ? (
          <>
            <Button size="sm" onClick={() => openDrawer({ kind: 'content', id: `new:${gap.id}` })}>Add answer</Button>
            <Button size="sm" variant="secondary" onClick={() => setDismissing(true)}>Dismiss</Button>
          </>
        ) : (
          <Button size="sm" variant="secondary" loading={sim.busy} onClick={() => sim.run(() => kb.reopenGap(gap.id), 'This gap has been reopened.')}>Reopen</Button>
        )
      }
    >
      <Section title="Gap">
        <KeyValueList
          items={[
            { label: 'Status', value: GAP_STATUS[gap.status] },
            { label: 'Topic', value: gap.topic },
            { label: 'Times asked', value: gap.timesAsked },
            { label: 'First asked', value: formatDate(gap.firstAsked) },
            { label: 'Last asked', value: formatDate(gap.lastAsked) },
            ...(gap.dismissReason ? [{ label: 'Dismissed because', value: gap.dismissReason }] : []),
            ...(answer ? [{ label: 'Answer', value: <button type="button" className={s.link} onClick={() => openDrawer({ kind: 'content', id: answer.id })}>{answer.title}</button> }] : []),
          ]}
        />
        <p className={s.note}>Similar questions are grouped into one gap. The Client&rsquo;s details are only in the linked support request.</p>
      </Section>
      {dismissing && (
        <ConfirmDialog
          title="Dismiss this gap?"
          body={<TextArea label="Reason" placeholder="For example, Outside the scope of Your Oracle" value={reason} hint={touched && !reason.trim() ? 'Please add a reason for dismissing this gap.' : undefined} onChange={(e) => setReason(e.target.value)} />}
          confirm="Dismiss"
          busy={sim.busy}
          onConfirm={() => (reason.trim() ? sim.run(() => { kb.dismissGap(gap.id, reason.trim()); setDismissing(false); }, 'This gap has been dismissed.') : setTouched(true))}
          onClose={() => setDismissing(false)}
        />
      )}
    </Drawer>
  );
}
