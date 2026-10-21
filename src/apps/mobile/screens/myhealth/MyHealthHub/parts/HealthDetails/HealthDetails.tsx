/**
 * My Health · health profile, LinkedIn-style (design 2026-10-20): one card per section, a pencil in each
 * section's header. The pencil (or any row) opens that section's full-screen editor (M-7.8) with Save.
 */
import { selectActiveProfile, useAppStore } from '@shared/store';
import { IconButton } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import { answersFromProfile, healthProfileCompletion } from '@mobile/screens/onboarding/HealthBasics/healthProfile';
import { LOCKED_KEYS, healthDetailSections } from '@mobile/screens/onboarding/HealthBasics/healthDetails';
import styles from './HealthDetails.module.css';

export function HealthDetails() {
  const { presentModal } = useNav();
  const profile = useAppStore(selectActiveProfile);
  if (!profile) return null;
  const sections = healthDetailSections(answersFromProfile(profile));
  const pct = Math.round(healthProfileCompletion(profile) * 100);
  const edit = (section: string) => presentModal('M-7.8', { profileId: profile.id, section });

  return (
    <div className={styles.stack}>
      <div className={styles.intro}>
        <h2 className={styles.heading}>Health profile</h2>
        <p className={styles.meta}>{pct === 100 ? 'Complete' : `${pct}% complete`}</p>
      </div>
      {sections.filter((s) => s.rows.length > 0).map((s) => (
        <section key={s.id} className={styles.root} aria-labelledby={`hp-${s.id}`}>
          <div className={styles.head}>
            <h3 id={`hp-${s.id}`} className={styles.title}>{s.title}</h3>
            <IconButton icon="edit" size="sm" label={`Edit ${s.title.toLowerCase()}`} onClick={() => edit(s.id)} />
          </div>
          <dl className={styles.list}>
            {s.rows.map((r) => {
              const locked = LOCKED_KEYS.has(r.key);
              const body = (
                <span className={styles.text}>
                  <dt className={styles.label}>{r.label}</dt>
                  <dd className={styles.value} data-empty={!r.value || undefined} data-locked={locked || undefined}>{r.value ?? (locked ? 'Not set' : 'Add')}</dd>
                </span>
              );
              // Date of birth and sex at birth are read-only: plain rows, no tap target.
              return locked
                ? <div key={r.key} className={styles.row}>{body}</div>
                : <button key={r.key} type="button" className={styles.row} onClick={() => edit(s.id)}>{body}</button>;
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}
