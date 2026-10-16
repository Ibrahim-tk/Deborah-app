/**
 * @pattern ChoicePills — short answers (yes / no, a few words) as small frosted pills that answer on tap,
 *          the same pill as the onboarding health questions. Once picked, the choice stays highlighted
 *          (tint + border only — no checkmark).
 *          Multi mode (`selected` + `onToggle`): pills toggle on and off, a compact multi-select.
 *          Optional `endSlot` sits after the last pill (e.g. circular confirm tick).
 * @usedBy  M-2.12 (FlowChoice yes/no), widget lab (/wid), IntakeQuestion expand
 * OPEN: DESIGN.md bans pills; used here by design direction 2026-10-14.
 */
import { useState, type CSSProperties, type ReactNode } from 'react';
import styles from './ChoicePills.module.css';

export interface ChoicePillsProps {
  label: string;
  options: string[];
  onPick: (option: string, index: number) => void;
  /** Keep the answered state visible in the thread instead of the parent removing the pills. */
  keepAnswer?: boolean;
  /** Multi-select: controlled selection; tapping toggles instead of answering. */
  selected?: string[];
  onToggle?: (option: string, index: number) => void;
  disabled?: boolean;
  optionIds?: string[];
  /** Rendered after the last pill in the same wrapping row (F02d circular tick). */
  endSlot?: ReactNode;
}

export function ChoicePills({ label, options, onPick, keepAnswer, selected, onToggle, disabled, optionIds, endSlot }: ChoicePillsProps) {
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
