/** M-9.8 › Profile updates: medication rows to confirm, all ticked to start. Nothing applies until Save. */
import type { VisitProfileUpdate } from '@shared/engine';
import { Checkbox } from '@mobile/ui';
import { IntakeSectionHeader } from '@mobile/patterns/widgets';
import styles from '../LogVisit.module.css';

export interface ProfileUpdatesProps {
  updates: VisitProfileUpdate[];
  /** Keys she unticked. */
  off: string[];
  onToggle: (key: string) => void;
}

export function ProfileUpdates({ updates, off, onToggle }: ProfileUpdatesProps) {
  if (!updates.length) return null;
  return (
    <section className={styles.section}>
      <IntakeSectionHeader title="Update my health profile" lede="Ticked changes are saved to your health profile when you save this visit." />
      {updates.map((u) => (
        <Checkbox key={u.key} checked={!off.includes(u.key)} label={u.label} onChange={() => onToggle(u.key)} />
      ))}
    </section>
  );
}
