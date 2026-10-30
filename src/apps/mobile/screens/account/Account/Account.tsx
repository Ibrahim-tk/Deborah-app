/**
 * @screen  M-10.1 · Account
 * @flow    F10 Account, privacy & data
 * @states  subscriber (plan name) · trial (Choose a plan card) · no account (trial copy) · sign-out alert
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-695
 * @spec    docs/ux/F10-account-privacy.md#m-101--account
 * @xref    web: W-10.1 (apps/web/screens/account/Account) — not built
 */
import { Fragment, useState, type ReactNode } from 'react';
import { findPlan } from '@shared/data';
import { selectIsTeenAccount, useAppStore } from '@shared/store';
import { Divider, Header, Icon, ListRow, useAlert, type IconName } from '@mobile/ui';
import { useCollapsingTitle } from '@mobile/hooks/useCollapsingTitle';
import { useNav, useNavStore, useRoute } from '@mobile/navigation';
import { NameSheet } from './parts/NameSheet';
import { EmailSheet } from './parts/EmailSheet';
import styles from './Account.module.css';

const VERSION = '0.1';

interface SettingsRow {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: IconName;
  onPress: () => void;
}

/** Leading mark: icon only, secondary ink — no colored disc. */
function leadIcon(icon: IconName): ReactNode {
  return (
    <span className={styles.lead} aria-hidden>
      <Icon name={icon} size={18} />
    </span>
  );
}

export default function Account() {
  const nav = useNav();
  const alert = useAlert();
  const name = useAppStore((s) => s.userName);
  const email = useAppStore((s) => s.accountEmail);
  const plan = useAppStore((s) => s.plan);
  const trial = plan === 'trial';
  const teen = useAppStore(selectIsTeenAccount);
  const planName = findPlan(plan)?.name;
  const { collapsed, onScroll } = useCollapsingTitle();
  const [sheet, setSheet] = useState<'name' | 'email' | null>(null);
  const [sheetKey, setSheetKey] = useState(0);
  const openSheet = (which: 'name' | 'email') => { setSheetKey((k) => k + 1); setSheet(which); };
  const lastName = useAppStore((s) => s.accountLastName);

  const signOut = async () => {
    const choice = await alert({
      title: 'Sign out?',
      message: 'Your data stays in your account.',
      buttons: [{ label: 'Cancel', style: 'cancel' }, { label: 'Sign out' }],
    });
    if (choice !== 1) return;
    // Prototype: local data is cleared (S01-like) but Welcome keeps the "Sign in" path.
    // Reset in the same tick, before the navigator's onboarding guard can redirect to M-1.1.
    useAppStore.getState().signOut();
    nav.resetTo('preauth', 'M-1.2');
  };



  // Revamp (design direction 2026-10-19): labelled sections, one leading icon per row, values on the right.
  const sections: { title: string; rows: SettingsRow[] }[] = [
    {
      title: 'Account',
      rows: [
        // Account details (design 2026-10-21): edited in sheets, like Phone number.
        { title: 'Name', value: [name, lastName].filter(Boolean).join(' ') || 'Not added', icon: 'account', onPress: () => openSheet('name') },
        { title: 'Email', value: email || 'Not added', icon: 'mail', onPress: () => openSheet('email') },
        { title: 'Change password', icon: 'lock', onPress: () => nav.push('M-10.7') },
        // Teen accounts are part of a parent's Family Plan: no subscription or family management.
        ...(teen ? [] : [
          { title: 'Subscription', value: trial ? 'Free trial' : planName, icon: 'shop', onPress: () => nav.push('M-10.3') } as SettingsRow,
          { title: 'Family profiles', icon: 'family', onPress: () => nav.push('M-6.6') } as SettingsRow,
        ]),
      ],
    },
    {
      title: 'Preferences',
      rows: [
        { title: 'Notifications', icon: 'bell', onPress: () => nav.push('M-10.4') },
        // Text size setting removed (design 2026-10-21); the app always uses the default scale.
      ],
    },
    {
      title: 'Privacy & legal',
      rows: [
        { title: 'Privacy & data', icon: 'lock', onPress: () => nav.push('M-10.2') },
        { title: 'Terms & disclaimer', icon: 'file', onPress: () => nav.open('M-10.5') },
      ],
    },
    {
      title: 'Support',
      rows: [{ title: 'About the Oracle', subtitle: 'Book a consultation', icon: 'info', onPress: () => nav.push('M-7.6') }],
    },
  ];

  const { canGoBack, previousTitle } = useRoute();
  const goHome = useNavStore((s) => s.goHome);
  const initial = (name || 'Y').trim().charAt(0).toUpperCase() || 'Y';

  return (
    <div className={styles.root} data-xref="M-10.1 · Account">
      <Header
        title="Settings"
        large
        collapsed={collapsed}
        onBack={canGoBack ? nav.pop : goHome}
        backLabel={canGoBack ? previousTitle : 'Home'}
      />
      <div className={styles.body} onScroll={onScroll}>

        <div className={styles.profile}>
          <span className={styles.avatar} aria-hidden>{initial}</span>
          <p className={styles.name}>{name || 'You'}</p>
          <p className={styles.meta}>{email || 'Free trial'}</p>
        </div>

        {/* Choose a plan sits under the profile, right above the Account section (design 2026-10-21). */}
        {trial && (
          <button type="button" className={styles.plan} onClick={() => nav.open('M-4.2')}>
            <span className={styles.planMark} aria-hidden>
              <Icon name="shop" size={18} />
            </span>
            <span className={styles.planCopy}>
              <h2 className={styles.planTitle}>Choose a plan</h2>
              <p className={styles.planBody}>Unlimited conversations for you and your family.</p>
            </span>
            <span className={styles.planChevron} aria-hidden>
              <Icon name="chevron" size={18} />
            </span>
          </button>
        )}

        {sections.map((sec) => (
          <section key={sec.title} className={styles.section} aria-labelledby={`settings-${sec.title}`}>
            <h2 id={`settings-${sec.title}`} className={styles.sectionTitle}>{sec.title}</h2>
            <div className={styles.group}>
              {sec.rows.map((r, j) => (
                <Fragment key={r.title}>
                  {j > 0 && <Divider />}
                  <ListRow
                    title={r.title}
                    subtitle={r.subtitle}
                    value={r.value}
                    leading={r.icon ? leadIcon(r.icon) : undefined}
                    onPress={r.onPress}
                    density="compact"
                  />
                </Fragment>
              ))}
            </div>
          </section>
        ))}

        <div className={styles.group}>
          <ListRow title="Sign out" trailing={null} destructive density="compact" onPress={signOut} />
        </div>

        <footer className={styles.footer}>
          <p>Version {VERSION} · Prototype</p>
        </footer>
      </div>
      <NameSheet key={`name-${sheetKey}`} open={sheet === 'name'} onClose={() => setSheet(null)} />
      <EmailSheet key={`email-${sheetKey}`} open={sheet === 'email'} onClose={() => setSheet(null)} />
    </div>
  );
}
