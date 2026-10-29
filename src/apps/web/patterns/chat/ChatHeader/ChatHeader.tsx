/**
 * @pattern ChatHeader — flat desktop controls over the chat (no iOS glass).
 *          Left: optional Back to Home. Right: Sign in / Sign up when guest; new-chat once the thread has messages.
 * @usedBy  M-2.1
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (Layout 1)
 * @xref    web: apps/web/patterns/chat/ChatHeader
 */
import { Button, ScrollEdge } from '@web/ui';
import styles from './ChatHeader.module.css';

// Oct 27: AI disclosure on every chat screen once the conversation begins (not on intake).
export const AI_DISCLOSURE = 'You’re chatting with Oracle, an AI system.';

export interface ChatHeaderProps {
  /** Conversation has begun: show the AI disclosure line. */
  disclosure?: boolean;
  onNewChat?: () => void;
  /** Show new-chat only once the thread has messages. */
  canStartNew?: boolean;
  /** Content has scrolled under the bar: show the edge fade. */
  scrolled?: boolean;
  /** No account yet — show Sign in / Sign up on the right. */
  guest?: boolean;
  onSignIn?: () => void;
  onSignUp?: () => void;
  /** Back to Home dashboard (M-2.0). */
  onBack?: () => void;
}

export function ChatHeader({
  disclosure = false,
  onNewChat,
  canStartNew = false,
  scrolled = false,
  guest = false,
  onSignIn,
  onSignUp,
  onBack,
}: ChatHeaderProps) {
  return (
    <>
      <ScrollEdge active={scrolled} />
      <header className={styles.root}>
        {onBack ? (
          <Button variant="ghost" size="sm" className={styles.action} leadingIcon="back" onClick={onBack} aria-label="Back to Home">
            Back
          </Button>
        ) : (
          <div className={styles.spacer} aria-hidden="true" />
        )}
        {disclosure && <p className={styles.disclosure}>{AI_DISCLOSURE}</p>}
        <div className={styles.right}>
          {guest ? (
            <>
              {onSignIn && (
                <Button variant="ghost" size="sm" className={styles.action} onClick={onSignIn}>
                  Sign in
                </Button>
              )}
              {onSignUp && (
                <Button variant="secondary" size="sm" className={styles.action} onClick={onSignUp}>
                  Sign up
                </Button>
              )}
            </>
          ) : (
            canStartNew &&
            onNewChat && (
              <Button variant="ghost" size="sm" className={styles.action} leadingIcon="newChat" onClick={onNewChat}>
                New chat
              </Button>
            )
          )}
        </div>
      </header>
    </>
  );
}
