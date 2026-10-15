/**
 * @screen  M-1.8 · Onboarding profile
 * @flow    F01 onboarding (plan P-02 to P-04): Splash → Welcome → sign-up (M-1.4) → this → Deborah (M-1.9) → chat
 * @presentation full screen, right after the sign-up sheet's "You're in"
 * @states  who is this for · [someone else: relationship · first name] · birth year · [self under 18 → M-1.10]
 *          · [someone else: consent by age group — child · teen · adult] · sex at birth
 * @figma   —
 * @spec    docs/ux/F01-onboarding.md#m-18--onboarding-profile
 * @xref    web: W-1.8 — not built
 *
 * The onboarding profile only: who Deborah will talk to or about, their age and sex at birth. No health
 * details here — Deborah asks those in the conversation and saves them through Review and Confirm.
 * Steps and their `showIf` branches live in data/intake/healthBasics.json. Choices advance on tap.
 */
import { useState, type FormEvent } from 'react';
import { useAppStore } from '@shared/store';
import { ageGroupFor } from '@shared/engine';
import { nowFrom } from '@shared/utils';
import { Aura, Button, GlassButton, GradientShift } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import { bloomProgress, forSomeoneElse, titleFor, visibleSteps, type Answers } from './steps';
import { saveOnboarding } from './saveOnboarding';
import { StepBody } from './parts/StepBody';
import { BloomReveal } from './parts/BloomReveal';
import styles from './HealthBasics.module.css';

const THIS_YEAR = new Date().getFullYear();
const DEFAULT_YEAR = String(THIS_YEAR - 35);
const NAME_PATTERN = /^[\p{L}][\p{L}\s'’-]*$/u;
// Long enough to see a tapped tile or row confirm before the next question.
const CONFIRM_MS = 280;

export default function HealthBasics() {
  const { presentSheet, pop, replace } = useNav();
  const [answers, setAnswers] = useState<Answers>({ birthYear: DEFAULT_YEAR });
  const [i, setI] = useState(0);
  const steps = visibleSteps(answers);
  const step = steps[Math.min(i, steps.length - 1)];
  const value = answers[step.key] ?? '';
  const last = i === steps.length - 1;

  const finish = (final: Answers) => {
    const profileId = saveOnboarding(final);
    // Deborah's sheet opens over the full bloom; its CTA starts the chat as (or about) this profile.
    presentSheet('M-1.9', { profileId });
  };

  const set = (key: string, v: string) => setAnswers((a) => ({ ...a, [key]: v }));
  const next = (final: Answers) => {
    // DN-03 age gate for your own profile. OPEN (O-2): "can someone under 18 sign up for themselves?" —
    // documented default: no; a parent adds them as someone they care for.
    if (step.kind === 'year' && !forSomeoneElse(final) && ageGroupFor(nowFrom(useAppStore.getState()).getFullYear() - Number(final.birthYear)) !== 'adult') {
      return replace('M-1.10');
    }
    return last ? finish(final) : setI(i + 1);
  };
  const advance = (v: string) => {
    const final = { ...answers, [step.key]: v };
    setAnswers(final);
    window.setTimeout(() => next(final), step.kind === 'text' ? 0 : CONFIRM_MS);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (canContinue) next(answers);
  };

  const canContinue =
    step.kind === 'date' || step.kind === 'year' || step.kind === 'measure' ||
    (step.kind === 'text' && Boolean(value.trim())) ||
    (step.kind === 'name' && NAME_PATTERN.test(value.trim())) ||
    (step.kind === 'consent' && value === 'yes');
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
          <GlassButton icon="back" aria-label={i > 0 ? 'Previous question' : 'Back'} onClick={() => (i > 0 ? setI(i - 1) : pop())} />
        </span>
      </header>
      {/* The progress indicator: a flowering tree that grows with every answer; its transparent background sits straight on the backdrop. */}
      <div className={styles.art} role="progressbar" aria-label="Onboarding profile" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={i + 1} aria-valuetext={`Question ${i + 1} of ${steps.length}`}>
        <BloomReveal className={styles.bloom} progress={bloomProgress(i, steps.length)} />
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
