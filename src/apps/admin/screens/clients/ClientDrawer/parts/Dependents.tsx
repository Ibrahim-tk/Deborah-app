/** Dependent profiles shown in full inside the client drawer (formerly A-3.3, now inline). */
import type { Client } from '@shared/admin';
import { KeyValueList } from '@admin/ui';
import { Section } from '@admin/patterns';
import styles from './Dependents.module.css';

export function Dependents({ client }: { client: Client }) {
  return (
    <Section title="Dependents">
      {client.dependents.length === 0 ? (
        <p className={styles.empty}>No dependent profiles on this account.</p>
      ) : (
        <div className={styles.list}>
          {client.dependents.map((d) => (
            <div key={d.id} className={styles.card}>
              <p className={styles.name}>{d.name}</p>
              <KeyValueList
                items={[
                  { label: 'Relationship', value: d.relationship },
                  { label: 'Age', value: d.age },
                  { label: 'Main concerns', value: d.conditions.join(', ') },
                ]}
              />
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
