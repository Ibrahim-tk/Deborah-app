/** Full health profile (its own tab in the client drawer): every onboarding and intake field, in titled groups, one column,
 *  label left and answer right. All clinical values are placeholder seed data. */
import { formatDate, type Client } from '@shared/admin';
import { KeyValueList } from '@admin/ui';
import styles from './HealthProfile.module.css';

const list = (items: string[]) => (items.length ? items.join(', ') : 'None');
const opt = (v: string | null) => v ?? 'Not applicable';

export function HealthProfile({ client }: { client: Client }) {
  const h = client.health;
  const d = h.details;

  const groups = [
    {
      title: 'Summary',
      items: [
        { label: 'Age', value: h.age },
        { label: 'Hormonal stage', value: h.stage },
        { label: 'Main concerns', value: list(h.concerns) },
        { label: 'Conditions', value: list(d.conditions) },
      ],
    },
    {
      title: 'About',
      items: [
        { label: 'Date of birth', value: formatDate(d.dob) },
        { label: 'Sex at birth', value: d.sexAtBirth },
        { label: 'Gender', value: d.gender },
        { label: 'Pronouns', value: d.pronouns },
        { label: 'Height', value: `${d.heightCm} cm` },
        { label: 'Weight', value: `${d.weightKg} kg` },
      ],
    },
    {
      title: 'Hormonal and reproductive',
      items: [
        { label: 'Hormonal stage', value: d.reproductiveStage },
        { label: 'Age at last period', value: opt(d.ageAtLastPeriod) },
        { label: 'Hysterectomy', value: d.hysterectomy },
        { label: 'Ovaries removed', value: d.ovariesRemoved },
        { label: 'On HRT', value: d.hrt },
        { label: 'HRT type', value: opt(d.hrtType) },
        { label: 'Fertility concerns', value: d.fertilityConcerns },
      ],
    },
    {
      title: 'Medicines and supplements',
      items: [
        { label: 'Medications', value: list(h.medications) },
        { label: 'Supplements', value: list(d.supplements) },
        { label: 'Genesis Gold', value: d.genesisGold },
        { label: 'Allergies', value: list(d.allergies) },
      ],
    },
    {
      title: 'Lifestyle',
      items: [
        { label: 'Sleep', value: d.lifestyle.sleep },
        { label: 'Exercise', value: d.lifestyle.exercise },
        { label: 'Diet', value: d.lifestyle.diet },
        { label: 'Stress', value: d.lifestyle.stress },
        { label: 'Alcohol', value: d.lifestyle.alcohol },
        { label: 'Smoking', value: d.lifestyle.smoking },
      ],
    },
  ];

  return (
    <div className={styles.root}>
      {groups.map((g) => (
        <section key={g.title} className={styles.group}>
          <h3 className={styles.groupTitle}>{g.title}</h3>
          <KeyValueList items={g.items} split="half" />
        </section>
      ))}
    </div>
  );
}
