/**
 * @pattern MedicalConsentSheet — sign-up only, once: before Deborah's first answer, ask for medical/health-data
 *          consent in the shared bottom sheet. The button enables only once the box is ticked (design 2026-10-20).
 * @usedBy  M-2.1 Conversation · M-2.12 First consultation (via useHealthConsent)
 * @status  placeholder copy — OPEN: Deborah / legal to approve wording.
 */
import { useState } from 'react';
import { pronounForms } from '@shared/engine';
import { SELF_PROFILE_ID, selectActiveProfile, useAppStore } from '@shared/store';
import { properName } from '@shared/utils';
import { BottomSheet, Button, Checkbox } from '@mobile/ui';
import styles from './MedicalConsentSheet.module.css';

export interface MedicalConsentSheetProps {
  open: boolean;
  onAgree: () => void;
}

export function MedicalConsentSheet({ open, onAgree }: MedicalConsentSheetProps) {
  const [checked, setChecked] = useState(false);
  // Family member's profile: consent is about them, by first name and their pronouns (copy 2026-10-21).
  const member = useAppStore((s) => {
    const p = selectActiveProfile(s);
    return p && p.id !== SELF_PROFILE_ID && p.name ? p : undefined;
  });
  const name = member ? properName(member.name.trim().split(/\s+/)[0]) : '';
  const their = member ? pronounForms(member.intake?.pronouns).their : '';
  const title = member ? `Can the Oracle use ${name}’s health information?` : 'Can the Oracle use your health information?';
  return (
    <BottomSheet
      open={open}
      onClose={() => {}}
      dismissible={false}
      title={title}
      footer={<Button fullWidth disabled={!checked} onClick={onAgree}>Agree and continue</Button>}
    >
      <div className={styles.body} data-placeholder>
        <p className={styles.copy}>
          {member ? (
            <>To answer your questions about {name}, the Oracle uses what you share about {their} health: </>
          ) : (
            <>To answer your questions, the Oracle uses what you share about your health: </>
          )}
          {/* OPEN: privacy promise removed per docs/copy/voice-tone-ux-copy.md §6 — add a storage/sale line only once legal verifies it. */}
          such as symptoms, medications and history. The Oracle is an AI informed by Deborah Maragopoulos’ experience,
          not Deborah herself. Its guidance is education, not a diagnosis or prescription.
        </p>
        <Checkbox checked={checked} onChange={setChecked} label="I’ve read and agree to the Health Consent" />
      </div>
    </BottomSheet>
  );
}
