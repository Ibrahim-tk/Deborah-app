/**
 * @pattern Greeting — time-of-day greeting, or "Welcome back…" with Continue that conversation
 * @usedBy  M-2.1 (empty state)
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (States › empty)
 * @xref    web: apps/web/patterns/chat/Greeting — not built
 */
import { DeborahBlob, OptionRow } from '@mobile/ui';
import styles from './Greeting.module.css';

export interface GreetingProps {
  line: string;
  question: string;
  welcomeBack?: string;
  onContinue?: () => void;
}

export function Greeting({ line, question, welcomeBack, onContinue }: GreetingProps) {
  return (
    <div className={styles.root} data-placeholder>
      <DeborahBlob size={72} label="Deborah" />
      <h2 className={styles.line}>{line}</h2>
      <p className={styles.question}>{welcomeBack ?? question}</p>
      {welcomeBack && onContinue && (
        <div className={styles.continue}>
          <OptionRow chevron onSelect={onContinue}>Continue that conversation</OptionRow>
        </div>
      )}
    </div>
  );
}
