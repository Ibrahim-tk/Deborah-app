/** + New version (story 9.2): prefilled with the live text, version number set automatically, summary of changes
 *  required. Save as draft, Preview (as Clients see the Policy Update screen) or Publish. */
import { useState } from 'react';
import { liveVersion, nextVersion, usePolicies, type Policy } from '@shared/admin';
import { Button, Dialog, Drawer, Input, TextArea } from '@admin/ui';
import { ConfirmDialog, UnsavedChangesDialog } from '@admin/patterns';
import { useSim } from '@admin/hooks/useSim';
import styles from '../ConsentDrawer.module.css';

export function VersionForm({ policy, onDone }: { policy: Policy; onDone: () => void }) {
  const [text, setText] = useState(policy.draft?.text ?? liveVersion(policy).text);
  const [summary, setSummary] = useState(policy.draft?.summary ?? '');
  const [touched, setTouched] = useState(false);
  const [mode, setMode] = useState<null | 'preview' | 'publish'>(null);
  const sim = useSim();
  const [start] = useState(() => ({ text, summary }));
  const dirty = text !== start.text || summary !== start.summary;
  const [leaving, setLeaving] = useState(false);
  const version = nextVersion(policy);
  const errors = { text: !text.trim() ? 'Please add the policy text.' : undefined, summary: !summary.trim() ? 'Please add a short summary of what’s changed.' : undefined };
  const store = usePolicies.getState();

  const publish = () =>
    sim.run(() => { store.publish(policy.id, text.trim(), summary.trim()); setMode(null); onDone(); }, `Version ${version} of the ${policy.name} is now live. Clients have been emailed.`, 1200);

  return (
    <Drawer
      title={`${policy.name} · version ${version}`}
      subtitle={policy.draft ? 'Draft' : 'New version'}
      onClose={() => (dirty ? setLeaving(true) : onDone())}
      actions={
        <>
          <Button size="sm" onClick={() => { setTouched(true); if (!errors.text && !errors.summary) setMode('publish'); }}>Publish</Button>
          <Button size="sm" variant="secondary" loading={sim.busy} onClick={() => sim.run(() => { store.saveDraft(policy.id, text, summary); onDone(); }, 'Your draft has been saved.')}>Save as draft</Button>
          <Button size="sm" variant="ghost" onClick={() => setMode('preview')}>Preview</Button>
        </>
      }
    >
      <div className={styles.form}>
        <Input label="Version number" value={version} disabled />
        <TextArea label="Summary of changes (shown to Clients)" value={summary} minRows={2} hint={touched ? errors.summary : undefined} onChange={(e) => setSummary(e.target.value)} />
        <TextArea label="Policy text" value={text} minRows={14} hint={touched ? errors.text : undefined} onChange={(e) => setText(e.target.value)} />
      </div>
      {mode === 'preview' && (
        <Dialog title="Preview: Policy update" width="md" onClose={() => setMode(null)} footer={<Button variant="secondary" onClick={() => setMode(null)}>Close preview</Button>}>
          <div className={styles.preview}>
            <h3 className={styles.previewTitle}>We&rsquo;ve updated our {policy.name}</h3>
            <p>{summary || 'Your summary of changes appears here.'}</p>
            <p className={styles.text}>{text}</p>
            <Button disabled>Accept and continue</Button>
          </div>
        </Dialog>
      )}
      {mode === 'publish' && (
        <ConfirmDialog
          title="Publish this version?"
          body={`Publish version ${version} of the ${policy.name}? Every Client will be asked to accept it before they can continue.`}
          confirm="Publish"
          busy={sim.busy}
          onConfirm={publish}
          onClose={() => setMode(null)}
        />
      )}
      {leaving && <UnsavedChangesDialog onLeave={onDone} onStay={() => setLeaving(false)} />}
    </Drawer>
  );
}
