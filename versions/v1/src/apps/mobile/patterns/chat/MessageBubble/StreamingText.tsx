/**
 * Streaming text resolves character by character from a soft blur + fade — the same effect as
 * TextReveal on Welcome (M-1.2). Each newly streamed word staggers its own letters; text already
 * shown never re-animates (stable keys). Plain text once streaming ends.
 */
import type { CSSProperties } from 'react';
import styles from './MessageBubble.module.css';

const STAGGER_MS = 18;

export function StreamingText({ text, streaming }: { text: string; streaming?: boolean }) {
  if (!streaming) return <>{text}</>;
  return (
    <>
      {text.split(/(\s+)/).map((part, i) =>
        /^\s+$/.test(part) ? (
          part
        ) : (
          <span key={i} className={styles.word}>
            {[...part].map((ch, j) => (
              <span key={j} className={styles.char} style={{ '--d': `${j * STAGGER_MS}ms` } as CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
        ),
      )}
    </>
  );
}
