/**
 * @pattern ChatLauncher — looks like the chat composer but is one button: tapping anywhere opens
 *          the Conversation (M-2.1) with the field focused. Used where chat is offered, not held.
 * @usedBy  M-2.0 (Home hero, with glow)
 * @spec    design direction 2026-10-08 (Home)
 * @xref    web: apps/web/patterns/chat/ChatLauncher — not built
 */
import { Icon } from '@mobile/ui';
import styles from './ChatLauncher.module.css';

export interface ChatLauncherProps {
  placeholder?: string;
  /** Hero use on Home: a slow travelling light around the rim to draw the eye. */
  glow?: boolean;
  onOpen: () => void;
}

export function ChatLauncher({ placeholder = 'Describe how you’re feeling…', glow, onOpen }: ChatLauncherProps) {
  const button = (
    <button type="button" className={glow ? `${styles.root} ${styles.glow}` : styles.root} onClick={onOpen} aria-label="Message Deborah">
      <span className={styles.placeholder}>{placeholder}</span>
      <span className={styles.tools} aria-hidden>
        <Icon name="plus" size={20} />
        <Icon name="mic" size={20} />
        <span className={styles.send}>
          <Icon name="send" size={18} />
        </span>
      </span>
    </button>
  );
  if (!glow) return button;
  // The ambient glow lives on its own layer behind the button, so it never tints the field.
  return (
    <div className={styles.wrap}>
      <span className={styles.halo} aria-hidden />
      {button}
    </div>
  );
}
