/**
 * @pattern ErrorBubble — Deborah-voice error with Retry; also the "Stopped · Continue" line
 * @usedBy  M-2.1
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (States › error, stopped)
 * @xref    web: apps/web/patterns/chat/ErrorBubble — not built
 */
import { Button, Icon } from '@mobile/ui';
import styles from './ErrorBubble.module.css';

export interface ErrorBubbleProps {
  kind: 'error' | 'stopped';
  text?: string;
  onRetry: () => void;
  disabled?: boolean;
}

export function ErrorBubble({ kind, text, onRetry, disabled }: ErrorBubbleProps) {
  if (kind === 'stopped') {
    return (
      <p className={styles.stopped}>
        Stopped ·{' '}
        <Button variant="link" size="sm" onClick={onRetry} disabled={disabled}>
          Continue
        </Button>
      </p>
    );
  }
  return (
    <button type="button" className={styles.error} onClick={onRetry} disabled={disabled}>
      <Icon name="refresh" size={22} />
      <span>{text}</span>
    </button>
  );
}
