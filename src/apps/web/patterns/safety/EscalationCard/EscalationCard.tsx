/**
 * @pattern EscalationCard — the human path: Book a consultation with Deborah · Not now
 * @usedBy  M-2.1 (F08 8.1), M-2.12, widget lab (/wid)
 * @spec    docs/ux/F03-safety.md#pattern--escalationcard-used-by-f08-81
 * @xref    web: apps/web/patterns/safety/EscalationCard — not built
 *
 * Presented as a bottom sheet (design direction 2026-10-14: "more important"), with what she'd get up front:
 * why (optional reasons) and what a consultation is (details). The thread keeps a compact inline record
 * that can reopen the sheet, so the human path is never lost. The spec's actions and labels are unchanged:
 * primary "Book a consultation with Deborah", secondary "Not now".
 * OPEN: the spec places this inline in the thread; confirm the sheet presentation with Deborah.
 */
import { useState } from 'react';
import { BottomSheet, Button, Icon } from '@web/ui';
import styles from './EscalationCard.module.css';

export interface EscalationCardProps {
  body: string;
  /** Short "why a clinician" points, shown as a list. */
  reasons?: string[];
  /** What booking means, e.g. ['30 min', 'Video or phone', 'Next opening Thu 16']. */
  details?: string[];
  dismissed?: boolean;
  /** @deprecated No booking screen any more (2026-10-21); kept so callers compile. */
  onBook?: () => void;
  onDismiss: () => void;
  /** Open as a bottom sheet on arrival (default). `false`: only the inline row; the sheet opens on tap. */
  sheet?: boolean;
}

export function EscalationCard({ dismissed, onBook, onDismiss, sheet = true }: EscalationCardProps) {
  // Request-sent confirmation (designer, 2026-10-21): no booking screen. The sheet confirms that Deborah's team
  // has been emailed and will reach out; its only action is Done, which lets the conversation carry on.
  // OPEN: docs/ux/F03-safety.md still specifies "Book a consultation with Deborah · Not now" — update the spec.
  const [open, setOpen] = useState(sheet && !dismissed);
  const [sent, setSent] = useState(false);
  const request = () => {
    if (!sent) {
      setSent(true);
      onBook?.();
    }
    setOpen(true);
  };
  const done = () => { setOpen(false); if (!dismissed) onDismiss(); };

  return (
    <>
      {/* Booking banner (designer, 2026-10-23): soft gradient, serif heading + line + CTA left, the Oracle right. */}
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.heroTitle}>Book a consultation</p>
          <p className={styles.heroBody}>Want to talk it through with a person? Our support team will reach out to you.</p>
          <Button className={styles.cta} onClick={request}>Book</Button>
        </div>
        {/* Blossom tree on the right, same art as mobile (designer, 2026-10-29) — decorative, in the old portrait slot. */}
        <img src="/images/home/support-tree.webp" alt="" className={styles.tree} />
      </div>
      <BottomSheet open={Boolean(open)} onClose={done}>
        <div className={styles.sheet} role="group" aria-labelledby="escalation-title" data-placeholder>
          <span className={styles.check} aria-hidden><Icon name="check" size={28} /></span>
          <h2 id="escalation-title" className={styles.title}>Request sent</h2>
          <p className={styles.sent}>Your request has been sent. Someone from the support team will contact you soon.</p>
          <div className={styles.actions}>
            <Button fullWidth onClick={done}>Done</Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
