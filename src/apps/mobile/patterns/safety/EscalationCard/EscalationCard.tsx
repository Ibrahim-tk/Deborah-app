/**
 * @pattern EscalationCard — the human path: Book a consultation with Deborah · Not now
 * @usedBy  M-2.1 (F08 8.1)
 * @spec    docs/ux/F03-safety.md#pattern--escalationcard-used-by-f08-81
 * @xref    web: apps/web/patterns/safety/EscalationCard — not built
 */
import { Button } from '@mobile/ui';
import styles from './EscalationCard.module.css';

export interface EscalationCardProps {
  body: string;
  dismissed?: boolean;
  onBook: () => void;
  onDismiss: () => void;
}

export function EscalationCard({ body, dismissed, onBook, onDismiss }: EscalationCardProps) {
  return (
    <div className={styles.root} data-placeholder>
      <p className={styles.body}>{body}</p>
      <Button fullWidth leadingIcon="calendar" onClick={onBook}>Book a consultation with Deborah</Button>
      {!dismissed && <Button variant="ghost" fullWidth onClick={onDismiss}>Not now</Button>}
    </div>
  );
}
