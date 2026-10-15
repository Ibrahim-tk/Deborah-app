/**
 * @pattern ChatHeader — floating glass controls over the chat: Back (to Home) on the left,
 *          a "new chat" page icon on the right (design direction 2026-10-14: the info button was removed).
 *          No bar background; content scrolls beneath.
 * @usedBy  M-2.1
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (Layout 1) — design direction 2026-10-08
 * @xref    web: apps/web/patterns/chat/ChatHeader — not built
 */
import { GlassButton, ScrollEdge } from '@flow-v1/apps/mobile/ui';
import styles from './ChatHeader.module.css';

export interface ChatHeaderProps {
  onBack: () => void;
  onNewChat: () => void;
  /** Hide the new-chat icon when the chat is already empty. */
  canStartNew: boolean;
  /** Content has scrolled under the bar: show the iOS scroll-edge blur. */
  scrolled?: boolean;
}

export function ChatHeader({
  onBack,
  onNewChat,
  canStartNew,
  scrolled = false,
}: ChatHeaderProps) {
  return (
    <>
      <ScrollEdge active={scrolled} />
      <header className={styles.root}>
        <GlassButton icon="back" aria-label="Back to Home" onClick={onBack} />
        <div className={styles.right}>
          {canStartNew && <GlassButton icon="edit" aria-label="New chat" onClick={onNewChat} />}
        </div>
      </header>
    </>
  );
}
