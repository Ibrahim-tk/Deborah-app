/** M-6.5 Basics: name, age, relationship — read rows, or fields while editing. */
import type { Relationship } from '@shared/types/domain';
import { Input, ListRow, Select } from '@mobile/ui';
import { RELATIONSHIP_LABELS } from '@mobile/patterns/profile';
import type { ProfileDraft } from './draft';
import styles from '../ProfileDetails.module.css';

const RELATIONS = (Object.keys(RELATIONSHIP_LABELS) as Relationship[])
  .filter((r) => r !== 'self')
  .map((r) => ({ value: r, label: RELATIONSHIP_LABELS[r] }));

export interface BasicsSectionProps {
  draft: ProfileDraft;
  editing: boolean;
  isSelf: boolean;
  ageText: string;
  today: string;
  onChange: (patch: Partial<ProfileDraft>) => void;
}

export function BasicsSection({ draft, editing, isSelf, ageText, today, onChange }: BasicsSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="basics-h">
      <h2 id="basics-h" className={styles.heading}>Basics</h2>
      {editing ? (
        <div className={styles.fields}>
          <Input label="First name" value={draft.name} onChange={(e) => onChange({ name: e.target.value })} />
          <Input label="Date of birth" type="date" max={today} value={draft.dob} onChange={(e) => onChange({ dob: e.target.value })} />
          {!isSelf && (
            <Select label="Relationship" options={RELATIONS} value={draft.relationship} onChange={(relationship) => onChange({ relationship })} />
          )}
        </div>
      ) : (
        <div className={styles.rows}>
          <ListRow title="Name" value={draft.name} trailing={null} />
          <ListRow title="Age" value={ageText} trailing={null} />
          <ListRow title="Relationship" value={RELATIONSHIP_LABELS[draft.relationship]} trailing={null} />
        </div>
      )}
    </section>
  );
}
