/**
 * @pattern ChatHeader — floating glass controls over the chat: Back (to Home) on the left,
 *          "New chat" capsule and info on the right. No bar background; content scrolls beneath.
 * @usedBy  M-2.1
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (Layout 1) — design direction 2026-10-08
 * @xref    web: apps/web/patterns/chat/ChatHeader — not built
 */
import { GlassButton, ScrollEdge } from '@mobile/ui';
import styles from './ChatHeader.module.css';

export interface ChatHeaderProps {
  onBack: () => void;
  onNewChat: () => void;
  onInfo: () => void;
  /** Hide "New chat" when the chat is already empty. */
  canStartNew: boolean;
  /** Content has scrolled under the bar: show the iOS scroll-edge blur. */
  scrolled?: boolean;
}

export function ChatHeader({
  onBack,
  onNewChat,
  onInfo,
  canStartNew,
  scrolled = false,
}: ChatHeaderProps) {
  return (
    <>
      <ScrollEdge active={scrolled} />
      <header className={styles.root}>
        <GlassButton icon="back" aria-label="Back to Home" onClick={onBack} />
        <div className={styles.right}>
          {canStartNew && <GlassButton icon="edit" label="New chat" onClick={onNewChat} />}
          <GlassButton icon="info" aria-label="About this chat" onClick={onInfo} />
        </div>
      </header>
    </>
  );
}
