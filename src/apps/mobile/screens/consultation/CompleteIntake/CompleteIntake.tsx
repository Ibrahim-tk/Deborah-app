/**
 * @screen  M-2.14 · Complete Intake
 * @flow    Discovery additive — full intake shell after short onboarding
 * @presentation push / modal
 * @states  sections · resume · saved
 * @spec    Client discovery 2026-10-16 — Dropbox fields deferred; placeholder sections only
 * @xref    web: not built
 * @status  placeholder
 */
import { Fragment, useMemo, useState } from 'react';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { Aura, Button, Divider, Header, Input, ListRow, TextArea } from '@mobile/ui';
import { ChoicePills, FullChoicePills, IntakeSectionHeader } from '@mobile/patterns/widgets';
import { useCollapsingTitle } from '@mobile/hooks/useCollapsingTitle';
import { useNav, useRoute } from '@mobile/navigation';
import styles from './CompleteIntake.module.css';

type SectionId = 'basics' | 'family' | 'lifestyle' | 'other';

const SECTIONS: { id: SectionId; title: string; lede: string }[] = [
  { id: 'basics', title: 'Basics', lede: 'From your short onboarding — edit anytime.' },
  { id: 'family', title: 'Family history', lede: 'Placeholder until the full questionnaire arrives.' },
  { id: 'lifestyle', title: 'Lifestyle', lede: 'Sleep, stress, activity, and diet — placeholder.' },
  { id: 'other', title: 'Other medical', lede: 'Anything else Deborah should know.' },
];

const SECTION_TITLES = SECTIONS.map((s) => s.title);

const SLEEP = [
  { id: 'great', label: 'Sleeping well' },
  { id: 'fair', label: 'Hit or miss' },
  { id: 'poor', label: 'Often poor' },
];

export default function CompleteIntake() {
  const { pop } = useNav();
  const { previousTitle } = useRoute();
  const { collapsed, onScroll } = useCollapsingTitle();
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

  const basicsRows = useMemo(() => {
    if (!profile) return [];
    const rows: { label: string; value: string }[] = [];
    if (profile.intake.pronouns) rows.push({ label: 'Pronouns', value: profile.intake.pronouns });
    if (profile.sexAtBirth) rows.push({ label: 'Sex at birth', value: profile.sexAtBirth });
    if (profile.dob) rows.push({ label: 'Birth date', value: 'On file' });
    if (profile.health?.medications?.value) rows.push({ label: 'Medications', value: 'On file' });
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

  const pickSection = (title: string) => {
    const next = SECTIONS.find((s) => s.title === title);
    if (!next || next.id === section) return;
    saveSection(next.id);
    setSection(next.id);
  };

  return (
    <div className={styles.root} data-xref="M-2.14 · Complete Intake" data-placeholder>
      <Aura />
      <Header
        title="Complete Intake"
        large
        collapsed={collapsed}
        onBack={pop}
        backLabel={previousTitle}
      />
      <div className={styles.body} onScroll={onScroll}>
        <p className={styles.banner}>
          You can finish later — progress is saved. We’ll invite an annual review of your health profile.
        </p>

        <div className={styles.pills}>
          <ChoicePills
            label="Intake sections"
            options={SECTION_TITLES}
            selected={[current.title]}
            onPick={pickSection}
            onToggle={pickSection}
          />
        </div>

        <IntakeSectionHeader title={current.title} lede={current.lede} />

        {section === 'basics' && (
          basicsRows.length === 0 ? (
            <div className={styles.panel}>
              <p className={styles.empty}>
                No basics saved yet — finish short onboarding or your health profile card.
              </p>
            </div>
          ) : (
            <div className={styles.rows}>
              {basicsRows.map((row, i) => (
                <Fragment key={row.label}>
                  {i > 0 && <Divider />}
                  <ListRow title={row.label} value={row.value} trailing={null} />
                </Fragment>
              ))}
            </div>
          )
        )}

        {section === 'family' && (
          <div className={styles.field}>
            <p className={styles.fieldLabel}>Family history</p>
            <TextArea
              className={styles.textField}
              label="Family history"
              placeholder="e.g. mother — thyroid; father — heart disease"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              minRows={3}
              maxRows={8}
            />
          </div>
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
          <div className={styles.field}>
            <p className={styles.fieldLabel}>Other medical notes</p>
            <TextArea
              className={styles.textField}
              label="Other medical notes"
              placeholder="Surgeries, specialists, anything else"
              value={other}
              onChange={(e) => setOther(e.target.value)}
              minRows={3}
              maxRows={8}
            />
          </div>
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
