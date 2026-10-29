/**
 * My Health · health profile, LinkedIn-style (design 2026-10-20): one card per section, a pencil in each
 * section's header. The pencil (or any row) opens that section's full-screen editor (M-7.8) with Save.
 */
import { selectActiveProfile, useAppStore } from '@shared/store';
import { IconButton } from '@web/ui';
import { useNav } from '@web/navigation';
import { answersFromProfile } from '@web/screens/onboarding/HealthBasics/healthProfile';
import { LOCKED_KEYS, healthDetailSections } from '@web/screens/onboarding/HealthBasics/healthDetails';
import styles from './HealthDetails.module.css';

export function HealthDetails() {
  const { open } = useNav();
  const profile = useAppStore(selectActiveProfile);
  if (!profile) return null;
  const sections = healthDetailSections(answersFromProfile(profile));
  const edit = (section: string) => open('M-7.8', { profileId: profile.id, section });

  return (
    <div className={styles.stack}>
      {sections.filter((s) => s.rows.length > 0).map((s, i) => (
        <section key={s.id} className={styles.root} aria-labelledby={`hp-${s.id}`}>
          <div className={styles.head}>
            {/* First card carries the section name "Health profile" (designer, 2026-10-29). */}
            <h2 id={`hp-${s.id}`} className={styles.title}>{i === 0 ? 'Health profile' : s.title}</h2>
            <IconButton icon="edit" size="sm" label={`Edit ${i === 0 ? 'health profile' : s.title.toLowerCase()}`} onClick={() => edit(s.id)} />
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
