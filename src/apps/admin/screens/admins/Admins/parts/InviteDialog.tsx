/** + Add Admin (story 7.2): first name, last name and email, all mandatory. Invites are always for the Admin role,
 *  and the link works once, for 24 hours. */
import { useState } from 'react';
import { useAdminStore } from '@shared/admin';
import { Button, Dialog, Input } from '@admin/ui';
import { useSim } from '@admin/hooks/useSim';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteDialog({ onClose }: { onClose: () => void }) {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const { busy, run } = useSim();
  const taken = useAdminStore((s) => s.admins.some((a) => a.email.toLowerCase() === email.trim().toLowerCase()));
  const nameError = !first.trim() || !last.trim() ? 'Please enter the admin’s first and last name.' : '';
  const emailError = !EMAIL.test(email.trim()) ? 'Please enter a valid email address.' : taken ? 'An admin with this email address already exists.' : '';

  const send = () => {
    setTouched(true);
    if (nameError || emailError) return;
    run(() => {
      useAdminStore.getState().inviteAdmin(first.trim(), last.trim(), email.trim());
      onClose();
    }, `We’ve sent an invite to ${email.trim()}. It’s valid for 24 hours.`);
  };

  return (
    <Dialog
      title="Add admin"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={busy} onClick={send}>Send invite</Button>
        </>
      }
    >
      <p>They&rsquo;ll get an email with a link to set up their account. The link expires in 24 hours.</p>
      <Input label="First name" value={first} onChange={(e) => setFirst(e.target.value)} />
      <Input label="Last name" value={last} error={touched && nameError ? nameError : undefined} onChange={(e) => setLast(e.target.value)} />
      <Input label="Email address" type="email" value={email} error={touched && emailError ? emailError : undefined} onChange={(e) => setEmail(e.target.value)} />
    </Dialog>
  );
}
