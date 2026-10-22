/**
 * @pattern MoodScale — five drawn faces from "Rough" to "Great" for a quick check-in. One tap answers;
 *          the chosen face stays filled. Faces are line drawings, no emoji.
 * @usedBy  widget lab (/wid)
 */
import { useState } from 'react';
import styles from './MoodScale.module.css';

const MOODS = [
  { label: 'Rough', mouth: 'M9 17 Q14 12 19 17' },
  { label: 'Low', mouth: 'M9.5 16.5 Q14 14 18.5 16.5' },
  { label: 'Okay', mouth: 'M9.5 16 L18.5 16' },
  { label: 'Good', mouth: 'M9.5 15.5 Q14 18.5 18.5 15.5' },
  { label: 'Great', mouth: 'M9 15 Q14 21 19 15' },
];

export interface MoodScaleProps {
  title: string;
  onPick: (label: string, index: number) => void;
  /** Just the faces: no card, title only for screen readers (the chat's opening greeting). */
  bare?: boolean;
}

export function MoodScale({ title, onPick, bare }: MoodScaleProps) {
  const [picked, setPicked] = useState<number>();
  return (
    <section className={bare ? styles.bare : styles.root} aria-label={title}>
      {!bare && <p className={styles.title}>{title}</p>}
      <div className={styles.faces} role="radiogroup" aria-label={title}>
        {MOODS.map((m, i) => (
          <button
            key={m.label}
            type="button"
            role="radio"
            aria-checked={picked === i}
            className={styles.face}
            disabled={picked !== undefined && picked !== i}
            onClick={() => { if (picked === undefined) { setPicked(i); onPick(m.label, i); } }}
          >
            <svg viewBox="0 0 28 28" width="40" height="40" aria-hidden>
              <circle cx="14" cy="14" r="12.5" />
              <circle cx="10" cy="11.5" r="1.1" className={styles.eye} />
              <circle cx="18" cy="11.5" r="1.1" className={styles.eye} />
              <path d={m.mouth} />
            </svg>
            <span className={styles.label}>{m.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
