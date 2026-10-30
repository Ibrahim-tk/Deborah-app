/**
 * @nav Sidebar (web) — persistent left rail (L-shell): logo, collapsible, primary destinations,
 * new conversation, recent chats, then profile menu at the foot.
 */
import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { persona } from '@shared/data';
import { selectHistory, useAppStore } from '@shared/store';
import { relationshipLabel } from '@web/patterns/profile';
import { Avatar, Button, Icon } from '@web/ui';
import { useToast } from '@web/hooks/toast.store';
import { maxProfilesFor, useAddMember } from '@web/screens/profiles/useAddMember';
import { useNavStore } from '../nav.store';
import { UpgradeCard } from '@web/patterns/commerce';
import type { TabId } from '../types';
import styles from './Sidebar.module.css';

const RECENT_LIMIT = 8;
const LOGO_SRC = '/images/splash/tree-of-life.svg';

export function Sidebar() {
  const nav = useNavStore(
    useShallow((s) => ({
      activeTab: s.activeTab,
      routeId: s.tabs[s.activeTab].at(-1)?.id,
      switchTab: s.switchTab,
      push: s.push,
      popToRoot: s.popToRoot,
      replace: s.replace,
      openAsk: s.openAsk,
      presentModal: s.presentModal,
      presentSheet: s.presentSheet,
      switchProfile: s.switchProfile,
      railCollapsed: s.railCollapsed,
      setRailCollapsed: s.setRailCollapsed,
      resetTo: s.resetTo,
    })),
  );
  const toast = useToast();
  const { addState, add } = useAddMember();
  const guest = useAppStore((s) => !s.accountId);
  const profile = useAppStore((s) => s.profiles.byId[s.activeProfileId]);
  const activeId = useAppStore((s) => s.activeProfileId);
  const plan = useAppStore((s) => s.plan);
  // Teen accounts (F06 teen invite): nothing to buy and no family management.
  const teen = useAppStore((s) => s.accountKind === 'teen');
  const profiles = useAppStore(useShallow((s) => s.profiles.order.map((id) => s.profiles.byId[id]).filter(Boolean)));
  const history = useAppStore(useShallow(selectHistory));

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

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


  const selectProfile = (id: string) => {
    setMenuOpen(false);
    if (id === activeId) return;
    nav.switchProfile(id);
    toast(`Now asking for ${useAppStore.getState().profiles.byId[id]?.name ?? ''}`);
  };

  const signOut = () => {
    setMenuOpen(false);
    // Same as Settings › Sign out: clear local data, back to Welcome (sign-in path kept).
    useAppStore.getState().signOut();
    nav.resetTo('preauth', 'M-1.2');
  };

  const openSettings = () => {
    setMenuOpen(false);
    goTab('account');
  };


  const collapsed = nav.railCollapsed;
  const newCurrent = nav.activeTab === 'ask' && nav.routeId === 'M-2.1';

  return (
    <aside
      className={styles.panel}
      data-collapsed={collapsed || undefined}
      aria-label="Main navigation"
    >
      <div className={styles.brandRow}>
        <button
          type="button"
          className={styles.brand}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-pressed={collapsed}
          onClick={() => nav.setRailCollapsed(!collapsed)}
        >
          <img src={LOGO_SRC} alt="" className={styles.logo} width={36} height={36} />
          {!collapsed && <span className={styles.brandName}>{persona.brand.appName}</span>}
        </button>
        {!collapsed && (
          <button type="button" className={styles.collapse} aria-label="Collapse sidebar" onClick={() => nav.setRailCollapsed(true)}>
            <Icon name="sidebar" size={20} />
          </button>
        )}
      </div>

      <>
          <div className={styles.links}>
            <button
              type="button"
              className={styles.newChat}
              aria-current={newCurrent ? 'page' : undefined}
              aria-label="New conversation"
              title={collapsed ? 'New conversation' : undefined}
              onClick={newChat}
            >
              <Icon name="newChat" size={18} />
              {!collapsed && <span className={styles.rowLabel}>New conversation</span>}
            </button>
            <div className={styles.divider} role="separator" />
          </div>

          {!guest && (
            <div className={styles.scroll}>
              {!collapsed && <h2 className={styles.heading}>Recent conversations</h2>}
              {history.length === 0 ? (
                !collapsed && <p className={styles.empty}>Your conversations with the Oracle will appear here.</p>
              ) : (
                <ul className={`${styles.list} ${styles.recent}`}>
                  {history.slice(0, RECENT_LIMIT).map((c) => {
                    const label = c.topic ?? c.summary ?? c.messages.find((m) => m.role === 'user')?.text ?? 'Conversation';
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          className={styles.chat}
                          title={collapsed ? label : undefined}
                          aria-label={label}
                          onClick={() => openChat(c.id)}
                        >
                          {collapsed ? <Icon name="chat" size={18} /> : label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

      </>

      {/* Free trial: a small Choose a plan card above the profile button (designer, 2026-10-29). */}
      {plan === 'trial' && !teen && (
        <div className={styles.upgrade}>
          <UpgradeCard onPress={() => nav.push('M-4.2')} />
        </div>
      )}
      <div className={styles.menuAnchor} ref={menuRef}>
        <button
          type="button"
          className={styles.profile}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label={guest ? 'Account' : `Profile: ${profile?.name || 'You'}`}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className={styles.guestAvatar} aria-hidden>
            <Icon name="account" size={collapsed ? 18 : 20} />
          </span>
          {!collapsed && !guest && (
            <>
              <span className={styles.profileName}>{profile?.name || 'You'}</span>
              <Icon name="chevronDown" size={16} />
            </>
          )}
          {!collapsed && guest && <Icon name="chevronDown" size={16} />}
        </button>
        {menuOpen && (
          <div className={styles.menu} role="menu">
            {guest ? (
              <Button
                variant="ghost"
                size="md"
                fullWidth
                leadingIcon="account"
                className={styles.menuItem}
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  nav.presentSheet('M-4.0', { mode: 'signin' });
                }}
              >
                Sign in
              </Button>
            ) : (
              <>
                <ul className={styles.menuList}>
                  {profiles.map((p) => {
                    const active = p.id === activeId;
                    return (
                      <li key={p.id}>
                        <Button
                          variant="ghost"
                          size="md"
                          fullWidth
                          className={styles.menuItem}
                          role="menuitem"
                          aria-current={active || undefined}
                          onClick={() => selectProfile(p.id)}
                        >
                          <span className={styles.menuProfile}>
                            <Avatar initial={p.name} size={24} />
                            <span className={styles.menuName}>{p.name}</span>
                            <span className={styles.menuRelation}>
                              {relationshipLabel(p.relationship, p.intake?.relationshipOther)}
                            </span>
                            {active && <Icon name="check" size={16} className={styles.menuCheck} />}
                          </span>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
                {!teen && <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  leadingIcon={addState === 'locked' ? 'lock' : 'plus'}
                  className={styles.menuItem}
                  role="menuitem"
                  disabled={addState === 'full'}
                  onClick={() => {
                    setMenuOpen(false);
                    add(false);
                  }}
                >
                  <span className={styles.menuAdd}>
                    <span className={styles.menuAddLabel}>Add a family member</span>
                    {addState === 'locked' && <span className={styles.menuMeta} aria-label="Family plan"><Icon name="lock" size={16} /></span>}
                    {addState === 'full' && (
                      <span className={styles.menuMeta}>
                        {profiles.length} of {maxProfilesFor(plan)}
                      </span>
                    )}
                  </span>
                </Button>}
                {plan === 'family' && !teen && (
                  <Button
                    variant="ghost"
                    size="md"
                    fullWidth
                    leadingIcon="mail"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      nav.presentSheet('M-6.7');
                    }}
                  >
                    Invite your teen
                  </Button>
                )}
                <div className={styles.menuDivider} role="separator" />
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  leadingIcon="settings"
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={openSettings}
                >
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  leadingIcon="back"
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={signOut}
                >
                  Log out
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
