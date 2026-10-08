/**
 * @screen  M-4.4 · Store payment (simulated)
 * @flow    F04 Free limit, plans & account
 * @states  confirm · processing (1.2 s) · done
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353
 * @spec    docs/ux/F04-plans-account.md#m-44--store-payment-simulated
 * @xref    web: W-4.4 (apps/web/screens/plans/StorePayment) — not built
 *
 * Styled like the iOS App Store subscription sheet (system UI), so it uses the system font and
 * greys instead of product tokens. No payment SDK: success only writes the store.
 * OPEN: "brief says Stripe, but in-app digital subscriptions on iOS/Android must use IAP."
 */
import { useEffect, useState } from 'react';
import { findPlan, persona } from '@shared/data';
import { useAppStore } from '@shared/store';
import type { Billing, PlanTier } from '@shared/types/domain';
import { Icon, Spinner } from '@mobile/ui';
import { simMs } from '@mobile/hooks/simTiming';
import { useNav, useScreenParams } from '@mobile/navigation';
import styles from './StorePayment.module.css';

type Phase = 'confirm' | 'processing' | 'done';

export default function StorePayment() {
  const { plan: planId, billing = 'monthly', returnTo } = useScreenParams<{ plan: Exclude<PlanTier, 'trial'>; billing: Billing; returnTo: string }>();
  const { dismissSheet, popToRoot, push } = useNav();
  const email = useAppStore((s) => s.accountEmail);
  const [phase, setPhase] = useState<Phase>('confirm');
  const plan = findPlan(planId);

  useEffect(() => {
    if (phase === 'confirm' || !plan) return;
    const id = window.setTimeout(
      () => {
        if (phase === 'processing') return setPhase('done');
        useAppStore.getState().purchase(plan.id, billing);
        dismissSheet();
        push('M-4.5', { returnTo });
      },
      simMs(phase === 'processing' ? 1200 : 700),
    );
    return () => window.clearTimeout(id);
  }, [phase, plan, billing, returnTo, dismissSheet, push]);

  if (!plan) return null;
  const amount = billing === 'annual' ? plan.annual : plan.monthly;
  const period = billing === 'annual' ? 'year' : 'month';

  // Cancel returns to the plan list (and leaves the account that was just created).
  const cancel = () => {
    dismissSheet();
    popToRoot();
  };

  return (
    <div className={styles.root} data-xref="M-4.4 · Store payment">
      <div className={styles.head}>
        <span className={styles.store}>App Store</span>
        <button type="button" className={styles.cancel} onClick={cancel} disabled={phase !== 'confirm'}>Cancel</button>
      </div>

      <div className={styles.app}>
        <img src="/favicon.svg" alt="" className={styles.icon} />
        <div>
          <p className={styles.appName}>{persona.brand.appName}</p>
          <p className={styles.meta}>{plan.name} plan · {billing === 'annual' ? 'Annual' : 'Monthly'}</p>
        </div>
      </div>

      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt>Price</dt>
          <dd>${amount.toFixed(2)} per {period}</dd>
        </div>
        <div className={styles.row}>
          <dt>Account</dt>
          <dd>{email ?? 'maria@icloud.com'}</dd>
        </div>
      </dl>
      <p className={styles.fine}>Renews automatically until cancelled. Cancel anytime in Settings at least a day before each renewal.</p>

      <button type="button" className={styles.pay} onClick={() => setPhase('processing')} disabled={phase !== 'confirm'} aria-live="polite">
        {phase === 'confirm' && 'Subscribe'}
        {phase === 'processing' && (
          <>
            <Spinner size={18} label="Processing" /> Processing
          </>
        )}
        {phase === 'done' && (
          <>
            <Icon name="success" size={22} /> Done
          </>
        )}
      </button>
    </div>
  );
}
