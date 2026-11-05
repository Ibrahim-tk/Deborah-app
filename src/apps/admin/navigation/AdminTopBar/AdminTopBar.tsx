/** @nav AdminTopBar — phone only: menu button, current section, and the account initial (opens My profile). */
import { useAdminStore } from '@shared/admin';
import { IconButton } from '@admin/ui';
import { NotificationBell } from '@admin/patterns';
import { useAdminNav, useAdminSection } from '../nav.store';
import { SECTIONS } from '../sections';
import styles from './AdminTopBar.module.css';

export function AdminTopBar() {
  const section = useAdminSection();
  const setNavOpen = useAdminNav((s) => s.setNavOpen);
  const email = useAdminStore((s) => s.email);
  const title = section === 'notifications' ? 'Notifications' : SECTIONS.find((s) => s.id === section)?.label ?? 'Oracle Admin';

  return (
    <header className={styles.bar}>
      <IconButton icon="menu" label="Open navigation" onClick={() => setNavOpen(true)} />
      <span className={styles.title}>{title}</span>
      <NotificationBell />
      <button type="button" className={styles.initial} aria-label="My profile" onClick={() => useAdminNav.getState().openSettings('profile')}>
        <span className={styles.dot}>{email[0]?.toUpperCase()}</span>
      </button>
    </header>
  );
}
