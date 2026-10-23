/**
 * @screen  M-7.7 · Edit health detail
 * @flow    F07 My Health hub — health profile card, edit mode
 * @presentation push (DerivedPage)
 * @states  choice (tap saves) · text / list / date (Save) · not applicable
 * @spec    Design request 2026-10-20: edit one detail in a bottom sheet, no tree (OPEN: add to docs/ux/F07)
 * @xref    web: not built
 *
 * One health-profile question with the same control as onboarding (StepBody). Saving merges the answer
 * onto the profile through saveHealthProfile.
 */
import { useRef, useState } from 'react';
import { useAppStore } from '@shared/store';
import { Button } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { useNav, useScreenParams } from '@web/navigation';
import { useToast } from '@web/hooks/toast.store';
import { StepBody } from '@web/screens/onboarding/HealthBasics/parts/StepBody';
import { answersFromProfile } from '@web/screens/onboarding/HealthBasics/healthProfile';
import { saveHealthProfile } from '@web/screens/onboarding/HealthBasics/saveOnboarding';
import { stepFor } from '@web/screens/onboarding/HealthBasics/healthDetails';
import { titleFor, type Answers } from '@web/screens/onboarding/HealthBasics/steps';
import styles from './EditHealthDetail.module.css';

export default function EditHealthDetail() {
  const { profileId = '', key = '' } = useScreenParams<{ profileId: string; key: string }>();
  const { pop } = useNav();
  const toast = useToast();
  const profile = useAppStore((s) => s.profiles.byId[profileId]);
  const [answers, setAnswers] = useState<Answers>(() => (profile ? answersFromProfile(profile) : {}));
  const ref = useRef(answers);
  const step = stepFor(key, answers);

  const save = (final: Answers) => {
    if (!profile) return;
    saveHealthProfile(profile.id, final);
    toast('Health profile updated');
    pop();
  };
  const set = (k: string, v: string) => {
    const next = { ...ref.current, [k]: v };
    ref.current = next;
    setAnswers(next);
  };
  // Choices answer on tap: save straight away.
  const advance = (v: string, extra?: Answers) => {
    const next = { ...ref.current, ...extra, [key]: v };
    ref.current = next;
    setAnswers(next);
    window.setTimeout(() => save(next), 250);
  };
  const tap = step?.kind === 'choice' || step?.kind === 'profileFor';
  const title = step ? titleFor(step, answers) : 'Not applicable';

  return (
    <DerivedPage title={title} composerPlaceholder="Ask Deborah about your health profile…">
      <div className={styles.body} data-xref="M-7.7 · Edit health detail">
        {step ? <StepBody step={step} answers={answers} set={set} advance={advance} /> : <p className={styles.note}>This question doesn’t apply to this profile right now.</p>}
        {step && !tap && <Button fullWidth onClick={() => save(ref.current)}>Save</Button>}
      </div>
    </DerivedPage>
  );
}
