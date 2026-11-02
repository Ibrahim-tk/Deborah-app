/** Open/close + simulated send for ContactDialog, shared by client and escalation screens. */
import { useState } from 'react';
import { useAdminStore } from '@shared/admin';
import { useSim } from './useSim';

export function useContact(name: string) {
  const [open, setOpen] = useState(false);
  const { busy, run } = useSim();
  const send = (subject: string) =>
    run(() => {
      useAdminStore.getState().log(`Emailed ${name}: ${subject || 'No subject'}`);
      setOpen(false);
    }, 'Email sent');
  return { open, setOpen, busy, send };
}
