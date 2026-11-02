/** @pattern ConfirmDialog — asks before an action that's hard to undo. The confirm label names the action. */
import type { ReactNode } from 'react';
import { Button, Dialog } from '@admin/ui';

export interface ConfirmDialogProps {
  title: string;
  body: ReactNode;
  confirm: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ title, body, confirm, destructive, busy, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Dialog
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={destructive ? 'destructive' : 'primary'} loading={busy} onClick={onConfirm}>{confirm}</Button>
        </>
      }
    >
      {typeof body === 'string' ? <p>{body}</p> : body}
    </Dialog>
  );
}
