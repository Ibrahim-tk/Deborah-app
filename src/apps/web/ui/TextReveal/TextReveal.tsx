/**
 * @ui TextReveal — text resolves character by character from a soft blur + fade. CSS-only (staggered
 * animation delays); words never break mid-reveal. Full text is in the accessibility tree; reduced
 * motion shows it at once.
 */
import type { CSSProperties } from 'react';
import styles from './TextReveal.module.css';

export interface TextRevealProps {
  text: string;
  /** Milliseconds between characters. */
  stagger?: number;
  /** Delay before the first character. */
  delay?: number;
  className?: string;
  /** Element to render (default p). */
  as?: 'p' | 'h1' | 'h2' | 'span';
}

export function TextReveal({ text, stagger = 18, delay = 300, className, as: Tag = 'p' }: TextRevealProps) {
  let i = 0;
  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden>
        {text.split(/(\s+)/).map((word, w) =>
          /^\s+$/.test(word) ? (
            word
          ) : (
            <span key={w} className={styles.word}>
              {[...word].map((ch) => (
                <span key={i} className={styles.char} style={{ '--d': `${delay + i++ * stagger}ms` } as CSSProperties}>
                  {ch}
                </span>
              ))}
            </span>
          ),
        )}
      </span>
    </Tag>
  );
}
