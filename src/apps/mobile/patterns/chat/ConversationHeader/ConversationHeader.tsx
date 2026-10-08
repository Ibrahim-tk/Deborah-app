/**
 * @pattern ConversationHeader — iOS glass menu button (→ Sidebar), "Ask Deborah", and on the right the
 *          active profile's initial + chevron, which opens the profile switcher (M-6.1).
 * @usedBy  M-2.0 (title-less)
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (Layout 1)
 * @xref    web: apps/web/patterns/chat/ConversationHeader — not built
 */
import { Avatar, GlassButton, Header, Icon } from '@mobile/ui';
import styles from './ConversationHeader.module.css';

export interface ConversationHeaderProps {
  onMenu: () => void;
  /** Centre title; pass '' for none (Home). */
  title?: string;
  /** No bar background, so a screen backdrop (e.g. Home's Aura) runs under the status bar. */
  transparent?: boolean;
  /** Active profile; the switcher is hidden when absent. */
  profileName?: string;
  onSwitchProfile?: () => void;
}

export function ConversationHeader({ onMenu, title = 'Ask Deborah', transparent, profileName, onSwitchProfile }: ConversationHeaderProps) {
  return (
    <Header
      title={title}
      transparent={transparent}
      left={<GlassButton icon="menu" aria-label="Open menu" onClick={onMenu} />}
      right={
        profileName &&
        onSwitchProfile && (
          <GlassButton
            className={styles.switcher}
            onClick={onSwitchProfile}
            aria-label={`Talking about ${profileName}. Switch profile`}
            aria-haspopup="dialog"
          >
            <Avatar initial={profileName} size={32} />
            <Icon name="chevronDown" size={16} />
          </GlassButton>
        )
      }
    />
  );
}
