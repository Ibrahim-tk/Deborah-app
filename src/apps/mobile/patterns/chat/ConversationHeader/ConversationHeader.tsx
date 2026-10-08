/**
 * @pattern ConversationHeader — iOS glass menu button (→ Sidebar) on the left, optional centre title,
 *          and a glass notifications bell on the right (→ M-10.4). Profile switching lives in the Sidebar.
 * @usedBy  M-2.0 (title-less)
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (Layout 1) — OPEN: bell replaces the profile
 *          switcher per design direction 2026-10-08; spec still shows the switcher.
 * @xref    web: apps/web/patterns/chat/ConversationHeader — not built
 */
import { GlassButton, Header } from '@mobile/ui';

export interface ConversationHeaderProps {
  onMenu: () => void;
  /** Centre title; pass '' for none (Home). */
  title?: string;
  /** No bar background, so a screen backdrop (e.g. Home's Aura) runs under the status bar. */
  transparent?: boolean;
  /** Opens notifications; the bell is hidden when absent. */
  onNotifications?: () => void;
}

export function ConversationHeader({ onMenu, title = 'Ask Deborah', transparent, onNotifications }: ConversationHeaderProps) {
  return (
    <Header
      title={title}
      transparent={transparent}
      left={<GlassButton icon="menu" aria-label="Open menu" onClick={onMenu} />}
      right={onNotifications && <GlassButton icon="bell" aria-label="Notifications" onClick={onNotifications} />}
    />
  );
}
