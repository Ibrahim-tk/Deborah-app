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
import { BottomSheet, Button, Icon } from '@mobile/ui';
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

export function EscalationCard({ dismissed, onDismiss, sheet = true }: EscalationCardProps) {
  // Request-sent confirmation (designer, 2026-10-21): no booking screen. The sheet confirms that Deborah's team
  // has been emailed and will reach out; its only action is Done, which lets the conversation carry on.
  // OPEN: docs/ux/F03-safety.md still specifies "Book a consultation with Deborah · Not now" — update the spec.
  const [open, setOpen] = useState(sheet && !dismissed);
  const done = () => { setOpen(false); if (!dismissed) onDismiss(); };

  return (
    <>
      {/* Branded hero card (designer, 2026-10-21): Deborah cut-out on the aurora field, heading, small CTA. */}
      <div className={styles.hero}>
        <img className={styles.portrait} src="/images/deborah/cutout.png" alt="" aria-hidden />
        <div className={styles.heroCopy}>
          <p className={styles.heroTitle}>Talk with Deborah directly</p>
        </div>
        <Button size="sm" className={styles.cta} onClick={() => setOpen(true)}>Talk with Deborah</Button>
      </div>
      <BottomSheet open={Boolean(open)} onClose={done}>
        <div className={styles.sheet} role="group" aria-labelledby="escalation-title" data-placeholder>
          <span className={styles.check} aria-hidden><Icon name="check" size={28} /></span>
          <h2 id="escalation-title" className={styles.title}>Request sent</h2>
          <p className={styles.sent}>Your request has been sent. Someone from Deborah’s team will contact you soon.</p>
          <div className={styles.actions}>
            <Button fullWidth onClick={done}>Done</Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
