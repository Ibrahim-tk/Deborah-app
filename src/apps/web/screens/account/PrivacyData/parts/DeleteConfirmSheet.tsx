/**
 * Private part of M-10.2: step 2 of account deletion — typed confirmation ("Type DELETE").
 * Uses the shared ui/BottomSheet (drag, scrim tap or Escape closes).
 */
import { useState } from 'react';
import { BottomSheet, Button, Input, Sheet } from '@web/ui';
import styles from './DeleteConfirmSheet.module.css';

const WORD = 'DELETE';

export interface DeleteConfirmSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmSheet({ open, onClose, onConfirm }: DeleteConfirmSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} label="Confirm account deletion" bare>
      <ConfirmSheet onClose={onClose} onConfirm={onConfirm} />
    </BottomSheet>
  );
}

/** Mounted only while open, so the typed value starts empty every time. */
function ConfirmSheet({ onClose, onConfirm }: Omit<DeleteConfirmSheetProps, 'open'>) {
  const [value, setValue] = useState('');
  return (
    <Sheet
      title="Delete everything"
      footer={
        <>
          <Button variant="destructive" fullWidth disabled={value !== WORD} onClick={onConfirm}>
            Delete my account and all data
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
        </>
      }
    >
      <div className={styles.body}>
        <p className={styles.text}>
          This deletes your account, every profile and all of your history. Deletion is certified within 30 days. It can’t be
          undone.
        </p>
        <Input
          label={`Type ${WORD} to confirm`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          autoFocus
        />
      </div>
    </Sheet>
  );
}
