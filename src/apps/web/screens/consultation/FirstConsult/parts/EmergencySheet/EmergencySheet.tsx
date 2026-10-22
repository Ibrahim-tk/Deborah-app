/**
 * Emergency in a scripted chat: Deborah's line stays in the thread and a bottom sheet opens.
 * The full sheet is the F03 EmergencyInterrupt (Call 911 · Find nearest ER · I'm safe).
 * `secondary` is the small sheet: Call 911, and that label as the other button. It can't be swiped away.
 * Calling is simulated and leaves the sheet open. The secondary button closes it and continues with `onDone`.
 */
import { useState } from 'react';
import { BottomSheet, Button } from '@web/ui';
import { EmergencyInterrupt } from '@web/patterns/safety';
import { useToast } from '@web/hooks/toast.store';
import styles from './EmergencySheet.module.css';

export interface EmergencySheetProps {
  title: string;
  text: string;
  active: boolean;
  onDone: () => void;
  /** When set, a short sheet: Call 911, then this label. */
  secondary?: string;
}

export function EmergencySheet({ title, text, active, onDone, secondary }: EmergencySheetProps) {
  const toast = useToast();
  const [open, setOpen] = useState(true);
  const close = () => {
    setOpen(false);
    onDone();
  };
  return (
    <BottomSheet open={open && active} onClose={close} dismissible={false} title={secondary ? title : undefined} label={title}>
      {secondary ? (
        <div className={styles.stack}>
          {text ? <p className={styles.body}>{text}</p> : null}
          <Button variant="emergency" fullWidth leadingIcon="phone" onClick={() => toast('Calling 911 (simulated)')}>Call 911</Button>
          <Button variant="secondary" fullWidth onClick={close}>{secondary}</Button>
        </div>
      ) : (
        <EmergencyInterrupt
          title={title}
          body={text}
          onCall={() => { toast('Calling 911 (simulated)'); close(); }}
          onFindER={() => toast('Finding the nearest ER (simulated)')}
          onSafe={close}
        />
      )}
    </BottomSheet>
  );
}
