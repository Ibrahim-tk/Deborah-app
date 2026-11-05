/** Client drawer dialogs: Change email address (story 3.1) and Deactivate with a reason (story 3.2). */
import { useState } from 'react';
import { teensOf, useAdminStore, type Client } from '@shared/admin';
import { Button, Dialog, Input, TextArea } from '@admin/ui';
import { useSim } from '@admin/hooks/useSim';
import styles from './AccountDialogs.module.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ChangeEmailDialog({ client, onClose }: { client: Client; onClose: () => void }) {
  const clients = useAdminStore((s) => s.clients);
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const sim = useSim();
  const error = !EMAIL.test(email.trim()) ? 'Please enter a valid email address.'
    : clients.some((c) => c.email.toLowerCase() === email.trim().toLowerCase()) ? 'An account with this email address already exists.' : undefined;
  const save = () => {
    setTouched(true);
    if (error) return;
    sim.run(() => { useAdminStore.getState().changeClientEmail(client.id, email.trim()); onClose(); }, `${client.name}’s email address has been changed.`);
  };
  return (
    <Dialog
      title="Change email address"
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={sim.busy} onClick={save}>Change email</Button></>}
    >
      <div className={styles.form}>
        <Input label="New email address" type="email" value={email} error={touched ? error : undefined} onChange={(e) => setEmail(e.target.value)} />
        <p className={styles.note}>
          {`Change ${client.name}’s email address to ${email.trim() || '[new email]'}? They’ll be signed out and asked to verify their new address. Both addresses are notified, and their trusted devices are cleared.`}
        </p>
      </div>
    </Dialog>
  );
}

export function DeactivateDialog({ client, onClose }: { client: Client; onClose: () => void }) {
  const teens = useAdminStore((s) => teensOf(client.id, s.clients).filter((t) => t.teenStatus !== 'invite_sent').length);
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const sim = useSim();
  const confirm = () => {
    setTouched(true);
    if (!reason.trim()) return;
    sim.run(() => { useAdminStore.getState().setClientAccount(client.id, false, reason.trim()); onClose(); }, `${client.name}’s account has been deactivated.`);
  };
  return (
    <Dialog
      title={`Deactivate ${client.name}?`}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="destructive" loading={sim.busy} onClick={confirm}>Deactivate</Button></>}
    >
      <div className={styles.form}>
        <p className={styles.body}>{`Deactivate ${client.name}’s account? They won’t be able to sign in until it’s reactivated. Their information will be kept.`}</p>
        {teens > 0 && <p className={styles.warn}>{`This will also pause access for ${teens} teen account${teens === 1 ? '' : 's'} linked to this account.`}</p>}
        <TextArea label="Reason" value={reason} hint={touched && !reason.trim() ? 'Please add a reason for deactivating this account.' : undefined} onChange={(e) => setReason(e.target.value)} />
      </div>
    </Dialog>
  );
}
