/** Invite a new admin by email. The invite link works for 24 hours. */
import { useState } from 'react';
import { useAdminStore, type AdminRole } from '@shared/admin';
import { Button, Dialog, Input, Select } from '@admin/ui';
import { useSim } from '@admin/hooks/useSim';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('admin');
  const [touched, setTouched] = useState(false);
  const { busy, run } = useSim();
  const taken = useAdminStore((s) => s.admins.some((a) => a.email.toLowerCase() === email.trim().toLowerCase()));
  const error = !EMAIL.test(email.trim()) ? 'Enter an email like name@example.com.' : taken ? 'This person already has access.' : '';

  const send = () => {
    setTouched(true);
    if (error || !name.trim()) return;
    run(() => {
      useAdminStore.getState().inviteAdmin(name.trim(), email.trim(), role);
      onClose();
    }, 'Invite sent');
  };

  return (
    <Dialog
      title="Invite admin"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={busy} onClick={send}>Send invite</Button>
        </>
      }
    >
      <p>They'll get an email with a link to set up their account. The link expires in 24 hours.</p>
      <Input label="Full name" value={name} error={touched && !name.trim() ? 'Enter their name.' : undefined} onChange={(e) => setName(e.target.value)} />
      <Input label="Email" type="email" value={email} error={touched ? error || undefined : undefined} onChange={(e) => setEmail(e.target.value)} />
      <Select<AdminRole>
        label="Role"
        value={role}
        onChange={setRole}
        options={[{ value: 'admin', label: 'Admin' }, { value: 'super', label: 'Super admin' }]}
      />
    </Dialog>
  );
}
