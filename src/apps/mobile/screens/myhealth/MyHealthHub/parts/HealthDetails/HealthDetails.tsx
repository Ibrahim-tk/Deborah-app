/**
 * My Health · health profile card: every detail the profile holds, read-only by default. "Edit" turns on
 * edit mode: each row gets a pencil and opens its own bottom sheet (M-7.7) with that question's control.
 * No tree, no stepper.
 */
import { useState } from 'react';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { Button, Icon } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import { answersFromProfile, healthProfileCompletion } from '@mobile/screens/onboarding/HealthBasics/healthProfile';
import { healthDetailRows } from '@mobile/screens/onboarding/HealthBasics/healthDetails';
import styles from './HealthDetails.module.css';

export function HealthDetails() {
  const { presentSheet } = useNav();
  const profile = useAppStore(selectActiveProfile);
  const [editing, setEditing] = useState(false);
  if (!profile) return null;
  const rows = healthDetailRows(answersFromProfile(profile));
  const pct = Math.round(healthProfileCompletion(profile) * 100);
  const open = (key: string) => presentSheet('M-7.7', { profileId: profile.id, key });

  return (
    <section className={styles.root} aria-labelledby="hub-health-profile">
      <div className={styles.head}>
        <div>
          <h2 id="hub-health-profile" className={styles.title}>Health profile</h2>
          <p className={styles.meta}>{pct}% complete</p>
        </div>
        <Button variant="link" onClick={() => setEditing((e) => !e)}>{editing ? 'Done' : 'Edit'}</Button>
      </div>
      <dl className={styles.list}>
        {rows.map((r) => {
          const body = (
            <>
              <dt className={styles.label}>{r.label}</dt>
              <dd className={styles.value} data-empty={!r.value || undefined}>{r.value ?? 'Not added'}</dd>
            </>
          );
          return editing ? (
            <button key={r.key} type="button" className={styles.row} onClick={() => open(r.key)} aria-label={`Edit ${r.label}`}>
              <span className={styles.text}>{body}</span>
              <Icon name="edit" size={18} className={styles.pencil} />
            </button>
          ) : (
            <div key={r.key} className={styles.row}><span className={styles.text}>{body}</span></div>
          );
        })}
      </dl>
    </section>
  );
}
