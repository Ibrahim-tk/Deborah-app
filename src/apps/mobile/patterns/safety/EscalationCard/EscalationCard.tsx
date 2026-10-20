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
import { ActionTile, BottomSheet, Button } from '@mobile/ui';
import styles from './EscalationCard.module.css';

export interface EscalationCardProps {
  body: string;
  /** Short "why a clinician" points, shown as a list. */
  reasons?: string[];
  /** What booking means, e.g. ['30 min', 'Video or phone', 'Next opening Thu 16']. */
  details?: string[];
  dismissed?: boolean;
  onBook: () => void;
  onDismiss: () => void;
  /** Open as a bottom sheet on arrival (default). `false`: only the inline row; the sheet opens on tap. */
  sheet?: boolean;
}

export function EscalationCard({ body, reasons, details, dismissed, onBook, onDismiss, sheet = true }: EscalationCardProps) {
  // Opens on arrival; closing (Not now or the scrim) leaves the inline record.
  const [open, setOpen] = useState(sheet && !dismissed);
  const book = () => { setOpen(false); onBook(); };
  const notNow = () => { setOpen(false); if (!dismissed) onDismiss(); };

  return (
    <>
      {/* Inline record: one quiet row that reopens the sheet (design direction 2026-10-14). */}
      <ActionTile className={styles.record} icon="calendar" title="Talk with Deborah directly" meta={details?.slice(0, 2).join(' · ') || 'Worth a personal look'} onClick={() => setOpen(true)} />
      <BottomSheet open={Boolean(open)} onClose={() => setOpen(false)}>
        <div className={styles.sheet} role="group" aria-labelledby="escalation-title" data-placeholder>
          <h2 id="escalation-title" className={styles.title}>{body}</h2>
          {reasons && reasons.length > 0 && <ul className={styles.reasons}>{reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
          {details && details.length > 0 && (
            <div className={styles.details} aria-label="About the consultation">
              {details.map((d) => <span key={d} className={styles.detail}>{d}</span>)}
            </div>
          )}
          <div className={styles.actions}>
            <Button fullWidth leadingIcon="calendar" onClick={book}>Book a consult with Deborah</Button>
            <Button variant="ghost" fullWidth className={styles.notNow} onClick={notNow}>Not now</Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
