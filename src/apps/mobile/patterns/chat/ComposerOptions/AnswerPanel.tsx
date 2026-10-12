/**
 * @pattern AnswerPanel — the onboarding answer card (design direction 2026-10-12). While the
 *          health profile is being filled in, the chat composer steps aside and multiple-choice
 *          questions show their options here, in a card shaped exactly like the composer. The last
 *          row, "Other…", turns into a text field in place; return sends what was typed.
 *          Render with `key={intake.questionId}` so each question starts closed.
 * @usedBy  M-2.1 (intake questions, pills and quiz)
 * @xref    web: apps/web/patterns/chat/AnswerPanel — not built
 */
import { useEffect, useRef, useState } from 'react';
import type { IntakeMeta } from '@shared/types/domain';
import { Icon } from '@mobile/ui';
import styles from './ComposerOptions.module.css';

const OTHER_ID = 'other';

export interface AnswerPanelProps {
  intake: IntakeMeta;
  onAnswer: (optionIds: string[]) => void;
  /** Typed "Other…" answer. */
  onOther: (text: string) => void;
}

export function AnswerPanel({ intake, onAnswer, onOther }: AnswerPanelProps) {
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const field = useRef<HTMLInputElement>(null);
  const options = intake.options.filter((o) => o.id !== OTHER_ID);

  useEffect(() => {
    if (typing) field.current?.focus();
  }, [typing]);

  const submit = () => text.trim() && onOther(text.trim());

  return (
    <div className={styles.panel} role="group" aria-label="Answer options">
      <ul className={styles.list} role="radiogroup">
        {options.map((o) => (
          <li key={o.id}>
            <button type="button" role="radio" aria-checked={false} className={styles.row} onClick={() => onAnswer([o.id])}>
              {o.label}
            </button>
          </li>
        ))}
        <li>
          {typing ? (
            <form
              className={styles.otherRow}
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <input
                ref={field}
                className={styles.otherField}
                value={text}
                enterKeyHint="send"
                placeholder="Type your answer…"
                aria-label="Other answer"
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setTyping(false)}
              />
              <button type="submit" className={styles.otherSend} disabled={!text.trim()} aria-label="Send">
                <Icon name="send" size={18} />
              </button>
            </form>
          ) : (
            <button type="button" className={styles.row} onClick={() => setTyping(true)}>
              Other…
            </button>
          )}
        </li>
      </ul>
    </div>
  );
}
