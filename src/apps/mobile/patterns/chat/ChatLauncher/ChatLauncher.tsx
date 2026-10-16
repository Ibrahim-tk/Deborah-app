/**
 * @pattern ChatLauncher — looks like the chat composer but is one button: tapping anywhere opens
 *          the Conversation (M-2.1) with the field focused. Used where chat is offered, not held.
 * @usedBy  M-2.0 (Home hero, with glow)
 * @spec    design direction 2026-10-08 (Home)
 * @xref    web: apps/web/patterns/chat/ChatLauncher — not built
 */
import { EdgeLight, Icon } from '@mobile/ui';
import styles from './ChatLauncher.module.css';

export interface ChatLauncherProps {
  placeholder?: string;
  /** Hero use on Home: a slow travelling light around the rim to draw the eye. */
  glow?: boolean;
  onOpen: () => void;
}

export function ChatLauncher({ placeholder = 'Describe how you’re feeling…', glow, onOpen }: ChatLauncherProps) {
  return (
    <div className={styles.wrap}>
      {/* Glow behind the white launcher — not on the rim. */}
      {glow && <EdgeLight className={styles.edgeLight} />}
      <button type="button" className={glow ? `${styles.root} ${styles.glow}` : styles.root} onClick={onOpen} aria-label="Message Deborah">
        <span className={styles.placeholder}>{placeholder}</span>
        <span className={styles.tools} aria-hidden>
          <span className={styles.tool}>
            <Icon name="plus" size={20} />
          </span>
          <span className={styles.tool}>
            <Icon name="mic" size={20} />
          </span>
          <span className={`${styles.tool} ${styles.send}`}>
            <Icon name="send" size={18} />
          </span>
        </span>
      </button>
    </div>
  );
}
