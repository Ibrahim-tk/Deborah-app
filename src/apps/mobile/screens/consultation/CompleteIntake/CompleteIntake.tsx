/**
 * @screen  M-2.14 · Complete Intake
 * @flow    Discovery additive — full intake shell after short onboarding
 * @presentation push / modal
 * @states  sections · resume · saved
 * @spec    Client discovery 2026-10-16 — Dropbox fields deferred; placeholder sections only
 * @xref    web: not built
 * @status  placeholder
 */
import { useMemo, useState } from 'react';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { Button, Header, Input, TextArea } from '@mobile/ui';
import { FullChoicePills, IntakeSectionHeader } from '@mobile/patterns/widgets';
import { useNav, useRoute } from '@mobile/navigation';
import styles from './CompleteIntake.module.css';

type SectionId = 'basics' | 'family' | 'lifestyle' | 'other';

const SECTIONS: { id: SectionId; title: string; lede: string }[] = [
  { id: 'basics', title: 'Basics', lede: 'From your short onboarding — edit anytime.' },
  { id: 'family', title: 'Family history', lede: 'Placeholder until the full questionnaire arrives.' },
  { id: 'lifestyle', title: 'Lifestyle', lede: 'Sleep, stress, activity, and diet — placeholder.' },
  { id: 'other', title: 'Other medical', lede: 'Anything else Deborah should know.' },
];

const SLEEP = [
  { id: 'great', label: 'Sleeping well' },
  { id: 'fair', label: 'Hit or miss' },
  { id: 'poor', label: 'Often poor' },
];

export default function CompleteIntake() {
  const { pop } = useNav();
  const { previousTitle } = useRoute();
  const profile = useAppStore(selectActiveProfile);
  const intake = profile?.intake;
  const [section, setSection] = useState<SectionId>(
    (intake?.completeIntakeSection as SectionId) || 'basics',
  );
  const [family, setFamily] = useState(intake?.familyHistory ?? '');
  const [sleep, setSleep] = useState(intake?.lifestyleSleep ?? '');
  const [stress, setStress] = useState(intake?.lifestyleStress ?? '');
  const [activity, setActivity] = useState(intake?.lifestyleActivity ?? '');
  const [diet, setDiet] = useState(intake?.lifestyleDiet ?? '');
  const [other, setOther] = useState(intake?.otherMedical ?? '');

  const idx = SECTIONS.findIndex((s) => s.id === section);
  const current = SECTIONS[idx] ?? SECTIONS[0];

  const basicsSummary = useMemo(() => {
    if (!profile) return [];
    const rows: string[] = [];
    if (profile.intake.pronouns) rows.push(`Pronouns: ${profile.intake.pronouns}`);
    if (profile.sexAtBirth) rows.push(`Sex at birth: ${profile.sexAtBirth}`);
    if (profile.dob) rows.push(`Birth date on file`);
    if (profile.health?.medications?.value) rows.push('Medications on file');
    return rows;
  }, [profile]);

  if (!profile) return null;

  const saveSection = (next?: SectionId) => {
    const s = useAppStore.getState();
    s.updateIntake(profile.id, {
      familyHistory: family.trim() || undefined,
      lifestyleSleep: sleep || undefined,
      lifestyleStress: stress.trim() || undefined,
      lifestyleActivity: activity.trim() || undefined,
      lifestyleDiet: diet.trim() || undefined,
      otherMedical: other.trim() || undefined,
      completeIntakeSection: next ?? section,
    });
  };

  const goNext = () => {
    const next = SECTIONS[idx + 1];
    saveSection(next?.id ?? 'other');
    if (next) setSection(next.id);
    else pop();
  };

  return (
    <div className={styles.root} data-xref="M-2.14 · Complete Intake" data-placeholder>
      <Header title="Complete Intake" onBack={pop} backLabel={previousTitle} />
      <div className={styles.body}>
        <p className={styles.banner}>
          You can finish later — progress is saved. We’ll invite an annual review of your health profile.
        </p>
        <nav className={styles.tabs} aria-label="Intake sections">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={styles.tab}
              aria-current={s.id === section || undefined}
              onClick={() => {
                saveSection(s.id);
                setSection(s.id);
              }}
            >
              {s.title}
            </button>
          ))}
        </nav>

        <IntakeSectionHeader title={current.title} lede={current.lede} />

        {section === 'basics' && (
          <ul className={styles.list}>
            {basicsSummary.length === 0 ? (
              <li className={styles.muted}>No basics saved yet — finish short onboarding or your health profile card.</li>
            ) : (
              basicsSummary.map((line) => (
                <li key={line}>{line}</li>
              ))
            )}
          </ul>
        )}

        {section === 'family' && (
          <TextArea
            label="Family history"
            placeholder="e.g. mother — thyroid; father — heart disease"
            value={family}
            onChange={(e) => setFamily(e.target.value)}
          />
        )}

        {section === 'lifestyle' && (
          <div className={styles.stack}>
            <FullChoicePills label="How is your sleep?" options={SLEEP} selected={sleep} onPick={setSleep} />
            <Input label="Stress" placeholder="What’s draining you lately?" value={stress} onChange={(e) => setStress(e.target.value)} />
            <Input label="Activity" placeholder="Movement in a typical week" value={activity} onChange={(e) => setActivity(e.target.value)} />
            <Input label="Diet" placeholder="How you usually eat" value={diet} onChange={(e) => setDiet(e.target.value)} />
          </div>
        )}

        {section === 'other' && (
          <TextArea
            label="Other medical notes"
            placeholder="Surgeries, specialists, anything else"
            value={other}
            onChange={(e) => setOther(e.target.value)}
          />
        )}

        <div className={styles.actions}>
          <Button fullWidth onClick={goNext}>
            {idx < SECTIONS.length - 1 ? 'Save and continue' : 'Save intake'}
          </Button>
          <Button fullWidth variant="ghost" onClick={() => { saveSection(); pop(); }}>
            Save and close
          </Button>
        </div>
      </div>
    </div>
  );
}
