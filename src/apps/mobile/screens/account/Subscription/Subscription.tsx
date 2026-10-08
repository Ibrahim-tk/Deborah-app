/**
 * @screen  M-10.3 · Subscription
 * @flow    F10 Account, privacy & data
 * @states  active ("Renews on {date}") · cancelled ("Ends {date}") · trial ("Free trial · {n} consultations left") · cancel alert
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F10-account-privacy.md#m-103--subscription-not-in-wireframes
 * @xref    web: W-10.3 (apps/web/screens/account/Subscription) — not built
 */
import { findPlan } from '@shared/data';
import { selectFreeLeft, useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import { Button, Card, Divider, Header, ListRow, useAlert } from '@mobile/ui';
import { planPrice } from '@mobile/patterns/commerce';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useRoute } from '@mobile/navigation';
import styles from './Subscription.module.css';

export default function Subscription() {
  const nav = useNav();
  const { previousTitle } = useRoute();
  const alert = useAlert();
  const toast = useToast();
  const planId = useAppStore((s) => s.plan);
  const billing = useAppStore((s) => s.billing);
  const renewsAt = useAppStore((s) => s.renewsAt);
  const cancelled = useAppStore((s) => Boolean(s.cancelled));
  const freeLeft = useAppStore(selectFreeLeft);
  const plan = findPlan(planId);
  const trial = planId === 'trial' || !plan;

  const cancel = async () => {
    const choice = await alert({
      title: 'Cancel subscription?',
      message: renewsAt ? `Your plan stays active until ${formatShortDate(renewsAt)}.` : 'Your plan stays active until the end of this period.',
      buttons: [{ label: 'Keep plan', style: 'cancel' }, { label: 'Cancel subscription', style: 'destructive' }],
    });
    if (choice !== 1) return;
    useAppStore.getState().cancelSubscription();
    toast('Subscription cancelled');
  };

  return (
    <div className={styles.root} data-xref="M-10.3 · Subscription">
      <Header title="Subscription" onBack={nav.pop} backLabel={previousTitle} />
      <div className={styles.body}>
        <Card>
          {trial ? (
            <>
              <h2 className={styles.title}>Free trial</h2>
              <p className={styles.meta}>
                Free trial · {freeLeft ?? 0} {freeLeft === 1 ? 'consultation' : 'consultations'} left
              </p>
              <Button fullWidth onClick={() => nav.open('M-4.2')}>Choose a plan</Button>
            </>
          ) : (
            <>
              <h2 className={styles.title}>{plan.name} plan</h2>
              <p className={styles.price}>{planPrice(plan, billing)}</p>
              {renewsAt && <p className={styles.meta}>{cancelled ? `Ends ${formatShortDate(renewsAt)}` : `Renews on ${formatShortDate(renewsAt)}`}</p>}
            </>
          )}
        </Card>

        {!trial && (
          <div className={styles.group}>
            <ListRow title="Change plan" onPress={() => nav.open('M-4.2')} />
            <Divider />
            <ListRow title="Manage in App Store" trailing={null} onPress={() => toast('Opens App Store subscriptions (demo)')} />
            {!cancelled && (
              <>
                <Divider />
                <ListRow title="Cancel subscription" destructive trailing={null} onPress={cancel} />
              </>
            )}
          </div>
        )}
        {cancelled && !trial && <p className={styles.note}>You can keep using every feature until your plan ends.</p>}
      </div>
    </div>
  );
}
