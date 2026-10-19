/**
 * @screen  M-1.8 · Onboarding profile
 * @flow    F01 onboarding (plan P-02 to P-04): Splash → Welcome → sign-up (M-1.4) → this → Deborah (M-1.9) → chat
 * @presentation full screen, right after the sign-up sheet's "You're in"
 * @states  who is this for · [someone else: relationship · first name] · date of birth · [self under 13 → M-1.10 sheet]
 *          · [someone else: medical-advocate consent sheet] · sex → identity → pronouns → age×sex banks → Deborah
 * @figma   —
 * @spec    docs/ux/F01-onboarding.md#m-18--onboarding-profile
 * @xref    web: W-1.8 — not built
 *
 * Version 2 onboarding profile: who Deborah will talk to, full date of birth, sex assigned at birth,
 * gender identity, and pronouns. Clinical questions live on the Health Profile (M-2.14).
 */
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import { Aura, Button, GlassButton, GradientShift } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import { ageFromAnswers, bloomProgress, forSomeoneElse, titleFor, visibleSteps, type Answers } from './steps';
import { saveOnboarding } from './saveOnboarding';
import { StepBody } from './parts/StepBody';
import { ConsentSheet } from './parts/ConsentSheet';
import { BloomReveal } from './parts/BloomReveal';
import { useTitleFade } from './parts/useTitleFade';
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
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  const [i, setI] = useState(0);
  const steps = visibleSteps(answers);
  // Back/edit can shrink the visible tree (e.g. leave peri → drop HRT); clamp for render.
  const at = Math.min(i, Math.max(0, steps.length - 1));
  const step = steps[at];
  const consentOpen = step.kind === 'consent';
  // Under the consent sheet, keep showing the previous question (usually DOB).
  const under = consentOpen && at > 0 ? steps[at - 1] : step;
  const fade = useTitleFade(under.key);
  const value = answers[step.key] ?? '';
  const underValue = answers[under.key] ?? '';
  const last = at === steps.length - 1;

  const finish = (final: Answers) => {
    const profileId = saveOnboarding(final);
    // Deborah's sheet opens over the full bloom; its CTA starts the chat as (or about) this profile.
    presentSheet('M-1.9', { profileId });
  };

  const set = (key: string, v: string) => {
    setAnswers((a) => {
      const next = { ...a, [key]: v };
      answersRef.current = next;
      return next;
    });
  };
  const next = (final: Answers) => {
    // Under-13 Myself: bottom sheet — guardian must add them, or back to start.
    if (step.kind === 'date' && !forSomeoneElse(final)) {
      const age = ageFromAnswers(final, nowFrom(useAppStore.getState()));
      if (age !== undefined && age < 13) return presentSheet('M-1.10');
    }
    // Age wheel may show a default without writing until Continue.
    if (step.presentation === 'ageWheel' && !final[step.key]) {
      final = { ...final, [step.key]: '12' };
      answersRef.current = final;
      setAnswers(final);
    }
    return last ? finish(final) : setI(at + 1);
  };
  const advance = (v: string, extra?: Answers) => {
    // Merge from the latest answers so a prior tile-remove is not overwritten.
    const final = { ...answersRef.current, ...extra, [step.key]: v };
    answersRef.current = final;
    setAnswers(final);
    window.setTimeout(() => next(final), step.kind === 'text' ? 0 : CONFIRM_MS);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (consentOpen || !canContinue) return;
    next(answersRef.current);
  };

  const textOk =
    under.kind === 'text' &&
    (under.presentation === 'ageWheel' ||
      (under.presentation === 'namedReasons' && namedReasonsComplete(underValue, under.none)) ||
      ((under.presentation === 'chips' || !under.presentation) && Boolean(underValue.trim())));
  const canContinue =
    under.optional === true ||
    under.kind === 'date' || under.kind === 'year' || under.kind === 'measure' ||
    textOk ||
    (under.kind === 'name' && NAME_PATTERN.test(underValue.trim()));
  // Choice (incl. describe morph check / expand type pills): no footer Continue — in-field confirm or pill tap advances.
  const tapToAnswer = under.kind === 'choice' || under.kind === 'profileFor';

  const goBack = () => {
    if (consentOpen) return setI(at - 1);
    if (at > 0) return setI(at - 1);
    pop();
  };

  return (
    <form className={styles.root} onSubmit={submit} noValidate data-xref="M-1.8 · Onboarding profile">
      {/* Same living backdrop as Welcome (M-1.2), so the questions feel like one continuous space. */}
      <Aura />
      <GradientShift />
      {/* Header · bloom (flexes to the space left) · question (natural height) · footer. */}
      <header className={styles.header}>
        <span className={styles.backSlot}>
          {/* On the first question, back leaves the form for the screen that opened it. */}
          <GlassButton icon="back" aria-label={at > 0 || consentOpen ? 'Previous question' : 'Back'} onClick={goBack} />
        </span>
      </header>
      {/* The progress indicator: a flowering tree that grows with every answer; its transparent background sits straight on the backdrop. */}
      <div className={styles.art} role="progressbar" aria-label="Onboarding profile" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={at + 1} aria-valuetext={`Question ${at + 1} of ${steps.length}`}>
        <BloomReveal className={styles.bloom} progress={bloomProgress(at, steps.length)} />
      </div>
      {/* Progressive blur: from the bottom of the screen up to just above the title (height is measured). */}
      <div className={styles.fade} style={{ height: fade.height, '--feather': `${fade.feather}px` } as CSSProperties} aria-hidden="true"><i /><i /><i /></div>
      {/* While the consent sheet is open, hide the DOB step so it doesn’t sit half-visible under a seam. */}
      {!consentOpen && (
        <>
          <div className={styles.body}>
            <div key={under.key} className={styles.step}>
              <h1 ref={fade.titleRef} className={`${styles.title} ${styles.heading}`}>{titleFor(under, answers)}</h1>
              <StepBody step={under} answers={answers} set={set} advance={advance} />
            </div>
          </div>
          <div className={styles.footer}>
            {!tapToAnswer && <Button type="submit" fullWidth disabled={!canContinue}>Continue</Button>}
            {/* Medicines / supplements: nothing to add → quiet Skip under Continue (was "I don't take any"). */}
            {under.presentation === 'namedReasons' && !underValue.trim() && (
              <Button type="button" variant="ghost" fullWidth onClick={() => advance(under.none ?? 'None')}>Skip</Button>
            )}
          </div>
        </>
      )}

      {consentOpen && (
        <ConsentSheet
          name={answers.memberName ?? ''}
          value={value}
          onChange={(v) => set('consent', v)}
          onBack={() => setI(at - 1)}
          onContinue={() => next(answersRef.current)}
        />
      )}
    </form>
  );
}
