/**
 * @screen  M-7.8 · Edit health profile section
 * @flow    F07 My Health hub — health profile
 * @presentation push (DerivedPage)
 * @states  editing · saving
 * @spec    Design request 2026-10-20: LinkedIn-style section editing (OPEN: add to docs/ux/F07)
 * @xref    web: not built
 *
 * Every question in one section as a plain form (dropdowns, inputs; dates open a sheet). Changing an answer
 * re-runs the onboarding conditions, so follow-up questions appear or go live. Nothing saves until Save
 * (pinned at the bottom); Back closes without saving.
 */
import { useRef, useState } from 'react';
import { useAppStore } from '@shared/store';
import { Button } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { useNav, useScreenParams } from '@web/navigation';
import { useToast } from '@web/hooks/toast.store';
import { FormField } from './parts/FormField';
import { answersFromProfile } from '@web/screens/onboarding/HealthBasics/healthProfile';
import { saveHealthProfile } from '@web/screens/onboarding/HealthBasics/saveOnboarding';
import { LOCKED_KEYS, healthDetailSections } from '@web/screens/onboarding/HealthBasics/healthDetails';
import type { Answers } from '@web/screens/onboarding/HealthBasics/steps';
import styles from './EditHealthSection.module.css';

export default function EditHealthSection() {
  const { profileId = '', section = 'about' } = useScreenParams<{ profileId: string; section: string }>();
  const { pop } = useNav();
  const toast = useToast();
  const profile = useAppStore((s) => s.profiles.byId[profileId]);
  const [answers, setAnswers] = useState<Answers>(() => (profile ? answersFromProfile(profile) : {}));
  const ref = useRef(answers);
  const current = healthDetailSections(answers).find((s) => s.id === section);

  const set = (k: string, v: string) => {
    ref.current = { ...ref.current, [k]: v };
    setAnswers(ref.current);
  };
  const save = () => {
    if (!profile) return;
    saveHealthProfile(profile.id, ref.current);
    toast('Health profile updated');
    pop();
  };

  return (
    <DerivedPage
      title={`Edit ${current?.title.toLowerCase() ?? 'profile'}`}
      composerPlaceholder="Ask Oracle about your health profile…"
    >
      <div className={styles.body} data-xref="M-7.8 · Edit health profile section">
        <p className={styles.note}>The Oracle uses these to tailor its guidance.</p>
        {current?.rows.map((r) => (
          <section key={r.key} className={styles.field} aria-label={r.label}>
            {LOCKED_KEYS.has(r.key) ? (
              // Read-only: set at sign-up, never edited here (designer, 2026-10-21).
              <div className={styles.locked}>
                <span className={styles.lockedLabel}>{r.label}</span>
                <span className={styles.lockedValue}>{r.value ?? 'Not set'}</span>
              </div>
            ) : (
              <FormField step={r.step} label={r.label} shown={r.value} answers={answers} set={set} />
            )}
          </section>
        ))}
        <Button fullWidth onClick={save}>Save</Button>
      </div>
    </DerivedPage>
  );
}
