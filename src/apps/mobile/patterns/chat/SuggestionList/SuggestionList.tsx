/**
 * @pattern SuggestionList — "Try asking:" + 3 starter prompts as borderless rows, each led by an
 *          AI-search icon. Rows sit straight on the canvas; only the pressed row takes a lilac tint.
 * @usedBy  M-2.1 (focused + empty)
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (States › focused)
 * @xref    web: apps/web/patterns/chat/SuggestionList — not built
 */
import type { Suggestion } from '@shared/types/content';
import { Icon } from '@mobile/ui';
import styles from './SuggestionList.module.css';

export interface SuggestionListProps {
  suggestions: Suggestion[];
  onSelect: (s: Suggestion) => void;
}

export function SuggestionList({ suggestions, onSelect }: SuggestionListProps) {
  return (
    // mousedown is swallowed so tapping a row doesn't blur the composer first.
    <div className={styles.root} onMouseDown={(e) => e.preventDefault()} data-placeholder>
      <p className={styles.label} id="suggestions-label">Try asking</p>
      <ul className={styles.list} aria-labelledby="suggestions-label">
        {suggestions.map((s) => (
          <li key={s.id}>
            <button type="button" className={styles.row} onClick={() => onSelect(s)}>
              <span className={styles.icon}>
                <Icon name="aiSearch" size={18} />
              </span>
              <span className={styles.text}>{s.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
