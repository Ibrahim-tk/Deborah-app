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
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import { Aura, Button, GlassButton, GradientShift } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import { useStartAtDetails } from './useStartAtDetails';
import { ageFromAnswers, bloomProgress, forSomeoneElse, titleFor, visibleSteps, type Answers } from './steps';
import { saveOnboarding } from './saveOnboarding';
import { StepBody } from './parts/StepBody';
import { ConsentSheet } from './parts/ConsentSheet';
import { WelcomeReveal } from './parts/WelcomeReveal';
import { BloomReveal3 } from './parts/BloomReveal3';
import { BloomReveal2, useTreeDev } from './parts/BloomReveal2';
import { useTitleFade } from './parts/useTitleFade';
import { useStepTransition } from './parts/useStepTransition';
import { namedReasonsComplete } from '@mobile/patterns/widgets';
import styles from './HealthBasics.module.css';

const THIS_YEAR = new Date().getFullYear();
/** Mid-year default so the date wheel opens on a plausible adult DOB. */
const DEFAULT_DOB = `${THIS_YEAR - 35}-06-15`;
const NAME_PATTERN = /^[\p{L}][\p{L}\s'’-]*$/u;
// Long enough to see a tapped tile or row confirm before the next question.
const CONFIRM_MS = 280;
// Finish, three beats on the same screen (no M-1.9 sheet): 1 wind starts and the question blows away with it ·
// 2 the wind ends and the tree + its particles fade (GenesisTree .gone) · 3 Oracle's welcome reveals on a clean backdrop.
const WIND_MS = 8000;
const CLEAR_MS = 400;
// The question fades up and is removed from the screen at this point of the wind.
const BLOW_MS = 1200;

export default function HealthBasics() {
  const { presentSheet, pop } = useNav();
  const atDetails = useStartAtDetails();
  // Feature flag (off by default): the layered tree, on only in the /internal/tree sandbox for now.
  const newTree = useTreeDev((s) => s.useNewTree);
  // `start: 'details'` (internal Screens menu): skip "who is this for" as Myself, open on basic details.
  // Teen accounts answer only for themselves (story 1.5): skip "Who is this for?".
  const teen = useAppStore((s) => s.accountKind === 'teen');
  const [answers, setAnswers] = useState<Answers>(atDetails || teen ? { profileFor: 'self', birthDate: DEFAULT_DOB } : { birthDate: DEFAULT_DOB });
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  const [i, setI] = useState(atDetails || teen ? 1 : 0);
  const [done, setDone] = useState<{ profileId: string; phase: 'blow' | 'cleared' | 'welcome' } | null>(null);
  // Date of birth already given on the age step (M-1.13): Myself skips it here.
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
  const titleRef = useRef<HTMLHeadingElement>(null);
  const fade = useTitleFade(shown.key, titleRef);
  const value = answers[step.key] ?? '';
  const underValue = answers[under.key] ?? '';
  const last = at === steps.length - 1;

  const finish = (final: Answers) => {
    const profileId = saveOnboarding(accountDob && !forSomeoneElse(final) ? { ...final, birthDate: accountDob } : final);
    // Oracle's welcome opens over the full bloom; its CTA starts the chat as (or about) this profile.
    setDone({ profileId, phase: 'blow' });
    window.setTimeout(() => setDone({ profileId, phase: 'cleared' }), BLOW_MS);
    window.setTimeout(() => setDone({ profileId, phase: 'welcome' }), WIND_MS + CLEAR_MS);
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
    if (at > (teen ? 1 : 0)) return setI(at - 1);
    pop();
  };

  // Medicines / supplements (namedReasons): empty → Skip + No; any named row → Continue (No becomes Continue).
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
      <div className={newTree ? `${styles.art} ${styles.art2}` : styles.art} role="progressbar" aria-label="Onboarding profile" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={at + 1} aria-valuetext={`Question ${at + 1} of ${steps.length}`}>
        {newTree
          ? <BloomReveal2 className={styles.bloom2} progress={bloomProgress(at, steps.length)} />
          : <BloomReveal3 progress={bloomProgress(at, steps.length)} wind={done !== null} />}
      </div>
      {/* Progressive blur: from the bottom of the screen up to just above the title (height is measured). */}
      <div className={`${styles.fade} ${done ? styles.fadeOff : ''}`} style={{ height: fade.height, '--feather': `${fade.feather}px` } as CSSProperties} aria-hidden="true"><i /><i /><i /></div>
      {/* While the consent sheet is open, hide the DOB step so it doesn’t sit half-visible under a seam. */}
      {done?.phase === 'welcome' && <WelcomeReveal profileId={done.profileId} />}
      {!consentOpen && (!done || done.phase === 'blow') && (
        <>
          <div className={`${styles.body} ${done?.phase === 'blow' ? styles.blowAway : ''}`}>
            <div key={shown.key} className={`${styles.step} ${leaving ? styles.stepLeaving : ''}`}>
              <h1 ref={titleRef} className={`${styles.title} ${styles.heading}`}>{titleFor(shown, answers)}</h1>
              <StepBody step={shown} answers={answers} set={set} advance={advance} />
            </div>
          </div>
          <div className={`${styles.footer} ${done?.phase === 'blow' ? styles.blowAway : ''}`}>
            {!tapToAnswer && (
              namedEmpty ? (
                <>
                  <Button type="button" fullWidth onClick={() => advance(under.none ?? 'None')}>No</Button>
                  <Button type="button" variant="ghost" fullWidth onClick={skipNamed}>Skip</Button>
                </>
              ) : (
                <Button type="submit" fullWidth disabled={!canContinue}>Continue</Button>
              )
            )}
          </div>
        </>
      )}

      <ConsentSheet
        open={consentOpen}
        name={answers.memberName ?? ''}
        value={value}
        onChange={(v) => set('consent', v)}
        onBack={() => setI(at - 1)}
        onContinue={() => next(answersRef.current)}
      />
    </form>
  );
}
