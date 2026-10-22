/**
 * @pattern ComposerOptions — a list-style intake question docked inside the Composer card
 *          (design direction 2026-10-12): option rows above the text field, one tap answers.
 *          "Other…" is not a row here: typing in the composer is the other answer.
 * @usedBy  M-2.1 (intake, quiz questions)
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (States › intake)
 * @xref    web: apps/web/patterns/chat/ComposerOptions — not built
 */
import type { IntakeMeta } from '@shared/types/domain';
import styles from './ComposerOptions.module.css';

export interface ComposerOptionsProps {
  intake: IntakeMeta;
  onAnswer: (optionIds: string[]) => void;
  onSkip: () => void;
}

export function ComposerOptions({ intake, onAnswer, onSkip }: ComposerOptionsProps) {
  const options = intake.options.filter((o) => o.id !== 'other');
  return (
    <div className={styles.root}>
      <ul className={styles.list} role="radiogroup" aria-label="Answer options">
        {options.map((o) => (
          <li key={o.id}>
            <button type="button" role="radio" aria-checked={false} className={styles.row} onClick={() => onAnswer([o.id])}>
              {o.label}
            </button>
          </li>
        ))}
      </ul>
      {!intake.noSkip && (
        <button type="button" className={styles.skip} onClick={onSkip}>Skip</button>
      )}
    </div>
  );
}
