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
 * Version 2 onboarding profile: who Oracle will talk to, full date of birth, sex assigned at birth,
 * gender identity, and pronouns. Clinical questions live on the Health Profile (M-2.14).
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import { Button, TextReveal } from '@web/ui';
import { useNav, useScreenParams } from '@web/navigation';
import { useStartAtDetails } from './useStartAtDetails';
import { ageFromAnswers, bloomProgress, forSomeoneElse, titleFor, visibleSteps, type Answers } from './steps';
import { saveOnboarding } from './saveOnboarding';
import { StepBody } from './parts/StepBody';
import { ConsentSheet } from './parts/ConsentSheet';
import { PetalScatter } from './parts/PetalScatter';
import { BloomReveal } from './parts/BloomReveal';
import { useStepTransition } from './parts/useStepTransition';
import { namedReasonsComplete } from '@web/patterns/widgets';
import { PageFooter } from '@web/patterns/shell';
import styles from './HealthBasics.module.css';

const THIS_YEAR = new Date().getFullYear();
/** Mid-year default so the date wheel opens on a plausible adult DOB. */
const DEFAULT_DOB = `${THIS_YEAR - 35}-06-15`;
const NAME_PATTERN = /^[\p{L}][\p{L}\s'’-]*$/u;
// Long enough to see a tapped tile or row confirm before the next question.
const CONFIRM_MS = 280;

export default function HealthBasics() {
  const { presentSheet, pop, resetTo, replace } = useNav();
  const { returnTo } = useScreenParams<{ returnTo: string }>();
  const atDetails = useStartAtDetails();
  // `start: 'details'` (internal Screens menu): skip "who is this for" as Myself, open on basic details.
  // Teen accounts answer only for themselves (story 1.5): skip "Who is this for?".
  const teen = useAppStore((s) => s.accountKind === 'teen');
  const [answers, setAnswers] = useState<Answers>(atDetails || teen ? { profileFor: 'self', birthDate: DEFAULT_DOB } : { birthDate: DEFAULT_DOB });
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  const [i, setI] = useState(atDetails || teen ? 1 : 0);
  // Date of birth already given on the age step (W-1.13): Myself skips it here.
  const accountDob = useAppStore((s) => s.accountDob);
  const steps = visibleSteps(accountDob && !forSomeoneElse(answers) ? { ...answers, birthDate: accountDob } : answers)
    .filter((s) => !(accountDob && s.key === 'birthDate' && !forSomeoneElse(answers)));
  // Back/edit can shrink the visible tree (e.g. leave peri → drop HRT); clamp for render.
  const at = Math.min(i, Math.max(0, steps.length - 1));
  const step = steps[at];
  const consentOpen = step.kind === 'consent';
  // Under the consent sheet, keep showing the previous question (usually DOB).
  const under = consentOpen && at > 0 ? steps[at - 1] : step;
  // Outgoing question fades out before the next fades in.
  const { shown, leaving } = useStepTransition(under);
  const value = answers[step.key] ?? '';
  const underValue = answers[under.key] ?? '';
  const last = at === steps.length - 1;

  // Cinematic hand-off to Oracle's welcome: questions fade, the tree un-grows (its growth in reverse) while its blossoms go on the breeze.
  const [exiting, setExiting] = useState(false);
  const EXIT_MS = 2600;

  const finish = (final: Answers) => {
    const profileId = saveOnboarding(accountDob && !forSomeoneElse(final) ? { ...final, birthDate: accountDob } : final);
    if (returnTo === 'chat') {
      // Guest-chat path: back to the same thread with a closing line + held send.
      resetTo('main', 'M-2.1', { onboardClosing: true });
      return;
    }
    // Oracle's welcome fades in full-screen; its CTA starts the chat as (or about) this profile.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setExiting(true);
    window.setTimeout(() => replace('M-1.9', { profileId }, 'fade'), reduced ? 0 : EXIT_MS);
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
    (under.kind === 'name' && NAME_PATTERN.test(underValue.trim())) ||
    ((under.kind === 'choice' || under.kind === 'profileFor') && Boolean(underValue));

  const goBack = () => {
    if (consentOpen) return setI(at - 1);
    if (at > (teen ? 1 : 0)) return setI(at - 1);
    pop();
  };

  // Medicines / supplements (namedReasons): empty → Skip + No; any named row → Next (No becomes Next).
  const namedEmpty = under.presentation === 'namedReasons' && !namedReasonsComplete(underValue, under.none);
  // OPEN: Skip vs No — Skip leaves the step unanswered (no None write); No = confirmed none. Product may later want an explicit "prefer not to say" token.
  const skipNamed = () => {
    const final = { ...answersRef.current };
    if (!namedReasonsComplete(final[under.key], under.none)) delete final[under.key];
    answersRef.current = final;
    setAnswers(final);
    next(final);
  };

  return (
    <form className={styles.root} data-exiting={exiting || undefined} onSubmit={submit} noValidate data-xref="M-1.8 · Onboarding profile">
      <div className={styles.layout}>
        {/* Left: questions vertically centered. Brand logo lives in shell BrandNav. */}
        <div className={styles.main}>
          <div className={styles.brandSpace} aria-hidden />
          <div className={styles.stage}>
            {/* While the consent sheet is open, hide the DOB step so it doesn’t sit half-visible under a seam. */}
            {!consentOpen && (
              <>
                <div className={styles.body}>
                  <div key={shown.key} className={`${styles.step} ${leaving ? styles.stepLeaving : ''}`}>
                    <h1 className={`${styles.title} ${styles.heading}`}><TextReveal as="span" text={titleFor(shown, answers)} delay={180} stagger={22} /></h1>
                    <StepBody step={shown} answers={answers} set={set} advance={advance} />
                  </div>
                </div>
                <div className={styles.footer}>
                  {/* Back always; empty namedReasons adds Skip + No; filled → Next. */}
                  <div className={styles.navRow}>
                    <Button type="button" variant="ghost" onClick={goBack} disabled={at === 0}>Back</Button>
                    {namedEmpty && (
                      <Button type="button" variant="ghost" onClick={skipNamed}>Skip</Button>
                    )}
                    {namedEmpty ? (
                      <Button type="button" onClick={() => advance(under.none ?? 'None')}>No</Button>
                    ) : (
                      <Button type="submit" disabled={!canContinue}>Next</Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Right: tree from the bottom edge up the full column height. */}
        <div className={styles.art} role="progressbar" aria-label="Onboarding profile" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={at + 1} aria-valuetext={`Question ${at + 1} of ${steps.length}`}>
          <BloomReveal className={styles.bloom} progress={exiting ? 0 : bloomProgress(at, steps.length)} rate={exiting ? 2.4 : 7} />
        </div>
      </div>

      <ConsentSheet
        open={consentOpen}
        name={answers.memberName ?? ''}
        value={value}
        onChange={(v) => set('consent', v)}
        onBack={() => setI(at - 1)}
        onContinue={() => next(answersRef.current)}
      />
      <PageFooter />
      {exiting && <PetalScatter />}
      {exiting && <div className={styles.glory} aria-hidden data-overlay />}
    </form>
  );
}
