/**
 * @pattern SuggestedQuestions — follow-up questions as borderless rows led by an AI-search icon
 *          (same treatment as the "Try asking" SuggestionList).
 * @usedBy  M-2.1 (ready, answered)
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (States › ready)
 * @xref    web: apps/web/patterns/chat/SuggestedQuestions — not built
 */
import { Icon } from '@mobile/ui';
import styles from './SuggestedQuestions.module.css';

export interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (q: string) => void;
  disabled?: boolean;
}

export function SuggestedQuestions({ questions, onSelect, disabled }: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;
  return (
    <div className={styles.root} data-placeholder>
      <p className={styles.label}>You could ask</p>
      <ul className={styles.list} aria-label="Suggested questions">
        {questions.map((q) => (
          <li key={q}>
            <button type="button" className={styles.row} disabled={disabled} onClick={() => onSelect(q)}>
              <span className={styles.icon}>
                <Icon name="aiSearch" size={18} />
              </span>
              <span className={styles.text}>{q}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
