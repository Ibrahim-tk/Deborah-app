/**
 * @screen  A-13.2 · Knowledge Base content (side drawer)
 * @flow    A13 Knowledge Base management (stories 6.1 and 6.2)
 * @states  draft · waiting for approval (approve / send back — Super Admin only) · live · sent back · archived · result banner
 * @spec    docs/admin/stories.md#61---view--edit-knowledge-base-content
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { CONTENT_STATUS, contentText, formatDate, useAdminStore, useKnowledge } from '@shared/admin';
import { Button, Drawer, FileTile, IconButton, KeyValueList, StatusText, TextArea } from '@admin/ui';
import { useAdminToast } from '@admin/hooks/toast.store';
import { CONTENT_TONE, ConfirmDialog, ResultBanner, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import { openEditor } from '../ContentEditor/open';
import styles from './ContentDrawer.module.css';

type Confirm = null | 'reject' | 'archive' | { rollBack: number };

/** One plain line on what this means for the Oracle right now. */
function whereItStands(status: string, updated: string) {
  if (status === 'published') return `Live since ${formatDate(updated)}. The Oracle uses it to answer Clients.`;
  if (status === 'pending') return 'Not live yet. It’s waiting for the Super Admin’s approval.';
  if (status === 'draft') return 'Not live yet. It’s a draft only you can see here.';
  if (status === 'rejected') return 'Not live. It was sent back with a reason below.';
  return 'Archived. The Oracle doesn’t use it, but you can restore it at any time.';
}

export default function ContentDrawer({ id }: { id: string | null }) {
  const item = useKnowledge((s) => s.items.find((c) => c.id === id));
  const gap = useKnowledge((s) => s.gaps.find((g) => g.id === item?.gapId));
  const notice = useKnowledge((s) => s.notice);
  const isSuper = useAdminStore((s) => s.role === 'super');
  const close = useAdminNav((s) => s.closeDrawer);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const sim = useSim();
  const toast = useAdminToast();

  if (!item) return null;

  const kb = useKnowledge.getState();
  const name = `“${item.title}”`;
  // Every action ends with a sentence that stays on screen (not a vanishing toast).
  const act = (fn: () => void, message: string) => sim.run(() => { fn(); kb.setNotice(message); setConfirm(null); });
  const sendBack = () => (reason.trim() ? act(() => kb.reject(item.id, reason.trim()), `${name} was sent back. It isn’t live.`) : setTouched(true));
  const earlier = item.history.filter((h) => h.version !== item.version).reverse();

  return (
    <Drawer
      title={item.title}
      subtitle={item.type}
      meta={<StatusText tone={CONTENT_TONE[item.status]}>{CONTENT_STATUS[item.status]}</StatusText>}
      onClose={() => { kb.setNotice(''); close(); }}
      headerControls={<IconButton icon="edit" label="Edit" onClick={() => openEditor(item.id)} />}
      actions={
        <>
          {item.status === 'archived' ? (
            <Button size="sm" variant="ghost" onClick={() => act(() => kb.restore(item.id), `${name} is restored and live again.`)}>Restore</Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirm('archive')}>Archive</Button>
          )}
          {item.status === 'pending' && isSuper && <Button size="sm" variant="secondary" onClick={() => setConfirm('reject')}>Send back</Button>}
          {item.status === 'pending' && isSuper && (
            <Button size="sm" loading={sim.busy} onClick={() => act(() => kb.approve(item.id), `${name} is now live. The Oracle will start using it shortly.`)}>Approve and make live</Button>
          )}
        </>
      }
    >
      <ResultBanner message={notice} onDismiss={() => kb.setNotice('')} />
      <p className={styles.stands}>{whereItStands(item.status, item.updated)}</p>
      <Section title="Details">
        <KeyValueList
          items={[
            { label: 'Last changed', value: formatDate(item.updated) },
            { label: 'Edits', value: item.version === 1 ? 'Original' : `${item.version - 1}` },
            ...(item.rejectReason && item.status === 'rejected' ? [{ label: 'Sent back because', value: item.rejectReason }] : []),
            ...(gap ? [{ label: 'Answers the question', value: gap.question }] : []),
            ...(item.wellness ? [{ label: 'Wellness Plan', value: 'Also shown to Clients in their Wellness Plan' }] : []),
          ]}
        />
      </Section>
      <Section title="Content">
        {/* Uploaded content shows as a file tile; typed content shows as text. */}
        {contentText(item).startsWith('Uploaded file: ') ? (
          <FileTile
            name={contentText(item).slice('Uploaded file: '.length)}
            detail={`Uploaded ${formatDate(item.updated)}`}
            onDownload={() => toast('Download started')}
            onOpen={() => toast('Opening the file in a new tab')}
          />
        ) : (
          <p className={styles.text}>{contentText(item)}</p>
        )}
      </Section>
      {earlier.length > 0 && (
        <Section title="Earlier versions">
          <Button variant="link" className={styles.linkBtn} aria-expanded={showHistory} onClick={() => setShowHistory((v) => !v)}>
            {showHistory ? 'Hide earlier versions' : `Show earlier versions (${earlier.length})`}
          </Button>
          {showHistory && (
            <ul className={styles.history}>
              {earlier.map((h) => (
                <li key={h.version} className={styles.version}>
                  <span className={styles.vName}>{h.version === 1 ? 'Original' : `Edit ${h.version - 1}`}</span>
                  <span className={styles.meta}>{h.by} · {formatDate(h.at)}</span>
                  <Button size="sm" variant="ghost" onClick={() => setConfirm({ rollBack: h.version })}>Restore this version</Button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {confirm === 'reject' && (
        <ConfirmDialog
          title={`Send back ${name}?`}
          body={<TextArea label="Why is it being sent back?" value={reason} hint={touched && !reason.trim() ? 'Please add a reason for rejecting this content.' : undefined} onChange={(e) => setReason(e.target.value)} />}
          confirm="Send back"
          destructive
          busy={sim.busy}
          onConfirm={sendBack}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === 'archive' && (
        <ConfirmDialog
          title={`Archive ${name}?`}
          body="The Oracle will stop using it. You can restore it later."
          confirm="Archive"
          busy={sim.busy}
          onConfirm={() => act(() => kb.archive(item.id), `${name} is archived. The Oracle no longer uses it.`)}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm && typeof confirm === 'object' && (
        <ConfirmDialog
          title="Restore this version?"
          body={`Use ${confirm.rollBack === 1 ? 'the original' : `edit ${confirm.rollBack - 1}`} of ${name} instead of the current text?`}
          confirm="Restore this version"
          busy={sim.busy}
          onConfirm={() => act(() => kb.rollBack(item.id, confirm.rollBack), isSuper ? `${name} is back to the earlier version and live.` : `${name}’s earlier version was sent for approval.`)}
          onClose={() => setConfirm(null)}
        />
      )}
    </Drawer>
  );
}
