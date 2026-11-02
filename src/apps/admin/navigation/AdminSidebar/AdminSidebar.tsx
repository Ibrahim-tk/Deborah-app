/**
 * @nav AdminSidebar — derived from the web Sidebar (brand row, collapsible rail, account at the foot)
 *      on the signature plum ground so the console reads as its own place. Counts are plain text.
 */
import { useAdminStore } from '@shared/admin';
import { Icon, Menu, Tooltip } from '@admin/ui';
import { useAdminNav, useAdminSection } from '../nav.store';
import { SECTIONS } from '../sections';
import styles from './AdminSidebar.module.css';

const LOGO_SRC = '/images/splash/tree-of-life.svg';

export function AdminSidebar() {
  const section = useAdminSection();
  const go = useAdminNav((s) => s.go);
  const collapsed = useAdminNav((s) => s.railCollapsed);
  const setCollapsed = useAdminNav((s) => s.setRailCollapsed);
  const role = useAdminStore((s) => s.role);
  const email = useAdminStore((s) => s.email);
  const openCases = useAdminStore((s) => s.escalations.filter((e) => e.status !== 'resolved').length);
  const pendingSupport = useAdminStore((s) => s.supportRequests.filter((r) => !r.resolved).length);
  const counts: Partial<Record<string, number>> = { escalations: openCases, support: pendingSupport };

  const onMenu = (id: string) => {
    const s = useAdminStore.getState();
    if (id === 'signOut') s.signOut();
    if (id === 'role') s.setRole(role === 'super' ? 'admin' : 'super');
    if (id === 'role' && role === 'super' && SECTIONS.find((x) => x.id === section)?.superOnly) go('dashboard');
  };

  return (
    <aside className={styles.panel} data-collapsed={collapsed || undefined} aria-label="Admin navigation">
      <div className={styles.brandRow}>
        <button
          type="button"
          className={styles.brand}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed(!collapsed)}
        >
          <img src={LOGO_SRC} alt="" className={styles.logo} width={28} height={28} />
          {!collapsed && <span className={styles.brandName}>Oracle Admin</span>}
        </button>
      </div>

      <nav className={styles.links}>
        {SECTIONS.filter((s) => !s.superOnly || role === 'super').map((s) => (
          <Tooltip key={s.id} label={s.label} side="right" disabled={!collapsed}>
          <button
            type="button"
            className={styles.link}
            aria-current={section === s.id ? 'page' : undefined}
            aria-label={collapsed ? s.label : undefined}
            onClick={() => go(s.id)}
          >
            <Icon name={s.icon} size={18} className={styles.icon} />
            {!collapsed && <span className={styles.label}>{s.label}</span>}
            {!collapsed && !!counts[s.id] && <span className={styles.count}>{counts[s.id]}</span>}
          </button>
          </Tooltip>
        ))}
      </nav>

      <div className={styles.foot}>
        <Menu
          side="top"
          align="start"
          onSelect={onMenu}
          items={[
            { id: 'role', label: role === 'super' ? 'Preview as admin' : 'Back to super admin', icon: 'account' },
            { id: 'signOut', label: 'Sign out', icon: 'back' },
          ]}
          trigger={
            <button type="button" className={styles.account} aria-label="Account menu">
              <span className={styles.initial} aria-hidden>{email[0]?.toUpperCase()}</span>
              {!collapsed && (
                <span className={styles.who}>
                  <span className={styles.email} title={email}>{email}</span>
                  <span className={styles.role}>{role === 'super' ? 'Super admin' : 'Admin'}</span>
                </span>
              )}
            </button>
          }
        />
      </div>
    </aside>
  );
}
