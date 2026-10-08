/**
 * @pattern OutOfScopeReply — honest scope line (rendered by MessageBubble) + compact escalation
 *          + "Things I can help with:" option rows that start a normal consultation
 * @usedBy  M-2.1
 * @spec    docs/ux/F03-safety.md#pattern--outofscopereply-figma-34
 * @xref    web: apps/web/patterns/safety/OutOfScopeReply — not built
 */
import type { Suggestion } from '@shared/types/content';
import { OptionList, OptionRow } from '@mobile/ui';
import styles from './OutOfScopeReply.module.css';

export interface OutOfScopeReplyProps {
  suggestions: Suggestion[];
  onBook: () => void;
  onSelect: (s: Suggestion) => void;
  disabled?: boolean;
}

export function OutOfScopeReply({ suggestions, onBook, onSelect, disabled }: OutOfScopeReplyProps) {
  return (
    <div className={styles.root}>
      <OptionRow chevron leadingIcon="calendar" onSelect={onBook}>Want my personal opinion? Book a consultation with me</OptionRow>
      <p className={styles.label}>Things I can help with:</p>
      <OptionList label="Things I can help with">
        {suggestions.slice(0, 3).map((s) => (
          <OptionRow key={s.id} disabled={disabled} onSelect={() => onSelect(s)}>{s.text}</OptionRow>
        ))}
      </OptionList>
    </div>
  );
}
