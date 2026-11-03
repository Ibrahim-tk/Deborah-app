/** Full health profile in the client drawer: the key facts first, then everything onboarding and intake can ask,
 *  grouped, behind "Show more". All clinical values are placeholder seed data. */
import { useState } from 'react';
import { formatDate, type Client } from '@shared/admin';
import { Icon, KeyValueList } from '@admin/ui';
import { Section } from '@admin/patterns';
import styles from './HealthProfile.module.css';

const list = (items: string[]) => (items.length ? items.join(', ') : 'None');
const opt = (v: string | null) => v ?? 'Not applicable';

export function HealthProfile({ client }: { client: Client }) {
  const [open, setOpen] = useState(false);
  const h = client.health;
  const d = h.details;

  const groups = [
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

  const hidden = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <Section title="Health profile">
      <div className={styles.root}>
        <KeyValueList
          items={[
            { label: 'Age', value: h.age },
            { label: 'Hormonal stage', value: h.stage },
            { label: 'Main concerns', value: list(h.concerns) },
            { label: 'Conditions', value: list(d.conditions) },
          ]}
        />
        {open && (
          <div id={`health-more-${client.id}`} className={styles.more}>
            {groups.map((g) => (
              <div key={g.title} className={styles.group}>
                <h3 className={styles.groupTitle}>{g.title}</h3>
                <KeyValueList items={g.items} />
              </div>
            ))}
          </div>
        )}
        {/* Quiet disclosure: chevron plus a count of what's hidden, like a properties list. */}
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={`health-more-${client.id}`}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name="chevronDown" size={16} className={styles.chevron} />
          {open ? 'Show less' : `${hidden} more fields`}
        </button>
      </div>
    </Section>
  );
}
