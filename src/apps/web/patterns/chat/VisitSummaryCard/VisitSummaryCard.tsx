/**
 * @pattern VisitSummaryCard — "Here's what I noted from your visit": one plain line per filled bucket.
 *          Actions are the QuickReplies under it (Review and save · Looks right, save).
 * @usedBy  M-2.1 (Visit debrief state, message field `visitSummary`)
 * @spec    docs/ux/F09c-log-visit.md › M-2.1 state · Visit debrief
 * @xref    web: apps/web/patterns/chat/VisitSummaryCard — not built
 */
import styles from './VisitSummaryCard.module.css';

export interface VisitSummaryCardProps {
  lines: { label: string; text: string }[];
}

export function VisitSummaryCard({ lines }: VisitSummaryCardProps) {
  if (!lines.length) return <p className={styles.empty}>Nothing noted yet — you can fill it in yourself.</p>;
  return (
    <dl className={styles.root}>
      {lines.map((l) => (
        <div key={l.label} className={styles.line}>
          <dt className={styles.label}>{l.label}</dt>
          <dd className={styles.text}>{l.text}</dd>
        </div>
      ))}
    </dl>
  );
}
