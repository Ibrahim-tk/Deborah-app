/**
 * @pattern Greeting — one direct question ("How are you feeling today?"), no time-of-day line or body
 *          text; a returning user also gets "Continue that conversation".
 *          OPEN: replaces the spec's time-of-day greeting per design direction 2026-10-08.
 * @usedBy  M-2.1 (empty state)
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (States › empty)
 * @xref    web: apps/web/patterns/chat/Greeting — not built
 */
import { DeborahBlob, OptionRow } from '@mobile/ui';
import styles from './Greeting.module.css';

export interface GreetingProps {
  /** Returning user: offers to pick up the last conversation. */
  welcomeBack?: string;
  onContinue?: () => void;
}

export function Greeting({ welcomeBack, onContinue }: GreetingProps) {
  return (
    <div className={styles.root} data-placeholder>
      <DeborahBlob size={72} label="Deborah" />
      <h2 className={styles.line}>How are you feeling today?</h2>
      {welcomeBack && onContinue && (
        <div className={styles.continue}>
          <OptionRow chevron onSelect={onContinue}>Continue that conversation</OptionRow>
        </div>
      )}
    </div>
  );
}
