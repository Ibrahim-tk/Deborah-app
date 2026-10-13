/**
 * @screen  M-1.8 · A few things Deborah should know
 * @flow    F01 First launch & onboarding (design direction 2026-10-13 rev 5)
 * @presentation full screen, right after the sign-up sheet's "You're in" (M-1.4)
 * @states  who is this for (first) · step n · text step with "None"
 * @figma   —
 * @spec    docs/ux/F01-onboarding.md (OPEN: add M-1.8 to the spec)
 * @xref    web: W-1.8 — not built
 *
 * The persistent clinical basics as a fast form, not a conversation: choices advance on tap, lists have a
 * one-tap "None". The questions and their `showIf` rules live in data/intake/healthBasics.json.
 * Finishing opens Deborah's "let's talk" sheet (M-1.9) over this screen; the first chat message asks for
 * health-data consent before these answers are saved.
 */
import { useState, type FormEvent } from 'react';
import { useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import { Aura, Button, GlassButton, GradientShift } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import { holdHealthBasics } from '@mobile/hooks/healthBasics';
import { bloomProgress, visibleSteps, type Answers } from './steps';
import { StepBody } from './parts/StepBody';
import { BloomReveal } from './parts/BloomReveal';
import styles from './HealthBasics.module.css';

const THIS_YEAR = new Date().getFullYear();
// Long enough to see a tapped tile or row confirm before the next question.
const CONFIRM_MS = 280;

export default function HealthBasics() {
  const { presentSheet, pop } = useNav();
  const [answers, setAnswers] = useState<Answers>({ birthYear: String(THIS_YEAR - 45) });
  const [i, setI] = useState(0);
  const steps = visibleSteps(answers);
  const step = steps[Math.min(i, steps.length - 1)];
  const value = answers[step.key] ?? '';
  const last = i === steps.length - 1;

  const finish = (final: Answers) => {
    // Only questions still shown count (a later "Male" drops an earlier hormonal answer); "None" is empty.
    const shown = visibleSteps(final);
    const kept = shown.flatMap((st) => (st.kind === 'measure' ? ['heightCm', 'weightKg'] : [st.key]).map((k) => [k, final[k] === st.none ? '' : final[k]]));
    holdHealthBasics(Object.fromEntries(kept));
    const s = useAppStore.getState();
    const at = nowFrom(s).toISOString();
    // Not health data, so it is stored now (no consent needed).
    if (final.profileFor) s.updateIntake(s.activeProfileId, { profileFor: final.profileFor as 'self' | 'dependent' });
    s.setIntakeProgress(s.activeProfileId, { step: 'done', completedAt: at, closedAt: at });
    // Deborah's sheet opens over the full bloom; "Start my journey" then goes straight to the first chat.
    presentSheet('M-1.9');
  };

  const set = (key: string, v: string) => setAnswers((a) => ({ ...a, [key]: v }));
  const next = (final: Answers) => (last ? finish(final) : setI(i + 1));
  const advance = (v: string) => {
    const final = { ...answers, [step.key]: v };
    setAnswers(final);
    window.setTimeout(() => next(final), step.kind === 'text' ? 0 : CONFIRM_MS);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) next(answers);
  };

  const canContinue = step.kind === 'year' || step.kind === 'measure' || (step.kind === 'text' && Boolean(value.trim()));
  const tapToAnswer = step.kind === 'choice' || step.kind === 'profileFor';

  return (
    <form className={styles.root} onSubmit={submit} noValidate data-xref="M-1.8 · Health basics">
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
      {/* The progress indicator: a jacaranda that grows with every answer; its transparent background sits straight on the backdrop. */}
      <div className={styles.art} aria-label={`Question ${i + 1} of ${steps.length}`}>
        <BloomReveal className={styles.bloom} progress={bloomProgress(i, steps.length)} />
      </div>
      <div className={styles.body}>
        <div key={step.key} className={styles.step}>
          <h1 className={`${styles.title} ${styles.heading}`}>{step.title}</h1>
          <StepBody step={step} answers={answers} set={set} advance={advance} />
        </div>
      </div>
      <div className={styles.footer}>
        {!tapToAnswer && <Button type="submit" fullWidth disabled={!canContinue}>Continue</Button>}
      </div>
    </form>
  );
}
