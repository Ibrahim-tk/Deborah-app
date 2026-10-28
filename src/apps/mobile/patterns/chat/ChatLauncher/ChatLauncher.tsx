/**
 * @pattern ChatLauncher — renders the real Composer (pixel-identical) under a transparent button:
 *          tapping anywhere opens the Conversation (M-2.1) with the field focused.
 * @usedBy  M-2.0 (Home hero)
 * @spec    design direction 2026-10-08 (Home) · 2026-10-21: exact copy of the Composer
 * @xref    web: apps/web/patterns/chat/ChatLauncher — not built
 */
import { Composer } from '../Composer';
import styles from './ChatLauncher.module.css';

export interface ChatLauncherProps {
  placeholder?: string;
  /** Kept for callers; the Composer's own EdgeLight glow is always on. */
  glow?: boolean;
  onOpen: () => void;
}

const noop = () => {};

export function ChatLauncher({ placeholder = 'Describe how you’re feeling…', onOpen }: ChatLauncherProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.composer} aria-hidden {...{ inert: "" }}>
        <Composer
          value=""
          onChange={noop}
          onSend={noop}
          onStop={noop}
          onFocusChange={noop}
          generating={false}
          placeholder={placeholder}
          voiceSample=""
        />
      </div>
      <button type="button" className={styles.hit} onClick={onOpen} aria-label="Message the Oracle" />
    </div>
  );
}
