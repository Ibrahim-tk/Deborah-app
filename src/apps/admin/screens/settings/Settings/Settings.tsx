/**
 * @screen  A-11.1 · Settings
 * @flow    A11 Account settings (admin and super admin)
 * @states  tabs: profile · security (password, sessions) · notifications · compliance
 * @spec    docs/admin/README.md#a-111-settings
 * @xref    web: none (admin only)
 */
import { Tabs } from '@admin/ui';
import { AdminPage } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { ProfileSection } from './parts/ProfileSection';
import { PasswordSection } from './parts/PasswordSection';
import { SecuritySection } from './parts/SecuritySection';
import { NotificationsSection } from './parts/NotificationsSection';
import { ComplianceSection } from './parts/ComplianceSection';
import styles from './Settings.module.css';

type Tab = 'profile' | 'security' | 'notifications' | 'compliance';

export default function Settings() {
  const tab = useAdminNav((s) => s.settingsTab);
  const setTab = (t: Tab) => useAdminNav.setState({ settingsTab: t });

  return (
    <AdminPage title="Settings" subtitle="Your profile, sign-in security and how you're notified.">
      <Tabs<Tab>
        label="Settings"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'profile', label: 'Profile', content: <div className={styles.column}><ProfileSection /></div> },
          { value: 'security', label: 'Password and security', content: <div className={styles.column}><PasswordSection /><SecuritySection /></div> },
          { value: 'notifications', label: 'Notifications', content: <div className={styles.column}><NotificationsSection /></div> },
          { value: 'compliance', label: 'Compliance', content: <div className={styles.column}><ComplianceSection /></div> },
        ]}
      />
    </AdminPage>
  );
}
