/**
 * @nav Sidebar — left drawer that replaces the tab bar (design direction 2026-10-08). Opened from
 * the menu button on every tab root. Holds the profile, new chat, Home, plans/settings, recent
 * chats, the old (i) items and a Genesis Gold feature card. Main destinations live on Home (M-2.0). Text size
 * stays on Account (nav may not import patterns).
 * OPEN: not in the F02/F07/F10 specs or Figma yet — specs still describe a bottom tab bar.
 */
import { useShallow } from 'zustand/react/shallow';
import { findProduct } from '@shared/data';
import { selectHistory, useAppStore } from '@shared/store';
import { AnimatePresence, Avatar, DURATION, EASE_IOS, Icon, MotionDiv, type IconName } from '@mobile/ui';
import { useNavStore } from '../nav.store';
import type { TabId } from '../types';
import styles from './Sidebar.module.css';

const RECENT_LIMIT = 6;

interface Item {
  label: string;
  icon: IconName;
  onSelect: () => void;
  current?: boolean;
}

export function Sidebar() {
  const open = useNavStore((s) => s.sidebarOpen);
  const nav = useNavStore(
    useShallow((s) => ({ activeTab: s.activeTab, setSidebarOpen: s.setSidebarOpen, switchTab: s.switchTab, push: s.push, popToRoot: s.popToRoot, openAsk: s.openAsk, presentSheet: s.presentSheet, presentModal: s.presentModal })),
  );
  const profile = useAppStore((s) => s.profiles.byId[s.activeProfileId]);
  const profileCount = useAppStore((s) => s.profiles.order.length);
  const history = useAppStore(useShallow(selectHistory));

  const close = () => nav.setSidebarOpen(false);
  const run = (fn: () => void) => () => {
    close();
    fn();
  };
  const goTab = (tab: TabId) => {
    if (nav.activeTab !== tab) nav.switchTab(tab);
  };
  const newChat = () => {
    const s = useAppStore.getState();
    s.archiveActive(s.activeProfileId);
    nav.openAsk();
  };
  const openChat = (id: string) => {
    const s = useAppStore.getState();
    s.archiveActive(s.activeProfileId);
    s.setConversation(id, { archived: false });
    s.setActiveConversation(s.activeProfileId, id);
    nav.openAsk();
  };

  // Drawer = conversations first: New conversation, Home, then chat history. Everything else
  // (plans, notifications, privacy, About Deborah, disclaimer) lives in Settings (M-10.1), pinned at the bottom.
  const home: Item = {
    label: 'Home',
    icon: 'deborah',
    onSelect: () => {
      goTab('ask');
      nav.popToRoot();
    },
    current: nav.activeTab === 'ask',
  };
  const settings: Item = {
    label: 'Settings',
    icon: 'settings',
    onSelect: () => {
      goTab('account');
      nav.popToRoot();
    },
    current: nav.activeTab === 'account',
  };
  const gold = findProduct('genesis-gold');

  const row = (it: Item) => (
    <li key={it.label}>
      <button type="button" className={styles.row} aria-current={it.current ? 'page' : undefined} onClick={run(it.onSelect)}>
        <Icon name={it.icon} size={22} />
        <span className={styles.rowLabel}>{it.label}</span>
      </button>
    </li>
  );

  return (
    <AnimatePresence>
        {open && (
          <>
            <MotionDiv key="scrim" className={styles.scrim} onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: DURATION.base }} />
            <MotionDiv
              key="panel"
              className={styles.panel}
              role="dialog"
              aria-label="Menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: DURATION.sheet, ease: EASE_IOS }}
            >
              <div className={styles.top}>
                <button
                  type="button"
                  className={styles.profile}
                  onClick={run(() => nav.presentSheet('M-6.1', undefined, { detent: profileCount > 3 ? 'large' : 'medium' }))}
                  aria-label={`Profile: ${profile?.name || 'You'}. Switch profile`}
                >
                  <Avatar initial={profile?.name || 'You'} size={40} />
                  <span className={styles.profileName}>{profile?.name || 'You'}</span>
                  <Icon name="chevronDown" size={16} />
                </button>
                <button type="button" className={styles.close} onClick={close} aria-label="Close menu">
                  <Icon name="close" size={22} />
                </button>
              </div>

              <div className={styles.scroll}>
                <button type="button" className={styles.newChat} onClick={run(newChat)}>
                  <Icon name="edit" size={20} />
                  New conversation
                </button>

                <ul className={styles.list}>{row(home)}</ul>

                <h2 className={styles.heading}>Recent conversations</h2>
                {history.length === 0 ? (
                  <p className={styles.empty}>Your conversations with Deborah will appear here.</p>
                ) : (
                  <ul className={styles.list}>
                    {history.slice(0, RECENT_LIMIT).map((c) => (
                      <li key={c.id}>
                        <button type="button" className={styles.chat} onClick={run(() => openChat(c.id))}>
                          {c.topic ?? c.summary ?? c.messages.find((m) => m.role === 'user')?.text ?? 'Conversation'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}


                {gold && (
                  <button
                    type="button"
                    className={styles.product}
                    onClick={run(() => nav.presentModal('M-2.7', { productId: gold.id }))}
                    data-placeholder={gold.status === 'placeholder' || undefined}
                  >
                    <img src={gold.image} alt="" className={styles.productImage} />
                    <span className={styles.productName}>{gold.name}</span>
                    <span className={styles.productTagline}>{gold.tagline}</span>
                    <span className={styles.productCta}>
                      Shop Genesis Gold <Icon name="external" size={16} />
                    </span>
                  </button>
                )}
              </div>

              <ul className={`${styles.list} ${styles.bottom}`}>{row(settings)}</ul>
            </MotionDiv>
          </>
        )}
    </AnimatePresence>
  );
}
