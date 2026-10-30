/**
 * @screen  M-10.8 · Cancel subscription
 * @flow    F10 Account, privacy & data — replaces the system alert on M-10.3 (designer, 2026-10-29)
 * @states  default · confirm sheet
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F10-account-privacy.md#m-103--subscription-not-in-wireframes
 * @xref    web: W-10.8 — not built
 */
// OPEN: Oct 26 — "Checkout, renewal disclosures and cancellation flow to follow the wording counsel provides
// (California Automatic Renewal Law)." All copy here is placeholder until counsel supplies it.
import { useState } from 'react';
import { findPlan } from '@shared/data';
import { useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import { BottomSheet, Button, Header } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useRoute } from '@mobile/navigation';
import styles from './CancelSubscription.module.css';

export default function CancelSubscription() {
  const { pop } = useNav();
  const { previousTitle } = useRoute();
  const toast = useToast();
  const plan = findPlan(useAppStore((s) => s.plan));
  const renewsAt = useAppStore((s) => s.renewsAt);
  // Confirm in a sheet ("Are you sure?"), no feedback form (designer, 2026-10-29).
  const [confirming, setConfirming] = useState(false);
  const endDate = renewsAt ? formatShortDate(renewsAt) : 'the end of this billing period';

  const confirm = () => {
    setConfirming(false);
    useAppStore.getState().cancelSubscription();
    toast('Subscription cancelled');
    pop();
  };

  return (
    <div className={styles.root} data-xref="M-10.8 · Cancel subscription">
      <Header title="Cancel subscription" onBack={pop} backLabel={previousTitle} />
      <div className={styles.body} data-placeholder>
        <section className={styles.section}>
          <h2 className={styles.title}>Before you go</h2>
          <p className={styles.text}>
            Your {plan?.name ?? ''} plan stays active until {endDate}. After that you won’t be charged again, and you’ll lose:
          </p>
          <ul className={styles.list}>
            <li>Your Wellness Plan and check-ins</li>
            <li>Provider-ready notes and PDF downloads</li>
            <li>Family profiles</li>
          </ul>
          <p className={styles.text}>Your conversations and health profile stay in your account.</p>
        </section>
      </div>
      <div className={styles.footer}>
        <Button fullWidth variant="destructive" onClick={() => setConfirming(true)}>Cancel subscription</Button>
        <Button fullWidth variant="secondary" onClick={pop}>Keep my plan</Button>
      </div>
      <BottomSheet
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Cancel your subscription?"
        footer={
          <>
            <Button fullWidth variant="destructive" onClick={confirm}>Yes, cancel subscription</Button>
            <Button fullWidth variant="ghost" onClick={() => setConfirming(false)}>Keep my plan</Button>
          </>
        }
      >
        <p className={styles.text}>Your plan stays active until {endDate} and won’t renew. You can choose a plan again any time.</p>
      </BottomSheet>
    </div>
  );
}
