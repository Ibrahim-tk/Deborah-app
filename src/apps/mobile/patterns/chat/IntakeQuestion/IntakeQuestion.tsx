/**
 * @pattern IntakeQuestion — /wid widgets bound to existing engine question IDs and answer events.
 * Only the current question accepts input. Question copy, ordering and profile writes stay in the engine.
 * F02d: gate "Yes" expands to small pills (Other in the same row); confirm is a circular tick after the
 * last pill. "Other…" focuses the bottom composer — no inline form. Composer stays hidden until Other.
 */
import { useEffect, useRef, useState } from 'react';
import type { IntakeMeta } from '@shared/types/domain';
import { InlineConsent, QuestionChoices } from '@mobile/patterns/widgets';
import { encodeNamedReasons } from '@mobile/patterns/widgets';
import { IntakeFields } from './IntakeFields';
import { MedsNamedReasons } from './MedsNamedReasons';
import styles from './IntakeQuestion.module.css';

/** What should own the answer UI under the thread. */
export type IntakeAnswerSurface = 'choices' | 'composer';

export interface IntakeQuestionProps {
  intake: IntakeMeta;
  prompt?: string;
  layout?: 'list' | 'grid2';
  active: boolean;
  onAnswer: (optionIds: string[], otherText?: string) => void;
  /** Focus the bottom composer for "Other…" (no inline Other form). */
  onOther?: () => void;
  /** Tell the screen when to show or hide the bottom composer. */
  onAnswerSurface?: (surface: IntakeAnswerSurface) => void;
  onSkip?: () => void;
}

export function IntakeQuestion({ intake, active, onAnswer, onOther, onAnswerSurface }: IntakeQuestionProps) {
  const [expanded, setExpanded] = useState(false);
  const [composerOther, setComposerOther] = useState(false);
  const [sent, setSent] = useState(false);
  const submitting = useRef(false);
  const locked = !active || sent;

  const expandOptions = intake.expandOptions;
  const canExpand = Boolean(expandOptions?.length);
  const freeText = intake.input === 'text' || (intake.options.length === 0 && !intake.input);

  const isMedsList = intake.questionId === 'medications' || intake.questionId === 'session-meds';

  const finish = (ids: string[]) => {
    if (locked || submitting.current) return;
    submitting.current = true;
    setSent(true);
    // Keep `yes` — session-concern / session-complete confirm with id "yes".
    // Drop `other` only: that path focuses the composer instead of submitting.
    onAnswer(ids.filter((id) => id !== 'other'));
  };

  useEffect(() => {
    if (!active || !onAnswerSurface) return;
    // Hide the bottom composer only on the expand multi-pill step. Hybrid gates
    // (e.g. "Yes, that's it" / "Something else…") keep the composer visible.
    if (isMedsList || (expanded && !composerOther && !freeText)) onAnswerSurface('choices');
    else onAnswerSurface('composer');
  }, [active, freeText, composerOther, expanded, isMedsList, onAnswerSurface]);

  if (intake.skipped) return <p className={styles.step}>Skipped</p>;
  // F02d: free-text session questions use the composer only — no type-invite pills.
  if (freeText) return null;
  if (intake.input && intake.input !== 'text') {
    return active ? <IntakeFields input={intake.input} onAnswer={onAnswer} /> : null;
  }
  // Canonical InlineConsent card (title + Privacy/Terms body + Not now / Agree) — same as /wid and first-chat ask.
  if (intake.questionId === 'health-consent') {
    return (
      <InlineConsent
        disabled={!active}
        answered={intake.answered ? (intake.answered.includes('agree') ? 'agreed' : 'declined') : undefined}
        onAgree={() => onAnswer(['agree'])}
        onDecline={() => onAnswer(['decline'])}
      />
    );
  }

  // Same NamedReasonList as Health Basics (add pill → sheet → tiles) for meds questions.
  if (isMedsList) {
    return (
      <MedsNamedReasons
        label={intake.questionId === 'session-meds' ? 'New medications' : 'Are you currently taking any medications (Rx or OTC)?'}
        addLabel="Add medicine"
        active={active}
        answered={intake.answered}
        onNone={() => finish(['none'])}
        onSubmit={(entries) => {
          if (locked || submitting.current) return;
          submitting.current = true;
          setSent(true);
          onAnswer(
            entries.map((e) => e.name),
            encodeNamedReasons(entries),
          );
        }}
      />
    );
  }

  const focusComposer = () => {
    if (locked) return;
    setComposerOther(true);
    onOther?.();
  };

  /** Gate: None / Yes — Yes reveals issue or med pills. */
  const onGate = (ids: string[]) => {
    if (locked) return;
    if (canExpand && ids.includes('yes')) {
      setExpanded(true);
      setComposerOther(false);
      return;
    }
    if (ids.includes('other') && onOther) {
      focusComposer();
      return;
    }
    finish(ids);
  };

  if (expanded && expandOptions) {
    return (
      <div className={styles.root}>
        <QuestionChoices
          key="expand"
          label="Select any that apply"
          options={expandOptions}
          multi
          exclusive="none"
          confirm="tick"
          disabled={locked || composerOther}
          answered={intake.answered}
          onOther={focusComposer}
          onSubmit={(ids) => finish(ids)}
        />
        {composerOther && active && !sent && (
          <p className={styles.composerHint}>Type it in the box below, then send.</p>
        )}
      </div>
    );
  }

  // Standard gate. Do not auto-append Other when expand flow owns that path.
  const gateOptions = canExpand
    ? intake.options
    : intake.options.some((o) => o.id === 'other')
      ? intake.options
      : [...intake.options, { id: 'other', label: 'Other…' }];

  return (
    <div className={styles.root}>
      <QuestionChoices
        key="gate"
        label="Answer options"
        options={gateOptions}
        multi={intake.multi}
        exclusive="none"
        disabled={locked || composerOther}
        answered={intake.answered ?? (composerOther ? ['other'] : undefined)}
        onSubmit={onGate}
        onOther={onOther ? focusComposer : undefined}
      />
      {composerOther && active && !sent && (
        <p className={styles.composerHint}>Type it in the box below, then send.</p>
      )}
    </div>
  );
}
