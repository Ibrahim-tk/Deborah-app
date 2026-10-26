/**
 * Streaming text resolves character by character from a soft blur + fade — the same effect as
 * TextReveal on Welcome (M-1.2). Each newly streamed word staggers its own letters; text already
 * shown never re-animates (stable keys). Plain text once streaming ends.
 * `**phrase**` marks emphasis (weight medium, never bold — DESIGN.md caps weight at 500); an unclosed
 * marker mid-stream is treated as emphasis so no stray asterisks flash.
 */
import type { CSSProperties } from 'react';
import styles from './MessageBubble.module.css';

const STAGGER_MS = 18;

/** Splits `**…**` runs out of the text; a trailing unclosed `**…` counts as emphasis while streaming. */
function segments(text: string) {
  return text
    .split(/(\*\*[^*]*(?:\*\*|$))/)
    .filter(Boolean)
    .map((part) => (part.startsWith('**') ? { em: true, text: part.replace(/\*\*/g, '') } : { em: false, text: part }));
}

export function StreamingText({ text, streaming }: { text: string; streaming?: boolean }) {
  const parts = segments(text);
  if (!streaming) return <>{parts.map((p, i) => (p.em ? <strong key={i} className={styles.emph}>{p.text}</strong> : p.text))}</>;
  let w = 0; // running word index keeps keys stable across segments
  return (
    <>
      {parts.map((p, pi) => {
        const words = p.text.split(/(\s+)/).map((part) =>
          /^\s+$/.test(part) || !part ? (
            part
          ) : (
            <span key={w++} className={styles.word}>
              {[...part].map((ch, j) => (
                <span key={j} className={styles.char} style={{ '--d': `${j * STAGGER_MS}ms` } as CSSProperties}>
                  {ch}
                </span>
              ))}
            </span>
          ),
        );
        return p.em ? <strong key={`e${pi}`} className={styles.emph}>{words}</strong> : <span key={`t${pi}`}>{words}</span>;
      })}
    </>
  );
}
