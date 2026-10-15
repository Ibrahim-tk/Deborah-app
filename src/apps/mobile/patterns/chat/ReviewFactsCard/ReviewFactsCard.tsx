/**
 * @pattern ReviewFactsCard — Review and Confirm (meeting 2026-10-12 · B, plan DN-13): what Deborah noted in
 *          this conversation, one row per fact with a checkbox (all ticked to start). Save to my profile saves
 *          the ticked rows and drops the rest; Edit opens M-2.13; Don't save drops everything. Nothing reaches
 *          the profile any other way. Resolved: one plain line saying what was saved.
 * @usedBy  M-2.1 (message kind `reviewFacts`)
 * @spec    docs/ux/F02b-profile-aware-chat-intake.md › Review and Confirm
 * @xref    web: apps/web/patterns/chat/ReviewFactsCard — not built
 */
import { useState } from 'react';
import type { PendingFact } from '@shared/types/domain';
import { Button, Checkbox, Icon } from '@mobile/ui';
import styles from './ReviewFactsCard.module.css';

export interface ReviewFactsCardProps {
  /** Every fact noted in the conversation, any status. */
  facts: PendingFact[];
  onConfirm: (keepIds: string[], dropIds: string[]) => void;
  onEdit: () => void;
  onDiscard: (ids: string[]) => void;
}

export function ReviewFactsCard({ facts, onConfirm, onEdit, onDiscard }: ReviewFactsCardProps) {
  const pending = facts.filter((f) => f.status === 'pending');
  const [off, setOff] = useState<string[]>([]);

  if (!pending.length) {
    const saved = facts.filter((f) => f.status === 'confirmed');
    return (
      <p className={styles.note} role="status">
        <Icon name="check" size={16} />
        {saved.length ? `Saved to your health profile: ${saved.map((f) => f.label.toLowerCase()).join(', ')}.` : 'Nothing from this conversation was saved to your profile.'}
      </p>
    );
  }

  const keep = pending.filter((f) => !off.includes(f.id)).map((f) => f.id);
  const toggle = (id: string, on: boolean) => setOff((xs) => (on ? xs.filter((x) => x !== id) : [...xs, id]));

  return (
    <section className={styles.root} aria-labelledby="review-facts-title">
      <div className={styles.intro}>
        <h3 id="review-facts-title" className={styles.title}>Add this to your health profile?</h3>
        <p className={styles.body}>I noted these while we talked. Nothing is saved until you say so.</p>
      </div>
      <ul className={styles.list}>
        {pending.map((f) => (
          <li key={f.id}>
            <Checkbox checked={!off.includes(f.id)} onChange={(on) => toggle(f.id, on)} label={f.label} description={f.value} />
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        {/* Nothing ticked: saving saves nothing, the same as Don't save (no disabled state, DESIGN.md › Buttons). */}
        <Button fullWidth onClick={() => onConfirm(keep, off)}>Save to my profile</Button>
        <Button variant="secondary" fullWidth onClick={onEdit}>Edit</Button>
        <Button variant="link" onClick={() => onDiscard(pending.map((f) => f.id))}>Don’t save</Button>
      </div>
    </section>
  );
}
