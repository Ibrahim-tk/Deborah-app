/**
 * @pattern ChoicePills — short answers (yes / no, a few words) as small frosted pills that answer on tap,
 *          the same pill as the onboarding health questions. Once picked, the choice stays highlighted.
 *          Multi mode (`selected` + `onToggle`): pills toggle on and off, a compact multi-select.
 * @usedBy  M-2.12 (FlowChoice yes/no), widget lab (/wid)
 * OPEN: DESIGN.md bans pills; used here by design direction 2026-10-14.
 */
import { useState, type CSSProperties } from 'react';
import { Icon } from '@mobile/ui';
import styles from './ChoicePills.module.css';

export interface ChoicePillsProps {
  label: string;
  options: string[];
  onPick: (option: string, index: number) => void;
  /** Keep the answered state visible in the thread instead of the parent removing the pills. */
  keepAnswer?: boolean;
  /** Multi-select: controlled selection; tapping toggles instead of answering. */
  selected?: string[];
  onToggle?: (option: string) => void;
}

export function ChoicePills({ label, options, onPick, keepAnswer, selected, onToggle }: ChoicePillsProps) {
  const [picked, setPicked] = useState<number>();
  return (
    <div className={styles.root} role="group" aria-label={label}>
      {options.map((o, i) => (
        <button
          key={o}
          type="button"
          className={styles.pill}
          style={{ '--i': i } as CSSProperties}
          aria-pressed={onToggle ? Boolean(selected?.includes(o)) : keepAnswer ? picked === i : undefined}
          disabled={!onToggle && keepAnswer && picked !== undefined && picked !== i}
          onClick={() => {
            if (onToggle) return onToggle(o);
            if (picked !== undefined && keepAnswer) return;
            setPicked(i);
            onPick(o, i);
          }}
        >
          {(onToggle ? selected?.includes(o) : keepAnswer && picked === i) && <Icon name="check" size={16} />}
          {o}
        </button>
      ))}
    </div>
  );
}
