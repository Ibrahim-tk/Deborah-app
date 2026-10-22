/**
 * M-10.1 · Email: new address → the sign-up 6-digit code step (CodeStep, simulated) → saved (design 2026-10-21).
 * Same BottomSheet pattern as Phone number.
 */
import { useState } from 'react';
import { useAppStore } from '@shared/store';
import { BottomSheet, Button, Input } from '@web/ui';
import { useToast } from '@web/hooks/toast.store';
import { CodeStep } from '@web/screens/plans/CreateAccount/parts/CodeStep';
import styles from '../Account.module.css';

const VALID = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const current = useAppStore((s) => s.accountEmail);
  // Remounted per open (keyed by the parent): starts on the email step with the saved address.
  const [email, setEmail] = useState(current ?? '');
  const [step, setStep] = useState<'email' | 'code'>('email');

  const next = email.trim();
  const ok = VALID.test(next) && next.toLowerCase() !== (current ?? '').toLowerCase();
  const verified = () => {
    useAppStore.getState().updateAccount({ email: next });
    toast('Email updated');
    onClose();
  };

  return (
    <BottomSheet
      showClose
      open={open}
      onClose={onClose}
      title={step === 'email' ? (current ? 'Change email' : 'Add email') : 'Check your email'}
      footer={step === 'email' ? <Button fullWidth disabled={!ok} onClick={() => setStep('code')}>Send code</Button> : undefined}
    >
      {step === 'email' ? (
        <div className={styles.sheetFields}>
          <p className={styles.text}>We’ll send a 6-digit code to confirm the new address.</p>
          <Input label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      ) : (
        <CodeStep email={next} onVerified={verified} onChangeEmail={() => setStep('email')} />
      )}
    </BottomSheet>
  );
}
