/**
 * @nav Sidebar — left drawer that replaces the tab bar (design direction 2026-10-08). Opened from
 * the menu button on every tab root. Holds the profile, new chat, recent chats, the chat ProductCard
 * (Genesis Gold) pinned above Settings, and Settings at the bottom. Main destinations live on Home (M-2.0).
 * Text size stays on Account.
 * OPEN: not in the F02/F07/F10 specs or Figma yet — specs still describe a bottom tab bar.
 */
import { nowFrom } from '@shared/utils';
import { isMinor } from '@shared/engine';
import { useShallow } from 'zustand/react/shallow';
import { findProduct } from '@shared/data';
import { selectHistory, selectIsTeenAccount, useAppStore, selectActiveProfile } from '@shared/store';
import { UpgradeCard, ProductCard } from '@mobile/patterns/commerce';
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
  const trial = useAppStore((s) => s.plan === 'trial');
  // Teen accounts: no products and nothing to buy (F06 teen invite).
  const teen = useAppStore(selectIsTeenAccount);
  const nav = useNavStore(
    useShallow((s) => ({ activeTab: s.activeTab, setSidebarOpen: s.setSidebarOpen, switchTab: s.switchTab, push: s.push, popToRoot: s.popToRoot, openAsk: s.openAsk, presentSheet: s.presentSheet, presentModal: s.presentModal })),
  );
  const profile = useAppStore((s) => s.profiles.byId[s.activeProfileId]);
  const profileCount = useAppStore((s) => s.profiles.order.length);
  const history = useAppStore(useShallow(selectHistory));
  const guest = useAppStore((s) => !s.accountId);

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

  // Drawer = conversations first: New conversation, then chat history. Shop ProductCard + Settings
  // sit in the pinned footer. Everything else (plans, notifications, privacy, About Deborah,
  // disclaimer) lives in Settings (M-10.1).
  const settings: Item = {
    label: 'Settings',
    icon: 'settings',
    onSelect: () => {
      goTab('account');
      nav.popToRoot();
    },
    current: nav.activeTab === 'account',
  };
  // Guests can sign in from the bottom of the menu too (design direction 2026-10-12).
  const signIn: Item = {
    label: 'Sign in',
    icon: 'account',
    onSelect: () => nav.presentSheet('M-4.3', { mode: 'signin', sheet: true }),
  };
  const minor = useAppStore((s) => { const p = selectActiveProfile(s); return p ? isMinor(p, nowFrom(s)) : false; });
  // No product card for minors, or while on the free trial (designer, 2026-10-29: the upgrade card shows instead).
  const gold = minor || trial || teen ? undefined : findProduct('genesis-gold');

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

                <h2 className={styles.heading}>Recent conversations</h2>
                {history.length === 0 ? (
                  <p className={styles.empty}>Your conversations with the Oracle will appear here.</p>
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
              </div>

              <div className={styles.bottom}>
                {gold && (
                  <div className={styles.shop}>
                    <ProductCard
                      product={gold}
                      productRef={{
                        productId: gold.id,
                        why: gold.tagline,
                        frame90: '',
                      }}
                      onShop={run(() => nav.presentModal('M-2.7', { productId: gold.id }))}
                    />
                  </div>
                )}
                {/* Free trial: a small Choose a plan card above Settings (designer, 2026-10-29, same as web). */}
                {trial && <UpgradeCard onPress={run(() => nav.presentModal('M-4.2'))} />}
                <ul className={styles.list}>{row(settings)}{guest && row(signIn)}</ul>
              </div>
            </MotionDiv>
          </>
        )}
    </AnimatePresence>
  );
}
