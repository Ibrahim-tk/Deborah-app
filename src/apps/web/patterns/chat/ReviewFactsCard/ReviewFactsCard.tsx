/**
 * @pattern ReviewFactsCard — Review and Confirm (meeting 2026-10-12 · B, plan DN-13): what Deborah noted in
 *          this conversation, one row per fact with a checkbox (all ticked to start). Save to my profile saves
 *          the ticked rows and drops the rest; Skip for now drops everything. Nothing reaches
 *          the profile any other way. Resolved: one plain line saying what was saved.
 * @usedBy  M-2.1 (message kind `reviewFacts`)
 * @spec    docs/ux/F02b-profile-aware-chat-intake.md › Review and Confirm
 * @xref    web: apps/web/patterns/chat/ReviewFactsCard — not built
 */
import { useState } from 'react';
import type { PendingFact } from '@shared/types/domain';
import { Button, Checkbox } from '@web/ui';
import styles from './ReviewFactsCard.module.css';

export interface ReviewFactsCardProps {
  /** Every fact noted in the conversation, any status. */
  facts: PendingFact[];
  onConfirm: (keepIds: string[], dropIds: string[]) => void;
  onEdit: () => void;
  onDiscard: (ids: string[]) => void;
}

// `onEdit` stays in the props for callers; the Edit button was removed (design 2026-10-21).
export function ReviewFactsCard({ facts, onConfirm, onDiscard }: ReviewFactsCardProps) {
  const pending = facts.filter((f) => f.status === 'pending');
  const [off, setOff] = useState<string[]>([]);

  // Answered: the app shows a toast (designer, 2026-10-28), so the card leaves the thread instead of a status line.
  if (!pending.length) return null;

  const keep = pending.filter((f) => !off.includes(f.id)).map((f) => f.id);
  const toggle = (id: string, on: boolean) => setOff((xs) => (on ? xs.filter((x) => x !== id) : [...xs, id]));

  return (
    <section className={styles.root} aria-labelledby="review-facts-title">
      {/* Warm copy + Skip / Save row, no × so it doesn't read as a modal (design 2026-10-26). */}
      <div className={styles.intro}>
        <h3 id="review-facts-title" className={styles.title}>Shall I keep these in your health profile?</h3>
        <p className={styles.body}>I noticed a few details as we talked. Saving them helps me tailor what I share next time. Untick anything you’d rather leave out.</p>
      </div>
      <ul className={styles.list}>
        {pending.map((f) => (
          <li key={f.id}>
            <Checkbox size="sm" round checked={!off.includes(f.id)} onChange={(on) => toggle(f.id, on)} label={f.label} description={f.value} />
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        {/* Nothing ticked: saving saves nothing, the same as Don't save (no disabled state, DESIGN.md › Buttons). */}
        <Button variant="ghost" size="lg" onClick={() => onDiscard(pending.map((f) => f.id))}>Skip for now</Button>
        <Button size="lg" onClick={() => onConfirm(keep, off)}>Save to my profile</Button>
      </div>
    </section>
  );
}
