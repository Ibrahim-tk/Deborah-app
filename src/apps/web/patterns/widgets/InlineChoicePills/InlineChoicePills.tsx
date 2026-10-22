/**
 * @pattern InlineChoicePills — compact frosted pills for in-chat answers (smaller than intake pills).
 *          Multi mode + optional `endSlot` (circular confirm tick) after the last pill.
 * @usedBy  QuestionChoices in chat (IntakeQuestion, FlowChoice, /wid) — not for Health Basics forms
 * OPEN: DESIGN.md bans pills; used here by design direction 2026-10-14.
 */
import { useState, type CSSProperties, type ReactNode } from 'react';
import styles from './InlineChoicePills.module.css';

export interface InlineChoicePillsProps {
  label: string;
  options: string[];
  onPick: (option: string, index: number) => void;
  keepAnswer?: boolean;
  selected?: string[];
  onToggle?: (option: string, index: number) => void;
  disabled?: boolean;
  optionIds?: string[];
  endSlot?: ReactNode;
}

export function InlineChoicePills({
  label,
  options,
  onPick,
  keepAnswer,
  selected,
  onToggle,
  disabled,
  optionIds,
  endSlot,
}: InlineChoicePillsProps) {
  const [picked, setPicked] = useState<number>();
  return (
    <div className={styles.root} role="group" aria-label={label}>
      {options.map((o, i) => (
        <button
          key={`${i}-${o}`}
          data-choice-id={optionIds?.[i]}
          type="button"
          className={styles.pill}
          style={{ '--i': i } as CSSProperties}
          aria-pressed={selected ? selected.includes(o) : keepAnswer ? picked === i : undefined}
          disabled={disabled || (!onToggle && keepAnswer && picked !== undefined && picked !== i)}
          onClick={() => {
            if (disabled) return;
            if (onToggle) return onToggle(o, i);
            if (picked !== undefined && keepAnswer) return;
            setPicked(i);
            onPick(o, i);
          }}
        >
          {o}
        </button>
      ))}
      {endSlot}
    </div>
  );
}
