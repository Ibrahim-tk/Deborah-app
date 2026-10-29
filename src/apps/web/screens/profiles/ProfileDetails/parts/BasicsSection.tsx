/** M-6.5 Basics: name, age, relationship — read rows, or fields while editing. */
import { Input, ListRow, Select } from '@web/ui';
import { RELATIONSHIP_OPTIONS, relationshipLabel } from '@web/patterns/profile';
import type { ProfileDraft } from './draft';
import styles from '../ProfileDetails.module.css';

const RELATIONS = RELATIONSHIP_OPTIONS;

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
            <Select
              label="Relationship"
              options={RELATIONS}
              value={draft.relationship === 'daughter' || draft.relationship === 'son' ? 'child' : draft.relationship}
              onChange={(relationship) => onChange({ relationship })}
            />
          )}
        </div>
      ) : (
        <div className={styles.rows}>
          <ListRow density="compact" title="Name" value={draft.name} trailing={null} />
          <ListRow density="compact" title="Age" value={ageText} trailing={null} />
          <ListRow density="compact" title="Relationship" value={relationshipLabel(draft.relationship)} trailing={null} />
        </div>
      )}
    </section>
  );
}
