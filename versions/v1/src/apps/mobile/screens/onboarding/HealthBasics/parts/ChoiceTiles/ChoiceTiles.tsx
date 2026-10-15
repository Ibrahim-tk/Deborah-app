/**
 * EXPLORATION (2026-10-13): single choice as quiz-style pills, label left-aligned.
 * The picked pill tints with an accent rim before the screen moves on.
 */
import type { CSSProperties } from 'react';
import styles from './ChoiceTiles.module.css';

export interface ChoiceTilesProps {
  label: string;
  choices: { value: string; label: string }[];
  value: string;
  onPick: (value: string) => void;
}

export function ChoiceTiles({ label, choices, value, onPick }: ChoiceTilesProps) {
  return (
    <div className={styles.root} data-dense={choices.length > 4 || undefined} role="radiogroup" aria-label={label}>
      {choices.map((c, i) => (
        <button
          key={c.value}
          type="button"
          role="radio"
          aria-checked={value === c.value}
          className={styles.option}
          style={{ '--i': i } as CSSProperties}
          onClick={() => onPick(c.value)}
        >
          <span className={styles.label}>{c.label}</span>
        </button>
      ))}
    </div>
  );
}
