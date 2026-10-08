/**
 * @pattern ChatLauncher — looks like the chat composer but is one button: tapping anywhere opens
 *          the Conversation (M-2.1) with the field focused. Used where chat is offered, not held.
 * @usedBy  M-2.0 (docked bar + greeting sheet)
 * @spec    design direction 2026-10-08 (Home)
 * @xref    web: apps/web/patterns/chat/ChatLauncher — not built
 */
import { Icon } from '@mobile/ui';
import styles from './ChatLauncher.module.css';

export interface ChatLauncherProps {
  placeholder?: string;
  onOpen: () => void;
}

export function ChatLauncher({ placeholder = 'Describe how you’re feeling…', onOpen }: ChatLauncherProps) {
  return (
    <button type="button" className={styles.root} onClick={onOpen} aria-label="Message Deborah">
      <span className={styles.placeholder}>{placeholder}</span>
      <span className={styles.tools} aria-hidden>
        <Icon name="plus" size={22} />
        <Icon name="mic" size={22} />
        <span className={styles.send}>
          <Icon name="send" size={20} />
        </span>
      </span>
    </button>
  );
}
