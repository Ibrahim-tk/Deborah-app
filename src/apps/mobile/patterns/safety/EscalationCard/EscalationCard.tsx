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
import { Button, Icon, Overlay } from '@mobile/ui';
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
}

export function EscalationCard({ body, reasons, details, dismissed, onBook, onDismiss }: EscalationCardProps) {
  // Opens on arrival; closing (Not now or the scrim) leaves the inline record.
  const [open, setOpen] = useState(!dismissed);
  const book = () => { setOpen(false); onBook(); };
  const notNow = () => { setOpen(false); if (!dismissed) onDismiss(); };

  return (
    <>
      {/* Inline record: one quiet row that reopens the sheet (design direction 2026-10-14). */}
      <button type="button" className={styles.record} onClick={() => setOpen(true)} data-placeholder>
        <span className={styles.recordIcon} aria-hidden><Icon name="calendar" size={18} /></span>
        <span className={styles.recordText}>
          <span className={styles.recordTitle}>Talk with Deborah directly</span>
          <span className={styles.recordMeta}>{details?.slice(0, 2).join(' · ') || 'Worth a personal look'}</span>
        </span>
        <Icon name="chevron" size={18} className={styles.recordChevron} />
      </button>
      <Overlay>
        {open && (
          <div className={styles.layer}>
            <button type="button" className={styles.scrim} aria-label="Close" onClick={() => setOpen(false)} />
            <div className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="escalation-title" data-placeholder>
              <span className={styles.grabber} aria-hidden />
              <h2 id="escalation-title" className={styles.title}>{body}</h2>
              {reasons && reasons.length > 0 && <ul className={styles.reasons}>{reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
              {details && details.length > 0 && (
                <div className={styles.details} aria-label="About the consultation">
                  {details.map((d) => <span key={d} className={styles.detail}>{d}</span>)}
                </div>
              )}
              <div className={styles.actions}>
                <Button fullWidth leadingIcon="calendar" onClick={book}>Book a consultation with Deborah</Button>
                <Button variant="ghost" fullWidth className={styles.notNow} onClick={notNow}>Not now</Button>
              </div>
            </div>
          </div>
        )}
      </Overlay>
    </>
  );
}
