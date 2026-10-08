/** M-6.5 Health info from intake: age band, conditions, medications, cycle, onset (teen), notes. */
import type { Intake } from '@shared/types/domain';
import { Input, ListRow, OptionList, OptionRow, Select, TextArea } from '@mobile/ui';
import { AGE_BANDS, CONDITIONS, CYCLES, labelOf, ONSETS, type ProfileDraft } from './draft';
import styles from '../ProfileDetails.module.css';

export interface HealthSectionProps {
  draft: ProfileDraft;
  editing: boolean;
  minor: boolean;
  onChange: (patch: Partial<ProfileDraft>) => void;
}

const NOT_SHARED = 'Not shared yet';

export function HealthSection({ draft, editing, minor, onChange }: HealthSectionProps) {
  const { intake } = draft;
  const setIntake = (patch: Partial<Intake>) => onChange({ intake: { ...intake, ...patch } });

  // "None" is exclusive with every other answer, as in the intake question.
  const toggleCondition = (id: string) => {
    const has = intake.conditions.includes(id);
    if (id === 'none') return setIntake({ conditions: has ? [] : ['none'] });
    const rest = intake.conditions.filter((c) => c !== 'none' && c !== id);
    setIntake({ conditions: has ? rest : [...rest, id] });
  };

  const conditionsText = intake.conditions.map((c) => labelOf(CONDITIONS, c) ?? c).join(', ');

  if (!editing) {
    return (
      <section className={styles.section} aria-labelledby="health-h">
        <h2 id="health-h" className={styles.heading}>Health info</h2>
        <div className={styles.rows}>
          <ListRow title="Age range" value={labelOf(AGE_BANDS, intake.ageBand) ?? NOT_SHARED} trailing={null} />
          <ListRow title="Conditions" subtitle={conditionsText || NOT_SHARED} trailing={null} />
          <ListRow title="Medications" subtitle={intake.medications.join(', ') || NOT_SHARED} trailing={null} />
          <ListRow title="Cycle" value={labelOf(CYCLES, intake.cycle) ?? NOT_SHARED} trailing={null} />
          {minor && <ListRow title="Periods for" value={labelOf(ONSETS, intake.onset) ?? NOT_SHARED} trailing={null} />}
          <ListRow title="Notes" subtitle={intake.notes || NOT_SHARED} trailing={null} />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="health-h">
      <h2 id="health-h" className={styles.heading}>Health info</h2>
      <div className={styles.fields}>
        <Select label="Age range" options={AGE_BANDS} value={intake.ageBand} onChange={(ageBand) => setIntake({ ageBand })} />
        <div className={styles.group}>
          <p className={styles.label}>Conditions</p>
          <OptionList multi label="Conditions">
            {CONDITIONS.map((o) => (
              <OptionRow key={o.value} multi selected={intake.conditions.includes(o.value)} onSelect={() => toggleCondition(o.value)}>
                {o.label}
              </OptionRow>
            ))}
          </OptionList>
        </div>
        <Input
          label="Medications"
          hint="Separate with commas."
          value={draft.medsText}
          onChange={(e) => onChange({ medsText: e.target.value })}
        />
        <Select label="Cycle" options={CYCLES} value={intake.cycle} onChange={(cycle) => setIntake({ cycle })} />
        {minor && <Select label="Periods for" options={ONSETS} value={intake.onset} onChange={(onset) => setIntake({ onset })} />}
        <div className={styles.group}>
          <p className={styles.label}>Notes</p>
          <TextArea label="Notes" className={styles.textField} minRows={3} maxRows={8} value={intake.notes ?? ''} onChange={(e) => setIntake({ notes: e.target.value })} />
        </div>
      </div>
    </section>
  );
}
