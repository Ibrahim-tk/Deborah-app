/**
 * @nav Sidebar (web) — persistent left rail (L-shell). Same destinations/story as mobile drawer;
 * always visible on main. Ask / My Health / Account map to mobile tabs.
 */
import { useShallow } from 'zustand/react/shallow';
import { findProduct } from '@shared/data';
import { selectHistory, useAppStore } from '@shared/store';
import { ProductCard } from '@web/patterns/commerce';
import { Avatar, Icon, type IconName } from '@web/ui';
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
  const nav = useNavStore(
    useShallow((s) => ({
      activeTab: s.activeTab,
      switchTab: s.switchTab,
      push: s.push,
      popToRoot: s.popToRoot,
      openAsk: s.openAsk,
      presentSheet: s.presentSheet,
      presentModal: s.presentModal,
      goHome: s.goHome,
    })),
  );
  const profile = useAppStore((s) => s.profiles.byId[s.activeProfileId]);
  const profileCount = useAppStore((s) => s.profiles.order.length);
  const history = useAppStore(useShallow(selectHistory));
  const guest = useAppStore((s) => !s.accountId);

  const goTab = (tab: TabId) => {
    if (nav.activeTab !== tab) nav.switchTab(tab);
    else nav.popToRoot();
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

  const tabs: Item[] = [
    {
      label: 'Ask Deborah',
      icon: 'chat',
      onSelect: () => {
        goTab('ask');
        nav.goHome();
      },
      current: nav.activeTab === 'ask',
    },
    {
      label: 'My Health',
      icon: 'health',
      onSelect: () => goTab('health'),
      current: nav.activeTab === 'health',
    },
    {
      label: 'Account',
      icon: 'account',
      onSelect: () => goTab('account'),
      current: nav.activeTab === 'account',
    },
  ];

  const settings: Item = {
    label: 'Settings',
    icon: 'settings',
    onSelect: () => {
      goTab('account');
      nav.popToRoot();
    },
    current: nav.activeTab === 'account',
  };

  const signIn: Item = {
    label: 'Sign in',
    icon: 'account',
    onSelect: () => nav.presentSheet('M-4.3', { mode: 'signin', sheet: true }),
  };

  const gold = findProduct('genesis-gold');

  const row = (it: Item) => (
    <li key={it.label}>
      <button type="button" className={styles.row} aria-current={it.current ? 'page' : undefined} onClick={it.onSelect}>
        <Icon name={it.icon} size={22} />
        <span className={styles.rowLabel}>{it.label}</span>
      </button>
    </li>
  );

  return (
    <aside className={styles.panel} aria-label="Main navigation">
      <div className={styles.top}>
        <button
          type="button"
          className={styles.profile}
          onClick={() => nav.presentSheet('M-6.1', undefined, { detent: profileCount > 3 ? 'large' : 'medium' })}
          aria-label={`Profile: ${profile?.name || 'You'}. Switch profile`}
        >
          <Avatar initial={profile?.name || 'You'} size={40} />
          <span className={styles.profileName}>{profile?.name || 'You'}</span>
          <Icon name="chevronDown" size={16} />
        </button>
      </div>

      <nav className={styles.tabs} aria-label="Primary">
        <ul className={styles.list}>{tabs.map(row)}</ul>
      </nav>

      <div className={styles.scroll}>
        <button type="button" className={styles.newChat} onClick={newChat}>
          <Icon name="edit" size={20} />
          New conversation
        </button>

        <h2 className={styles.heading}>Recent conversations</h2>
        {history.length === 0 ? (
          <p className={styles.empty}>Your conversations with Deborah will appear here.</p>
        ) : (
          <ul className={styles.list}>
            {history.slice(0, RECENT_LIMIT).map((c) => (
              <li key={c.id}>
                <button type="button" className={styles.chat} onClick={() => openChat(c.id)}>
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
              onShop={() => nav.presentModal('M-2.7', { productId: gold.id })}
            />
          </div>
        )}
        <ul className={styles.list}>
          {row(settings)}
          {guest && row(signIn)}
        </ul>
      </div>
    </aside>
  );
}
