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
 * Web: full window over the app (no sidebar). Text Back top-left · Done (filled) top-right (save and close).
 * Footer: Back left · Next/Save right. Choice steps tap-to-advance (last answer = Done); other picks use Next.
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { Button, OVERLAY_HOST_ID, TextReveal } from '@web/ui';
import { PageFooter } from '@web/patterns/shell';
import { namedReasonsComplete } from '@web/patterns/widgets';
import { StepBody } from '@web/screens/onboarding/HealthBasics/parts/StepBody';
import { BloomReveal3 } from '@web/screens/onboarding/HealthBasics/parts/BloomReveal3';
import { answersFromProfile } from '@web/screens/onboarding/HealthBasics/healthProfile';
import { saveHealthProfile } from '@web/screens/onboarding/HealthBasics/saveOnboarding';
import { bloomProgress, profileVisibleSteps, titleFor, type Answers } from '@web/screens/onboarding/HealthBasics/steps';
import template from '@web/screens/onboarding/HealthBasics/HealthBasics.module.css';
import { useNav, useNavStore } from '@web/navigation';
import styles from './CompleteIntake.module.css';

const NAME_PATTERN = /^[\p{L}][\p{L}\s'’-]*$/u;
const CONFIRM_MS = 280;

// Finish timing: content exit (template .root[data-exiting] .main: 500ms delay + 1300ms), then wind before leaving.
const CONTENT_OUT_MS = 1600;
const WIND_OUT_MS = 3500;

export default function CompleteIntake() {
  const { pop } = useNav();
  // Paint the full-window page only while this route is on top.
  const onTop = useNavStore((st) => st.layers.length === 0 && st.tabs[st.activeTab].at(-1)?.id === 'M-2.14');
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
  const value = step ? (answers[step.key] ?? '') : '';
  const last = steps.length > 0 && at === steps.length - 1;

  const persist = (final: Answers) => {
    if (profile) saveHealthProfile(profile.id, final);
  };
  // Finish (last answer / Save profile): content fades out first, then the tree's native wind, then back to the app.
  const [exiting, setExiting] = useState(false);
  const [wind, setWind] = useState(false);
  const [saved, setSaved] = useState(false);
  const finishOut = () => {
    if (exiting) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setSaved(true);
    setExiting(true);
    window.setTimeout(() => setWind(true), CONTENT_OUT_MS);
    // No navigation: the saved message reveals on this same screen once the tree has gone.
    window.setTimeout(() => setSaved(true), CONTENT_OUT_MS + WIND_OUT_MS);
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
    // Gone, or answered the last visible question → same as header Done.
    if (idx < 0 || idx >= visible.length - 1) finishOut();
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
  // Choice rows tap-to-advance (incl. Genesis Gold last step → persist + Done).
  const tapToAnswer = step?.kind === 'choice';
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (canContinue) next(answersRef.current);
  };
  // Empty namedReasons → Skip + No; any named row → Next (No becomes Next).
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

  if (!profile) return null;

  const page = (
    <form className={`${template.root} ${styles.page}`} onSubmit={submit} noValidate data-exiting={exiting || undefined} data-xref="M-2.14 · Health profile">
      {/* 3D tree (same engine/placement as W-1.8 onboarding). */}
      <BloomReveal3 progress={bloomProgress(at, Math.max(1, steps.length))} wind={wind} className={wind ? styles.treeOut : undefined} />
      <div className={`${styles.bar} ${exiting ? styles.barOut : ''}`}>
        <Button type="button" variant="ghost" size="sm" leadingIcon="back" onClick={goBack}>Back</Button>
        <Button type="button" size="sm" onClick={close}>Done</Button>
      </div>
      <div className={template.layout}>
        <div className={template.main}>
          <div className={template.stage}>
            <div className={template.body}>
              <div key={step?.key ?? 'none'} className={template.step}>
                <h1 className={`${template.title} ${template.heading}`}>
                  <TextReveal as="span" text={step ? titleFor(step, answers) : 'Nothing else applies to this profile right now.'} delay={180} stagger={22} />
                </h1>
                {step && <StepBody step={step} answers={answers} set={set} advance={advance} advanceOnPick />}
              </div>
            </div>
            <div className={template.footer}>
              {step && (
                <div className={template.navRow}>
                  <Button type="button" variant="ghost" onClick={goBack}>Back</Button>
                  {!tapToAnswer && namedEmpty && (
                    <Button type="button" variant="ghost" onClick={skipNamed}>Skip</Button>
                  )}
                  {!tapToAnswer && (namedEmpty ? (
                    <Button type="button" onClick={() => advance(step.none ?? 'None')}>No</Button>
                  ) : (
                    <Button type="submit" disabled={!canContinue}>{last ? 'Save profile' : 'Next'}</Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={template.art} role="progressbar" aria-label="Health profile" aria-valuemin={1} aria-valuemax={Math.max(1, steps.length)} aria-valuenow={at + 1} aria-valuetext={`Question ${at + 1} of ${steps.length}`}>
        </div>
      </div>
      {saved && (
        // OPEN: saved-state copy is placeholder until Deborah approves it.
        <div className={styles.saved} data-overlay data-placeholder>
          <TextReveal as="h1" className={styles.savedTitle} text="Your health profile is saved." delay={200} />
          <TextReveal as="p" className={styles.savedBody} text="The Oracle will use it to tailor every conversation." delay={700} />
          <div className={styles.savedCta}><Button type="button" onClick={pop}>Back to home</Button></div>
        </div>
      )}
      <PageFooter />
    </form>
  );

  const host = document.getElementById(OVERLAY_HOST_ID);
  return onTop && host ? createPortal(page, host) : null;
}
