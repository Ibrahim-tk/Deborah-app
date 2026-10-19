/**
 * @screen  M-2.14 · Health Profile
 * @flow    Optional clinical questionnaire after short onboarding
 * @presentation push
 * @states  question · resume · saved
 * @spec    Discovery 2026-10-19 — reproductive, puberty, medicines, and Genesis Gold live here
 * @xref    web: not built
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { Aura, Button, Header } from '@mobile/ui';
import { namedReasonsComplete } from '@mobile/patterns/widgets';
import { BloomReveal } from '@mobile/screens/onboarding/HealthBasics/parts/BloomReveal';
import { StepBody } from '@mobile/screens/onboarding/HealthBasics/parts/StepBody';
import { healthProfileCompletion, answersFromProfile } from '@mobile/screens/onboarding/HealthBasics/healthProfile';
import { saveHealthProfile } from '@mobile/screens/onboarding/HealthBasics/saveOnboarding';
import { profileVisibleSteps, titleFor, type Answers } from '@mobile/screens/onboarding/HealthBasics/steps';
import { useCollapsingTitle } from '@mobile/hooks/useCollapsingTitle';
import { useNav, useRoute } from '@mobile/navigation';
import styles from './CompleteIntake.module.css';

const NAME_PATTERN = /^[\p{L}][\p{L}\s'’-]*$/u;

export default function CompleteIntake() {
  const { pop } = useNav();
  const { previousTitle } = useRoute();
  const { collapsed, onScroll } = useCollapsingTitle();
  const profile = useAppStore(selectActiveProfile);
  const [answers, setAnswers] = useState<Answers>(() => (profile ? answersFromProfile(profile) : {}));
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  const steps = profileVisibleSteps(answers);
  const [i, setI] = useState(() => {
    const seeded = profile ? answersFromProfile(profile) : {};
    const list = profileVisibleSteps(seeded);
    const open = list.findIndex((s) => !seeded[s.key]?.trim());
    return open < 0 ? 0 : open;
  });
  const at = Math.min(i, Math.max(0, steps.length - 1));
  const step = steps[at];
  const value = step ? (answers[step.key] ?? '') : '';
  const last = steps.length > 0 && at === steps.length - 1;
  const done = profile ? healthProfileCompletion(profile) >= 1 : false;

  const persist = (final: Answers) => {
    if (profile) saveHealthProfile(profile.id, final);
  };
  const set = (key: string, v: string) => {
    setAnswers((current) => {
      const next = { ...current, [key]: v };
      answersRef.current = next;
      return next;
    });
  };
  const go = (final: Answers, forward: boolean) => {
    persist(final);
    if (!forward) return;
    if (last) return;
    setI(at + 1);
  };
  const advance = (v: string, extra?: Answers) => {
    const final = { ...answersRef.current, ...extra, [step.key]: v };
    answersRef.current = final;
    setAnswers(final);
    window.setTimeout(() => go(final, true), step.kind === 'text' ? 0 : 280);
  };
  const textOk =
    !!step &&
    step.kind === 'text' &&
    (step.presentation === 'ageWheel' ||
      (step.presentation === 'namedReasons' && namedReasonsComplete(value, step.none)) ||
      ((step.presentation === 'chips' || !step.presentation) && Boolean(value.trim())));
  const canContinue =
    !!step &&
    (step.optional === true ||
      step.kind === 'date' ||
      step.kind === 'year' ||
      textOk ||
      (step.kind === 'name' && NAME_PATTERN.test(value.trim())));
  const tapToAnswer = step?.kind === 'choice';
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    const final = answersRef.current;
    if (step?.presentation === 'ageWheel' && !final[step.key]) {
      final[step.key] = '12';
      setAnswers({ ...final });
    }
    go(final, !last);
    if (last) persist(final);
  };

  if (!profile) return null;

  return (
    <form className={styles.root} onSubmit={submit} noValidate data-xref="M-2.14 · Health profile">
      <Aura />
      <Header title="Health profile" large collapsed={collapsed} onBack={pop} backLabel={previousTitle} />
      <div className={styles.body} onScroll={onScroll}>
        <p className={styles.banner}>
          {done
            ? 'Your health profile is filled in. You can change any answer.'
            : 'Optional. You can talk with Deborah before this is finished, and come back to wherever you stopped.'}
        </p>
        {done && (
          <div className={styles.reward} aria-hidden>
            <BloomReveal className={styles.tree} progress={1} />
          </div>
        )}
        {step ? (
          <>
            <p className={styles.progress}>
              Question {at + 1} of {steps.length}
            </p>
            <h2 className={styles.question}>{titleFor(step, answers)}</h2>
            <StepBody step={step} answers={answers} set={set} advance={advance} />
            <div className={styles.actions}>
              {at > 0 && (
                <Button type="button" variant="ghost" fullWidth onClick={() => { persist(answersRef.current); setI(at - 1); }}>
                  Previous
                </Button>
              )}
              {!tapToAnswer && (
                <Button type="submit" fullWidth disabled={!canContinue}>
                  {last ? 'Save profile' : 'Save and continue'}
                </Button>
              )}
              {step.presentation === 'namedReasons' && !value.trim() && (
                <Button type="button" variant="ghost" fullWidth onClick={() => advance(step.none ?? 'None')}>
                  Skip
                </Button>
              )}
              <Button type="button" variant="ghost" fullWidth onClick={() => { persist(answersRef.current); pop(); }}>
                Save and close
              </Button>
            </div>
          </>
        ) : (
          <p className={styles.banner}>Nothing else applies to this profile right now.</p>
        )}
      </div>
    </form>
  );
}
