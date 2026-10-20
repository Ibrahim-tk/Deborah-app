/**
 * @pattern CareDisclaimer — one quiet line above the first chat: "Not a substitute for
 *          professional care…". Dismissible, shown once (also retired by the first message).
 * @usedBy  M-2.1 (empty state)
 * @spec    docs/ux/F01-onboarding.md#m-21--first-chat-disclaimer
 * @xref    web: apps/web/patterns/chat/CareDisclaimer — not built
 */
import { Icon, IconButton } from '@mobile/ui';
import styles from './CareDisclaimer.module.css';

export interface CareDisclaimerProps {
  text: string;
  onDismiss: () => void;
}

export function CareDisclaimer({ text, onDismiss }: CareDisclaimerProps) {
  return (
    <div className={styles.root} role="note">
      <Icon name="info" size={18} className={styles.icon} />
      <p className={styles.text}>{text}</p>
      {/* A small grey × (design 2026-10-20) — never a word button. */}
      <IconButton icon="close" size="sm" label="Dismiss" onClick={onDismiss} className={styles.close} />
    </div>
  );
}
