/**
 * @pattern ConversationHeader — iOS glass menu button (→ Sidebar) on the left, optional centre title,
 *          and on the right the profile avatar. A guest's avatar carries a small dot and opens the
 *          save-your-profile sheet; once there's an account the notifications bell (→ M-10.4) returns
 *          beside it. Profile switching lives in the Sidebar.
 * @usedBy  M-2.0 (title-less)
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (Layout 1) — OPEN: avatar/bell per design
 *          direction 2026-10-12; spec still shows the profile switcher.
 * @xref    web: apps/web/patterns/chat/ConversationHeader — not built
 */
import { Avatar, GlassButton, Header } from '@web/ui';
import styles from './ConversationHeader.module.css';

export interface ConversationHeaderProps {
  /** Opens the drawer. Omit on web when the left rail is always visible. */
  onMenu?: () => void;
  /** Centre title; pass '' for none (Home). */
  title?: string;
  /** No bar background, so a screen backdrop (e.g. Home's Aura) runs under the status bar. */
  transparent?: boolean;
  /** Opens notifications; the bell shows only with an account (`profile.guest` false). */
  onNotifications?: () => void;
  /** Avatar on the right; guests get a dot and a save prompt instead of the bell. */
  profile?: { name: string; guest: boolean; onPress: () => void };
}

export function ConversationHeader({ onMenu, title = 'Ask Deborah', transparent, onNotifications, profile }: ConversationHeaderProps) {
  const bell = onNotifications && !profile?.guest && (
    <GlassButton icon="bell" aria-label="Notifications" onClick={onNotifications} />
  );
  const avatar = profile && (
    <button
      type="button"
      className={styles.avatar}
      onClick={profile.onPress}
      aria-label={profile.guest ? 'Save your profile' : `Profile: ${profile.name || 'You'}`}
    >
      <Avatar initial={profile.name || 'You'} size={36} className={styles.avatarGlass} />
      {profile.guest && <span className={styles.dot} aria-hidden="true" />}
    </button>
  );
  return (
    <Header
      title={title}
      transparent={transparent}
      left={onMenu ? <GlassButton icon="menu" aria-label="Open menu" onClick={onMenu} /> : undefined}
      right={(bell || avatar) && <span className={styles.right}>{bell}{avatar}</span>}
    />
  );
}
