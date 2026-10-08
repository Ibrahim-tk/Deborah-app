/**
 * @pattern IntakeQuestion — MCQ-style compact rows (no marks) in one white container; the
 *          selected row takes a subtle lilac fill. Single = tap to answer; multi = tap to toggle, then Done.
 *          Tapping "other" turns that row into a text field in place. Footer: "n of N · Skip" (+ Done).
 * @usedBy  M-2.1 (intake)
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (States › intake)
 * @xref    web: apps/web/patterns/chat/IntakeQuestion — not built
 */
import { useEffect, useRef, useState } from 'react';
import type { IntakeMeta } from '@shared/types/domain';
import styles from './IntakeQuestion.module.css';

const OTHER_ID = 'other';

export interface IntakeQuestionProps {
  intake: IntakeMeta;
  /** Kept for API compatibility; options always render as a single list. */
  layout?: 'list' | 'grid2';
  /** Only the latest unanswered question is interactive. */
  active: boolean;
  onAnswer: (optionIds: string[], otherText?: string) => void;
  onSkip: () => void;
}

export function IntakeQuestion({ intake, active, onAnswer, onSkip }: IntakeQuestionProps) {
  const [picked, setPicked] = useState<string[]>([]);
  const [otherText, setOtherText] = useState('');
  const otherRef = useRef<HTMLInputElement>(null);
  const otherOn = picked.includes(OTHER_ID);

  useEffect(() => {
    if (otherOn) otherRef.current?.focus();
  }, [otherOn]);

  if (!active) {
    return intake.skipped ? <p className={styles.step}>Skipped</p> : null;
  }

  const select = (id: string) => {
    if (intake.multi) {
      setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    } else if (id === OTHER_ID) {
      setPicked([OTHER_ID]);
    } else {
      onAnswer([id]);
    }
  };

  const canSubmit = picked.length > 0 && (!otherOn || otherText.trim().length > 0);
  const showDone = intake.multi || otherOn;

  return (
    <div className={styles.root}>
      <ul className={styles.list} role={intake.multi ? 'group' : 'radiogroup'} aria-label="Answer options">
        {intake.options.map((o) => {
          const on = picked.includes(o.id);
          return (
            <li key={o.id}>
              {o.id === OTHER_ID && on ? (
                // The "Other" row itself turns into the text field (same size and fill).
                <input
                  ref={otherRef}
                  className={styles.row}
                  data-on
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canSubmit) onAnswer(picked, otherOn ? otherText : undefined);
                    if (e.key === 'Escape') setPicked((p) => p.filter((x) => x !== OTHER_ID));
                  }}
                  onBlur={() => !otherText.trim() && setPicked((p) => p.filter((x) => x !== OTHER_ID))}
                  placeholder="Type your answer…"
                  aria-label="Other answer"
                />
              ) : (
                <button
                  type="button"
                  className={styles.row}
                  role={intake.multi ? 'checkbox' : 'radio'}
                  aria-checked={on}
                  data-on={on || undefined}
                  onClick={() => select(o.id)}
                >
                  {o.label}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <div className={styles.foot}>
        <span className={styles.step}>
          {intake.step} of {intake.of}
        </span>
        <button type="button" className={styles.skip} onClick={onSkip}>
          Skip
        </button>
        {showDone && (
          <button type="button" className={styles.done} disabled={!canSubmit} onClick={() => onAnswer(picked, otherOn ? otherText : undefined)}>
            Done
          </button>
        )}
      </div>
    </div>
  );
}
