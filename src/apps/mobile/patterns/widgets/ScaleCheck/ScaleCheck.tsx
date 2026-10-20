/**
 * @pattern ScaleCheck — "how much", as a bare slider (design direction 2026-10-20): a thick track, a large
 *          thumb and two end labels. No card, no number, no Done. Five stops: the thumb drags freely and
 *          snaps to the nearest stop on release, and that release is the answer (one word, e.g. "Somewhat").
 *          Afterwards it stays where she left it, read-only.
 * @usedBy  widget lab (/wid), M-2.12 scripted flows, design system
 */
import { useState, type CSSProperties, type KeyboardEvent } from 'react';
import styles from './ScaleCheck.module.css';

export interface ScaleCheckProps {
  /** The question, for assistive tech; Deborah's message above already says it. */
  title: string;
  low: string;
  high: string;
  /** Five words, one per stop (default: an intensity scale between `low` and `high`). */
  words?: string[];
  /** Starting stop, 1–5. */
  initial?: number;
  /** `value` is the stop (1–5); `label` is the word she picked. */
  onDone: (value: number, label: string) => void;
}

const STOPS = 5;

export function ScaleCheck({ title, low, high, words: given, initial = 3, onDone }: ScaleCheckProps) {
  const words = given?.length === STOPS ? given : [low, 'A little', 'Somewhat', 'Quite a bit', high];
  const [pos, setPos] = useState(initial - 1);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const stop = Math.round(pos);

  const commit = (at: number) => {
    if (done) return;
    const snapped = Math.min(STOPS - 1, Math.max(0, Math.round(at)));
    setDragging(false);
    setPos(snapped);
    setDone(true);
    onDone(snapped + 1, words[snapped]);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (step) {
      e.preventDefault();
      setPos((p) => Math.min(STOPS - 1, Math.max(0, Math.round(p) + step)));
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      commit(pos);
    }
  };

  return (
    <div className={styles.root} data-done={done || undefined}>
      <div className={styles.track} style={{ '--pos': pos / (STOPS - 1) } as CSSProperties} data-dragging={dragging || undefined}>
        {Array.from({ length: STOPS }, (_, i) => <i key={i} className={styles.tick} style={{ '--at': i / (STOPS - 1) } as CSSProperties} />)}
        <span className={styles.fill} aria-hidden />
        <span className={styles.thumb} aria-hidden />
        <input
          type="range"
          min={0}
          max={STOPS - 1}
          step={0.01}
          value={pos}
          disabled={done}
          aria-label={title}
          aria-valuetext={words[stop]}
          className={styles.range}
          onPointerDown={() => setDragging(true)}
          onChange={(e) => setPos(Number(e.target.value))}
          onPointerUp={(e) => commit(Number(e.currentTarget.value))}
          onKeyDown={onKey}
        />
      </div>
      <div className={styles.ends} aria-hidden>
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}
