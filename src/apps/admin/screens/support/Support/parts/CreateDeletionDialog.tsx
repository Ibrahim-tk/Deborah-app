/** + Create deletion request (story 5.2): only for a teen who can't sign in and emailed the support team from the
 *  address registered to their account. The deadline runs from the date the email was received. */
import { useState } from 'react';
import { ADMIN_NOW, deletionDueDate, formatDate, useAdminStore } from '@shared/admin';
import { Button, Checkbox, DateField, Dialog, Select, TextArea } from '@admin/ui';
import { useSim } from '@admin/hooks/useSim';
import { useAdminNav } from '@admin/navigation';
import styles from './tables.module.css';

export function CreateDeletionDialog({ onClose }: { onClose: () => void }) {
  const teens = useAdminStore((s) => s.clients.filter((c) => c.accountType === 'teen'));
  const [teenId, setTeenId] = useState('');
  const [received, setReceived] = useState(ADMIN_NOW.slice(0, 10));
  const [note, setNote] = useState('');
  const [identity, setIdentity] = useState(false);
  const [touched, setTouched] = useState(false);
  const sim = useSim();
  const teen = teens.find((t) => t.id === teenId);

  const create = () => {
    setTouched(true);
    if (!teenId || !received || !identity) return;
    sim.run(() => {
      const id = useAdminStore.getState().createDeletion(teenId, received, note);
      onClose();
      useAdminNav.getState().openDrawer({ kind: 'deletion', id });
    }, `The deletion request has been created. It’s due by ${formatDate(deletionDueDate(received))}.`);
  };

  return (
    <Dialog
      title="Create deletion request"
      width="md"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={sim.busy} disabled={!identity} onClick={create}>Create</Button>
        </>
      }
    >
      <div className={styles.form}>
        <p className={styles.hint}>For a teen who can&rsquo;t sign in at all and emailed the support team. Requests from anyone else, including the parent, aren&rsquo;t accepted.</p>
        <div>
          <Select label="Teen's account" placeholder="Choose the teen's account" value={teenId || undefined} onChange={setTeenId} options={teens.map((t) => ({ value: t.id, label: `${t.name} · ${t.email}` }))} />
          {touched && !teenId && <p className={styles.error}>Please select the teen&rsquo;s account.</p>}
        </div>
        <DateField label="Date the email was received" today={ADMIN_NOW.slice(0, 10)} max={ADMIN_NOW.slice(0, 10)} value={received} error={touched && !received ? 'Please add the date the email was received.' : undefined} onChange={setReceived} />
        <TextArea label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="For example, where the email came from" />
        <Checkbox
          label={teen ? `The email came from ${teen.email}, the address registered to this account` : 'The email came from the address registered to the teen’s account'}
          checked={identity}
          onChange={setIdentity}
        />
        {!identity && <p className={styles.hint}>If it didn&rsquo;t, reply asking the teen to write from the email address they used to set up their account.</p>}
      </div>
    </Dialog>
  );
}
