/**
 * One numbered section as a tonal card (same family as Home): serif numeral, headline title and a
 * round chevron; opening reveals the body under a hairline. §7 is the signature midnight card.
 */
import { useId, type ReactNode } from 'react';
import type { AnswerSection } from '@shared/types/domain';
import { Icon, IconButton } from '@mobile/ui';
import { StreamingText } from '../MessageBubble';
import styles from './AnswerSections.module.css';

export interface SectionProps {
  number: number;
  section: AnswerSection;
  open: boolean;
  /** Not reached yet by the stream: shown dimmed and not toggleable. */
  pending: boolean;
  streaming: boolean;
  onToggle: () => void;
  onAddQuestion?: (q: string) => void;
  extra?: ReactNode;
}

/** §5: emphasise the test name before " — " (italic, never weight). */
function TestBullet({ text, streaming }: { text: string; streaming: boolean }) {
  const [name, ...why] = text.split(' — ');
  if (why.length === 0) return <StreamingText text={text} streaming={streaming} />;
  return (
    <>
      <em>{name}</em> — <StreamingText text={why.join(' — ')} streaming={streaming} />
    </>
  );
}

const TONES = ['lilac', 'linen', 'rose'] as const;

export function Section({ number, section, open, pending, streaming, onToggle, onAddQuestion, extra }: SectionProps) {
  const id = useId();
  const isWord = section.key === 'word';
  const body = (
    <>
      {section.body && (
        <p className={isWord ? styles.wordBody : styles.body}>
          <StreamingText text={section.body} streaming={streaming} />
        </p>
      )}
      {section.bullets && section.bullets.length > 0 && (
        <ul className={styles.bullets}>
          {section.bullets.map((b, i) => (
            <li key={i} className={styles.bullet}>
              <span className={styles.bulletText}>
                {section.key === 'tests' ? <TestBullet text={b} streaming={streaming} /> : <StreamingText text={b} streaming={streaming} />}
              </span>
              {onAddQuestion && !streaming && <IconButton icon="plus" label="Add to visit questions" onClick={() => onAddQuestion(b)} />}
            </li>
          ))}
        </ul>
      )}
      {isWord && section.body && !streaming && <p className={styles.signoff}>— Deborah</p>}
      {extra}
    </>
  );

  return (
    <section
      className={`${styles.section} ${styles[isWord ? 'signature' : TONES[(number - 1) % TONES.length]]}`}
      data-open={open || undefined}
      data-pending={pending || undefined}
    >
      <button type="button" className={styles.header} aria-expanded={open} aria-controls={id} onClick={onToggle} disabled={pending}>
        <span className={styles.number}>{number}</span>
        <span className={styles.title}>{section.title}</span>
        <span className={styles.toggle} aria-hidden>
          <Icon name="chevronDown" size={20} className={styles.chevron} />
        </span>
      </button>
      {open && !pending && (
        <div id={id} className={styles.content} aria-live={streaming ? 'polite' : undefined}>
          {body}
        </div>
      )}
    </section>
  );
}
