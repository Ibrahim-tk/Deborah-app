/**
 * @screen  M-10.1 · Account
 * @flow    F10 Account, privacy & data
 * @states  subscriber (plan name) · trial (Choose a plan card) · no account (trial copy) · sign-out alert
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-695
 * @spec    docs/ux/F10-account-privacy.md#m-101--account
 * @xref    web: W-10.1 (apps/web/screens/account/Account) — not built
 */
import { Fragment, useState } from 'react';
import { findPlan } from '@shared/data';
import { useAppStore } from '@shared/store';
import { Card, Divider, Header, ListRow, useAlert } from '@mobile/ui';
import { useCollapsingTitle } from '@mobile/hooks/useCollapsingTitle';
import { TextSizeSheet, textSizeLabel } from '@mobile/patterns/settings';
import { useNav, useNavStore, useRoute } from '@mobile/navigation';
import styles from './Account.module.css';

const VERSION = '0.1';

export default function Account() {
  const nav = useNav();
  const alert = useAlert();
  const name = useAppStore((s) => s.userName);
  const email = useAppStore((s) => s.accountEmail);
  const plan = useAppStore((s) => s.plan);
  const trial = plan === 'trial';
  const planName = findPlan(plan)?.name;
  const { collapsed, onScroll } = useCollapsingTitle();

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

  const textSize = useAppStore((s) => s.settings.textSize);
  const [textSizeOpen, setTextSizeOpen] = useState(false);

  const groups: { title: string; subtitle?: string; value?: string; onPress: () => void }[][] = [
    [
      { title: 'Subscription & billing', onPress: () => nav.push('M-10.3') },
      { title: 'Family profiles', onPress: () => nav.push('M-6.6') },
      { title: 'Notifications', onPress: () => nav.push('M-10.4') },
      // DESIGN.md › Text size control: Account › Text size.
      { title: 'Text size', value: textSizeLabel(textSize), onPress: () => setTextSizeOpen(true) },
    ],
    [
      { title: 'Privacy & data', onPress: () => nav.push('M-10.2') },
      { title: 'Terms & disclaimer', onPress: () => nav.open('M-10.5') },
    ],
    [{ title: 'About Deborah', subtitle: 'Book a consultation', onPress: () => nav.push('M-7.6') }],
  ];

  const { canGoBack, previousTitle } = useRoute();
  const goHome = useNavStore((s) => s.goHome);
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
        {trial && (
          <Card tone="emphasis" onPress={() => nav.open('M-4.2')}>
            <h2 className={styles.cardTitle}>Choose a plan</h2>
            <p className={styles.text}>Unlimited consultations, for you or your family.</p>
          </Card>
        )}

        <Card>
          <p className={styles.name}>{name || 'You'}</p>
          <p className={styles.meta}>{email ?? 'No account yet — trial'}</p>
          {!trial && planName && <p className={styles.meta}>{planName} plan</p>}
        </Card>

        {groups.map((g, i) => (
          <div key={i} className={styles.group}>
            {g.map((r, j) => (
              <Fragment key={r.title}>
                {j > 0 && <Divider />}
                <ListRow title={r.title} subtitle={r.subtitle} value={r.value} onPress={r.onPress} />
              </Fragment>
            ))}
          </div>
        ))}

        <div className={styles.group}>
          <ListRow title="Sign out" trailing={null} onPress={signOut} />
        </div>

        <footer className={styles.footer}>
          <p>Version {VERSION} (prototype)</p>
          <p>Prototype — no real data</p>
        </footer>
      </div>
      <TextSizeSheet open={textSizeOpen} onClose={() => setTextSizeOpen(false)} />
    </div>
  );
}
