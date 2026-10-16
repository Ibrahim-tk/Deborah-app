/**
 * @screen  M-1.8 · Onboarding profile
 * @flow    F01 onboarding (plan P-02 to P-04): Splash → Welcome → sign-up (M-1.4) → this → Deborah (M-1.9) → chat
 * @presentation full screen, right after the sign-up sheet's "You're in"
 * @states  who is this for · [someone else: relationship · first name] · date of birth · [self under 13 → M-1.10 sheet]
 *          · [someone else: consent by age group] · sex at birth · age×sex banks · [identity last if NB/trans/intersex]
 * @figma   —
 * @spec    docs/ux/F01-onboarding.md#m-18--onboarding-profile
 * @xref    web: W-1.8 — not built
 *
 * Version 2 onboarding profile: who Deborah will talk to, full date of birth, sex at birth (routes banks),
 * then age×sex intake; gender identity last when sex is not Male/Female. Steps/`showIf` in healthBasics.json.
 */
import { useState, type FormEvent } from 'react';
import { useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import { Aura, Button, GlassButton, GradientShift } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import { ageFromAnswers, bloomProgress, forSomeoneElse, titleFor, visibleSteps, type Answers } from './steps';
import { saveOnboarding } from './saveOnboarding';
import { StepBody } from './parts/StepBody';
import { BloomReveal } from './parts/BloomReveal';
import { namedReasonsComplete } from '@mobile/patterns/widgets';
import styles from './HealthBasics.module.css';

const THIS_YEAR = new Date().getFullYear();
/** Mid-year default so the date wheel opens on a plausible adult DOB. */
const DEFAULT_DOB = `${THIS_YEAR - 35}-06-15`;
const NAME_PATTERN = /^[\p{L}][\p{L}\s'’-]*$/u;
// Long enough to see a tapped tile or row confirm before the next question.
const CONFIRM_MS = 280;

export default function HealthBasics() {
  const { presentSheet, pop } = useNav();
  const [answers, setAnswers] = useState<Answers>({ birthDate: DEFAULT_DOB });
  const [i, setI] = useState(0);
  const steps = visibleSteps(answers);
  // Back/edit can shrink the visible tree (e.g. leave peri → drop HRT); clamp for render.
  const at = Math.min(i, Math.max(0, steps.length - 1));
  const step = steps[at];
  const value = answers[step.key] ?? '';
  const last = at === steps.length - 1;

  const finish = (final: Answers) => {
    const profileId = saveOnboarding(final);
    // Deborah's sheet opens over the full bloom; its CTA starts the chat as (or about) this profile.
    presentSheet('M-1.9', { profileId });
  };

  const set = (key: string, v: string) => setAnswers((a) => ({ ...a, [key]: v }));
  const next = (final: Answers) => {
    // Under-13 Myself: bottom sheet — guardian must add them, or back to start.
    if (step.kind === 'date' && !forSomeoneElse(final)) {
      const age = ageFromAnswers(final, nowFrom(useAppStore.getState()));
      if (age !== undefined && age < 13) return presentSheet('M-1.10');
    }
    // Age wheel may show a default without writing until Continue.
    if (step.presentation === 'ageWheel' && !final[step.key]) {
      final = { ...final, [step.key]: '12' };
      setAnswers(final);
    }
    return last ? finish(final) : setI(at + 1);
  };
  const advance = (v: string, extra?: Answers) => {
    const final = { ...answers, ...extra, [step.key]: v };
    setAnswers(final);
    window.setTimeout(() => next(final), step.kind === 'text' ? 0 : CONFIRM_MS);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (canContinue) next(answers);
  };

  const textOk =
    step.kind === 'text' &&
    (step.presentation === 'ageWheel' ||
      (step.presentation === 'namedReasons' && namedReasonsComplete(value, step.none)) ||
      ((step.presentation === 'chips' || !step.presentation) && Boolean(value.trim())));
  const canContinue =
    step.optional === true ||
    step.kind === 'date' || step.kind === 'year' || step.kind === 'measure' ||
    textOk ||
    (step.kind === 'name' && NAME_PATTERN.test(value.trim())) ||
    (step.kind === 'consent' && value === 'yes');
  // Choice (incl. describe morph check / expand type pills): no footer Continue — in-field confirm or pill tap advances.
  const tapToAnswer = step.kind === 'choice' || step.kind === 'profileFor';

  return (
    <form className={styles.root} onSubmit={submit} noValidate data-xref="M-1.8 · Onboarding profile">
      {/* Same living backdrop as Welcome (M-1.2), so the questions feel like one continuous space. */}
      <Aura />
      <GradientShift />
      {/* Header · bloom (flexes to the space left) · question (natural height) · footer. */}
      <header className={styles.header}>
        <span className={styles.backSlot}>
          {/* On the first question, back leaves the form for the screen that opened it. */}
          <GlassButton icon="back" aria-label={at > 0 ? 'Previous question' : 'Back'} onClick={() => (at > 0 ? setI(at - 1) : pop())} />
        </span>
      </header>
      {/* The progress indicator: a flowering tree that grows with every answer; its transparent background sits straight on the backdrop. */}
      <div className={styles.art} role="progressbar" aria-label="Onboarding profile" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={at + 1} aria-valuetext={`Question ${at + 1} of ${steps.length}`}>
        <BloomReveal className={styles.bloom} progress={bloomProgress(at, steps.length)} />
      </div>
      <div className={styles.body}>
        <div key={step.key} className={styles.step}>
          <h1 className={`${styles.title} ${styles.heading}`}>{titleFor(step, answers)}</h1>
          <StepBody step={step} answers={answers} set={set} advance={advance} />
        </div>
      </div>
      <div className={styles.footer}>
        {!tapToAnswer && <Button type="submit" fullWidth disabled={!canContinue}>Continue</Button>}
      </div>
    </form>
  );
}
