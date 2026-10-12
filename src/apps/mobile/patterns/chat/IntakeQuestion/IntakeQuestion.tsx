/**
 * @pattern IntakeQuestion — progressive intake inline in the chat (design direction 2026-10-12).
 *          `pills` = yes/no and short answers, one tap · `quiz` = plain option card for lists with
 *          "Other…". Every tap answers at once — no Done buttons, no "n of N".
 *          "Other…" turns into a text field in place; return sends it. Field mode: an iOS-style
 *          date wheel, or height + weight rulers, which commit with a Select button.
 *          Pills are the user's explicit call here, overriding DESIGN.md's pill ban for intake answers.
 *          No Skip link (design direction 2026-10-12): every question ends with "Other…" instead, so
 *          the user can answer in their own words (or say they'd rather not) — typed in the chat's
 *          input bar, which "Other…" focuses.
 * @usedBy  M-2.1 (intake)
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (States › intake)
 * @xref    web: apps/web/patterns/chat/IntakeQuestion — not built
 */
import { useEffect, useRef, useState } from 'react';
import type { IntakeMeta } from '@shared/types/domain';
import { IntakeFields } from './IntakeFields';
import styles from './IntakeQuestion.module.css';

const OTHER_ID = 'other';

export interface IntakeQuestionProps {
  intake: IntakeMeta;
  /** Kept for API compatibility. */
  layout?: 'list' | 'grid2';
  /** Only the latest unanswered question is interactive. */
  active: boolean;
  onAnswer: (optionIds: string[], otherText?: string) => void;
  /** "Other…": hand off to the chat's input bar (the typed message answers the question). Without it, the row becomes a field in place. */
  onOther?: () => void;
  /** Kept for API compatibility: the inline question has no Skip link ("Other…" replaces it). */
  onSkip?: () => void;
}

export function IntakeQuestion({ intake, active, onAnswer, onOther }: IntakeQuestionProps) {
  const [otherOn, setOtherOn] = useState(false);
  const [otherText, setOtherText] = useState('');
  const otherRef = useRef<HTMLInputElement>(null);
  const quiz = intake.presentation === 'quiz';

  // Every question ends with "Other…"; questions that don't list one get it added.
  const options = intake.options.some((o) => o.id === OTHER_ID) ? intake.options : [...intake.options, { id: OTHER_ID, label: 'Other…' }];
  const select = (id: string) => (id !== OTHER_ID ? onAnswer([id]) : onOther ? onOther() : setOtherOn(true));

  useEffect(() => {
    if (otherOn) otherRef.current?.focus();
  }, [otherOn]);

  if (!active) return intake.skipped ? <p className={styles.step}>Skipped</p> : null;
  if (intake.input) return <IntakeFields input={intake.input} onAnswer={onAnswer} />;

  return (
    <div className={styles.root}>
      <ul className={quiz ? styles.list : styles.pills} data-quiz={quiz || undefined} role="radiogroup" aria-label="Answer options">
        {options.map((o) => (
          <li key={o.id}>
            {o.id === OTHER_ID && otherOn ? (
              <input
                ref={otherRef}
                className={styles.row}
                data-on
                value={otherText}
                enterKeyHint="send"
                onChange={(e) => setOtherText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && otherText.trim()) onAnswer([OTHER_ID], otherText);
                  if (e.key === 'Escape') setOtherOn(false);
                }}
                onBlur={() => !otherText.trim() && setOtherOn(false)}
                placeholder="Type it and press return…"
                aria-label="Other answer"
              />
            ) : (
              <button type="button" className={styles.row} role="radio" aria-checked={false} onClick={() => select(o.id)}>
                {o.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
