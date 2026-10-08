/**
 * @pattern MessageBubble — user: Lilac Mist bubble, right-aligned. Deborah: unboxed full-width
 *          text, avatar + "Deborah" at the start of each turn only. Long-press opens actions.
 * @usedBy  M-2.1, M-9.2
 * @spec    DESIGN.md › Messages · docs/ux/F02-consultation.md#m-21-conversation
 * @xref    web: apps/web/patterns/chat/MessageBubble — not built
 */
import { useRef, type MouseEvent, type ReactNode } from 'react';
import { DeborahBlob } from '@mobile/ui';
import { StreamingText } from './StreamingText';
import styles from './MessageBubble.module.css';

export interface MessageBubbleProps {
  role: 'user' | 'deborah';
  text?: string;
  streaming?: boolean;
  /** First Deborah message of a turn shows her avatar and name. */
  turnStart?: boolean;
  placeholder?: boolean;
  onLongPress?: () => void;
  children?: ReactNode;
}

const LONG_PRESS_MS = 500;

export function MessageBubble({ role, text, streaming, turnStart, placeholder, onLongPress, children }: MessageBubbleProps) {
  const timer = useRef<number>();
  const press = onLongPress
    ? {
        onPointerDown: () => (timer.current = window.setTimeout(onLongPress, LONG_PRESS_MS)),
        onPointerUp: () => window.clearTimeout(timer.current),
        onPointerLeave: () => window.clearTimeout(timer.current),
        onContextMenu: (e: MouseEvent) => {
          e.preventDefault();
          onLongPress();
        },
      }
    : {};

  if (role === 'user') {
    return (
      <div className={styles.userRow}>
        <p className={styles.user}>{text}</p>
      </div>
    );
  }
  return (
    <div className={styles.deborah}>
      {turnStart && (
        <div className={styles.speaker}>
          {/* The orb alone identifies Deborah; the name stays for screen readers. */}
          <DeborahBlob size={32} label="Deborah" />
        </div>
      )}
      {text !== undefined && (
        <p className={styles.text} aria-live={streaming ? 'polite' : undefined} data-placeholder={placeholder || undefined} {...press}>
          <StreamingText text={text} streaming={streaming} />
        </p>
      )}
      {children}
    </div>
  );
}
