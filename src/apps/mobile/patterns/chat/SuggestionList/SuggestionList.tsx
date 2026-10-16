/**
 * @pattern SuggestionList — starter prompts (no visible label; named for screen readers) as a horizontal,
 *          swipeable rail of warm-glass cards, an AI-search icon left of each prompt. Cards snap and bleed to the screen edge.
 * @usedBy  M-2.1 (empty — always shown on a new chat, focused or not)
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
      <ul className={styles.list} aria-label="Suggested questions">
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
