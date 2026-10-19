/**
 * @pattern ChatHeader — floating glass controls over the chat: Back (to Home) on the left;
 *          new-chat + active-profile avatar on the right (Ask Dibora per-profile switch).
 *          No bar background; content scrolls beneath.
 * @usedBy  M-2.1
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (Layout 1) — design direction 2026-10-08
 * @xref    web: apps/web/patterns/chat/ChatHeader — not built
 */
import { Avatar, GlassButton, ScrollEdge } from '@mobile/ui';
import styles from './ChatHeader.module.css';

export interface ChatHeaderProps {
  onBack: () => void;
  onNewChat: () => void;
  /** Hide the new-chat icon when the chat is already empty. */
  canStartNew: boolean;
  /** Content has scrolled under the bar: show the iOS scroll-edge blur. */
  scrolled?: boolean;
  /** Active profile avatar → M-6.1 switcher. */
  profile?: { name: string; onPress: () => void };
}

export function ChatHeader({
  onBack,
  onNewChat,
  canStartNew,
  scrolled = false,
  profile,
}: ChatHeaderProps) {
  return (
    <>
      <ScrollEdge active={scrolled} />
      <header className={styles.root}>
        <GlassButton icon="back" aria-label="Back to Home" onClick={onBack} />
        <div className={styles.right}>
          {canStartNew && <GlassButton icon="edit" aria-label="New conversation" onClick={onNewChat} />}
          {profile && (
            <button
              type="button"
              className={styles.avatar}
              onClick={profile.onPress}
              aria-label={`Profile: ${profile.name || 'You'}`}
            >
              <Avatar initial={profile.name || 'You'} size={36} className={styles.avatarGlass} />
            </button>
          )}
        </div>
      </header>
    </>
  );
}
