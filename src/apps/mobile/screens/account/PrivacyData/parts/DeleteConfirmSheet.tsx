/**
 * Private part of M-10.2: step 2 of account deletion — typed confirmation ("Type DELETE").
 * Rendered through the phone's overlay host (scrim + Sheet surface); Escape or scrim closes.
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, Button, DURATION, EASE_IOS, Input, MotionDiv, Overlay, REDUCED_FADE, Sheet, useReducedMotionPref } from '@mobile/ui';
import styles from './DeleteConfirmSheet.module.css';

const WORD = 'DELETE';

export interface DeleteConfirmSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmSheet({ open, onClose, onConfirm }: DeleteConfirmSheetProps) {
  const reduced = useReducedMotionPref();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const slide = reduced
    ? REDUCED_FADE
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: { duration: DURATION.sheet, ease: EASE_IOS } };

  return (
    <Overlay>
      <AnimatePresence>
        {open && (
          <div className={styles.root} key="delete-confirm">
            <MotionDiv className={styles.scrim} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: DURATION.base }} />
            <MotionDiv className={styles.panel} role="dialog" aria-modal="true" aria-label="Confirm account deletion" {...slide}>
              <ConfirmSheet onClose={onClose} onConfirm={onConfirm} />
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </Overlay>
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
