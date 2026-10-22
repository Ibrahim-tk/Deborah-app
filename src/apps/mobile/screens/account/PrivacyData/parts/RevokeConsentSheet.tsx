/**
 * M-10.2 · Health data consent (design 2026-10-21): what revoking means, then one destructive action.
 * Revoking clears `healthConsentAt` and marks `healthConsentRevoked`. The next chat start asks again.
 * OPEN: "Terms consent revocation" — not offered; leaving the terms is the Delete account path.
 */
import { BottomSheet, Button } from '@mobile/ui';
import styles from '../PrivacyData.module.css';

export function RevokeConsentSheet({ open, onClose, onRevoke }: { open: boolean; onClose: () => void; onRevoke: () => void }) {
  return (
    <BottomSheet
      showClose
      open={open}
      onClose={onClose}
      title="Revoke health data consent?"
      footer={
        <>
          <Button variant="destructive" fullWidth onClick={onRevoke}>Revoke consent</Button>
          <Button variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
        </>
      }
    >
      <p className={styles.text} data-placeholder>
        Deborah will stop using your symptoms, medications and history in her answers. What you’ve already shared stays
        in your account, but it isn’t used until you agree again. She’ll ask the next time you start a chat.
      </p>
    </BottomSheet>
  );
}
