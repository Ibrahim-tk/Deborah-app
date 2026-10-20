/**
 * @pattern MedicalConsentSheet — sign-up only, once: before Deborah's first answer, ask for medical/health-data
 *          consent in the shared bottom sheet. The button enables only once the box is ticked (design 2026-10-20).
 * @usedBy  M-2.1 Conversation · M-2.12 First consultation (via useHealthConsent)
 * @status  placeholder copy — OPEN: Deborah / legal to approve wording.
 */
import { useState } from 'react';
import { BottomSheet, Button, Checkbox } from '@mobile/ui';
import styles from './MedicalConsentSheet.module.css';

export interface MedicalConsentSheetProps {
  open: boolean;
  onAgree: () => void;
}

export function MedicalConsentSheet({ open, onAgree }: MedicalConsentSheetProps) {
  const [checked, setChecked] = useState(false);
  return (
    <BottomSheet
      open={open}
      onClose={() => {}}
      dismissible={false}
      title="Can Deborah use your health information?"
      footer={<Button fullWidth disabled={!checked} onClick={onAgree}>Agree to terms and conditions</Button>}
    >
      <div className={styles.body} data-placeholder>
        <p className={styles.copy}>
          To answer you, Deborah uses what you share about your health: symptoms, medications and history. It stays private
          to your account and is never sold. Her guidance is education, not a diagnosis or prescription.
        </p>
        <Checkbox checked={checked} onChange={setChecked} label="I accept the terms and conditions" />
      </div>
    </BottomSheet>
  );
}
