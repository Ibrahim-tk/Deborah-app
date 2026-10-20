/**
 * Emergency in a scripted chat: Deborah's line stays in the thread and a bottom sheet opens with the F03
 * EmergencyInterrupt (Call 911 · Find nearest ER · I'm safe). It can't be swiped away. Calling (simulated)
 * or "I'm safe" closes it and the script continues with `onDone`.
 */
import { useState } from 'react';
import { BottomSheet } from '@mobile/ui';
import { EmergencyInterrupt } from '@mobile/patterns/safety';
import { useToast } from '@mobile/hooks/toast.store';

export interface EmergencySheetProps {
  title: string;
  text: string;
  active: boolean;
  onDone: () => void;
}

export function EmergencySheet({ title, text, active, onDone }: EmergencySheetProps) {
  const toast = useToast();
  const [open, setOpen] = useState(true);
  const close = () => {
    setOpen(false);
    onDone();
  };
  return (
    <BottomSheet open={open && active} onClose={close} dismissible={false} label={title}>
      <EmergencyInterrupt
        title={title}
        body={text}
        onCall={() => { toast('Calling 911 (simulated)'); close(); }}
        onFindER={() => toast('Finding the nearest ER (simulated)')}
        onSafe={close}
      />
    </BottomSheet>
  );
}
