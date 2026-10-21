/** M-10.1 · Name: first + last in the shared BottomSheet, same pattern as Phone number (design 2026-10-21). */
import { useState } from 'react';
import { useAppStore } from '@shared/store';
import { BottomSheet, Button, Input } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import styles from '../Account.module.css';

export function NameSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const first = useAppStore((s) => s.userName);
  const last = useAppStore((s) => s.accountLastName);
  // Remounted per open (keyed by the parent), so the draft starts from the saved name.
  const [draft, setDraft] = useState({ first: first ?? '', last: last ?? '' });

  const save = () => {
    useAppStore.getState().updateAccount({ firstName: draft.first, lastName: draft.last });
    toast('Name updated');
    onClose();
  };

  return (
    <BottomSheet showClose open={open} onClose={onClose} title="Name" footer={<Button fullWidth disabled={!draft.first.trim()} onClick={save}>Save</Button>}>
      <div className={styles.sheetFields}>
        <Input label="First name" value={draft.first} autoCapitalize="words" autoComplete="given-name" onChange={(e) => setDraft((d) => ({ ...d, first: e.target.value }))} />
        <Input label="Last name (optional)" value={draft.last} autoCapitalize="words" autoComplete="family-name" onChange={(e) => setDraft((d) => ({ ...d, last: e.target.value }))} />
      </div>
    </BottomSheet>
  );
}
