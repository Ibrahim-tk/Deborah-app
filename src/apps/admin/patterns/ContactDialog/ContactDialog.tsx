/** @pattern ContactDialog — compose an email to a client. The screen owns sending (simulated) and the toast. */
import { useState } from 'react';
import { Button, Dialog, Input, TextArea } from '@admin/ui';

export interface ContactDialogProps {
  name: string;
  email: string;
  subject?: string;
  busy?: boolean;
  onSend: (subject: string) => void;
  onClose: () => void;
}

export function ContactDialog({ name, email, subject: initial = '', busy, onSend, onClose }: ContactDialogProps) {
  const [subject, setSubject] = useState(initial);
  const [body, setBody] = useState('');
  return (
    <Dialog
      title={`Email ${name}`}
      width="md"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={busy} disabled={!body.trim()} onClick={() => onSend(subject)}>Send email</Button>
        </>
      }
    >
      <Input label="To" value={email} readOnly />
      <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <TextArea label="Message" value={body} minRows={5} onChange={(e) => setBody(e.target.value)} />
    </Dialog>
  );
}
