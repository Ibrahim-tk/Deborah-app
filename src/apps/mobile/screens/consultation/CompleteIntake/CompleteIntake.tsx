/**
 * @screen  M-2.14 · Health Profile
 * @flow    Optional clinical questionnaire after short onboarding
 * @presentation push
 * @states  question (one per screen, bloom grows per step) · resume at first unanswered · saved
 * @spec    Discovery 2026-10-19 — reproductive, puberty, medicines, and Genesis Gold live here
 * @xref    web: not built
 *
 * Same template as the onboarding intake (M-1.8, design request 2026-10-20): living backdrop, the
 * flowering tree as progress (paced to this profile's step count), one question at a time.
 * Nav bar: glass back (previous question, or leave) · "Health profile" · glass check (save and close).
 */
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { Aura, Button, GlassButton, GradientShift, Header } from '@mobile/ui';
import { namedReasonsComplete } from '@mobile/patterns/widgets';
import { StepBody } from '@mobile/screens/onboarding/HealthBasics/parts/StepBody';
import { BloomReveal3 } from '@mobile/screens/onboarding/HealthBasics/parts/BloomReveal3';
import { useTitleFade } from '@mobile/screens/onboarding/HealthBasics/parts/useTitleFade';
import { answersFromProfile } from '@mobile/screens/onboarding/HealthBasics/healthProfile';
import { saveHealthProfile } from '@mobile/screens/onboarding/HealthBasics/saveOnboarding';
import { bloomProgress, profileVisibleSteps, titleFor, type Answers } from '@mobile/screens/onboarding/HealthBasics/steps';
import template from '@mobile/screens/onboarding/HealthBasics/HealthBasics.module.css';
import { useNav } from '@mobile/navigation';
import styles from './CompleteIntake.module.css';

const NAME_PATTERN = /^[\p{L}][\p{L}\s'’-]*$/u;
const CONFIRM_MS = 280;

export default function CompleteIntake() {
  const { pop } = useNav();
  const profile = useAppStore(selectActiveProfile);
  const [answers, setAnswers] = useState<Answers>(() => (profile ? answersFromProfile(profile) : {}));
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  const steps = profileVisibleSteps(answers);
  // Resume at the first unanswered question.
  const [i, setI] = useState(() => {
    const seeded = profile ? answersFromProfile(profile) : {};
    const open = profileVisibleSteps(seeded).findIndex((s) => !seeded[s.key]?.trim());
    return open < 0 ? 0 : open;
  });
  const at = Math.min(i, Math.max(0, steps.length - 1));
  const step = steps[at];
  // Refs so delayed advance() (CONFIRM_MS) always finishes against the step that was answered,
  // and so "last" is computed from post-answer visible steps — not a stale render flag.
  const stepRef = useRef(step);
  stepRef.current = step;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const fade = useTitleFade(step?.key ?? 'none', titleRef);
  const value = step ? (answers[step.key] ?? '') : '';
  const last = steps.length > 0 && at === steps.length - 1;

  const persist = (final: Answers) => {
    if (profile) saveHealthProfile(profile.id, final);
  };
  const close = () => {
    persist(answersRef.current);
    pop();
  };
  const set = (key: string, v: string) => {
    setAnswers((current) => {
      const next = { ...current, [key]: v };
      answersRef.current = next;
      return next;
    });
  };
  /** Persist, then pop when this answer leaves no further profile steps (Done). */
  const next = (final: Answers, answeredKey?: string) => {
    const key = answeredKey ?? stepRef.current?.key;
    if (key && stepRef.current?.key === key && stepRef.current.presentation === 'ageWheel' && !final[key]) {
      final = { ...final, [key]: '12' };
      answersRef.current = final;
      setAnswers(final);
    }
    persist(final);
    const visible = profileVisibleSteps(final);
    const idx = key ? visible.findIndex((s) => s.key === key) : -1;
    // Gone, or answered the last visible question → same as glass check (Done).
    if (idx < 0 || idx >= visible.length - 1) pop();
    else setI(idx + 1);
  };
  const advance = (v: string, extra?: Answers) => {
    const current = stepRef.current;
    if (!current) return;
    const key = current.key;
    const final = { ...answersRef.current, ...extra, [key]: v };
    answersRef.current = final;
    setAnswers(final);
    // Capture key now — after setAnswers, visible steps / stepRef may change before the timer.
    window.setTimeout(() => next(final, key), current.kind === 'text' ? 0 : CONFIRM_MS);
  };
  const goBack = () => {
    persist(answersRef.current);
    if (at > 0) setI(at - 1);
    else pop();
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
      step.kind === 'date' || step.kind === 'year' || step.kind === 'measure' ||
      textOk ||
      (step.kind === 'name' && NAME_PATTERN.test(value.trim())));
  const tapToAnswer = step?.kind === 'choice';
  // Empty namedReasons → Skip + No; any named row → Continue (No becomes Continue).
  const namedEmpty = !!step && step.presentation === 'namedReasons' && !namedReasonsComplete(value, step.none);
  // OPEN: Skip vs No — Skip leaves unanswered (no None write); No = confirmed none. Product may later want an explicit "prefer not to say" token.
  const skipNamed = () => {
    if (!step) return;
    const final = { ...answersRef.current };
    if (!namedReasonsComplete(final[step.key], step.none)) delete final[step.key];
    answersRef.current = final;
    setAnswers(final);
    next(final);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (canContinue) next(answersRef.current);
  };

  if (!profile) return null;

  return (
    <form className={template.root} onSubmit={submit} noValidate data-xref="M-2.14 · Health profile">
      <Aura />
      <GradientShift />
      <div className={styles.bar}>
        <Header
          large={false}
          transparent
          left={<GlassButton icon="back" aria-label={at > 0 ? 'Previous question' : 'Back'} onClick={goBack} />}
          // Plain tick, no progress ring (design 2026-10-21); the count moved under the title.
          right={<GlassButton icon="check" aria-label="Save and close" onClick={close} />}
        />
      </div>
      {/* Same 3D Genesis tree as M-1.8; progress paced to this profile's step count via bloomProgress. */}
      <div className={template.art} role="progressbar" aria-label="Health profile" aria-valuemin={1} aria-valuemax={Math.max(1, steps.length)} aria-valuenow={at + 1} aria-valuetext={`Question ${at + 1} of ${steps.length}`}>
        <BloomReveal3 progress={bloomProgress(at, Math.max(1, steps.length))} />
      </div>
      <div className={template.fade} style={{ height: fade.height, '--feather': `${fade.feather}px` } as CSSProperties} aria-hidden="true"><i /><i /><i /></div>
      <div className={template.body}>
        <div key={step?.key ?? 'none'} className={template.step}>
          <h1 ref={titleRef} className={`${template.title} ${template.heading}`}>
            {step ? titleFor(step, answers) : 'Nothing else applies to this profile right now.'}
          </h1>
          {step && <StepBody step={step} answers={answers} set={set} advance={advance} />}
        </div>
      </div>
      <div className={template.footer}>
        {step && !tapToAnswer && (
          namedEmpty ? (
            <>
              <Button type="button" fullWidth onClick={() => advance(step.none ?? 'None')}>No</Button>
              <Button type="button" variant="ghost" fullWidth onClick={skipNamed}>Skip</Button>
            </>
          ) : (
            <Button type="submit" fullWidth disabled={!canContinue}>{last ? 'Save profile' : 'Continue'}</Button>
          )
        )}
      </div>
    </form>
  );
}
