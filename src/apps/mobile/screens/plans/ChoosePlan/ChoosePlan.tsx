/**
 * @screen  M-4.2 · Choose your plan
 * @flow    F04 Free limit, plans & account
 * @states  trial (Continue — price) · subscriber (Current plan, Switch plan) · preselected (from M-6.3)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353
 * @spec    docs/ux/F04-plans-account.md#m-42--choose-your-plan
 * @xref    web: W-4.2 (apps/web/screens/plans/ChoosePlan) — not built
 */
import { useState } from 'react';
import { findPlan, planList } from '@shared/data';
import { useAppStore } from '@shared/store';
import type { Billing } from '@shared/types/domain';
import { Button, Modal, Segmented } from '@mobile/ui';
import { PlanCard, planPrice } from '@mobile/patterns/commerce';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useScreenParams } from '@mobile/navigation';
import styles from './ChoosePlan.module.css';

type PaidPlan = (typeof planList)[number]['id'];

const BILLING: { value: Billing; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

// Savings come from plans.json (recommended plan's monthly × 12 vs annual).
// OPEN: "recommended plan; prices/annual pricing; Premium + family" (F04 M-4.2).
const ref = planList.find((p) => p.recommended) ?? planList[0];
const SAVE_PCT = Math.round((1 - ref.annual / (ref.monthly * 12)) * 100);

export default function ChoosePlan() {
  // returnTo: set by M-6.3 so M-4.5 leads back into M-6.2; forwarded through M-4.3 / M-4.4.
  const { preselect, returnTo } = useScreenParams<{ preselect: PaidPlan; returnTo: string }>();
  const { dismissModal, push, presentSheet, open } = useNav();
  const toast = useToast();
  const currentPlan = useAppStore((s) => s.plan);
  const currentBilling = useAppStore((s) => s.billing);
  const hasAccount = useAppStore((s) => Boolean(s.accountId));
  const subscriber = currentPlan !== 'trial';

  // One plan is always selected: entry context, else the subscriber's plan, else recommended.
  const [selected, setSelected] = useState<PaidPlan>(preselect ?? (subscriber ? (currentPlan as PaidPlan) : ref.id));
  const [billing, setBilling] = useState<Billing>(subscriber ? currentBilling : 'monthly');
  const [note, setNote] = useState<string | null>(null);

  const plan = findPlan(selected) ?? ref;
  const price = planPrice(plan, billing);
  const isCurrent = subscriber && selected === currentPlan && billing === currentBilling;

  const choose = (next: { plan?: PaidPlan; billing?: Billing }) => {
    if (next.plan) setSelected(next.plan);
    if (next.billing) setBilling(next.billing);
    setNote(null);
  };

  const onContinue = () => {
    if (isCurrent) return setNote('You’re already on this plan.');
    const params = { plan: selected, billing, returnTo };
    if (hasAccount) presentSheet('M-4.4', params);
    else push('M-4.3', { mode: 'create', ...params });
  };

  return (
    <div className={styles.root} data-xref="M-4.2 · Choose plan">
      <Modal
        onClose={dismissModal}
        footer={
          <>
            {note && <p className={styles.note} role="status">{note}</p>}
            <Button fullWidth onClick={onContinue}>
              {subscriber ? 'Switch plan' : 'Continue'} — {price}
            </Button>
            <div className={styles.links}>
              <Button variant="link" size="sm" onClick={() => toast('No purchases to restore (demo)')}>Restore purchase</Button>
              <Button variant="link" size="sm" onClick={() => open('M-10.5', { section: 'terms' })}>Terms</Button>
              <Button variant="link" size="sm" onClick={() => open('M-10.5', { section: 'privacy' })}>Privacy</Button>
            </div>
          </>
        }
      >
        <div className={styles.body}>
          <div className={styles.intro}>
            <h1 className={styles.title}>Choose your plan</h1>
            <p className={styles.subtitle}>Cancel anytime.</p>
          </div>
          <div className={styles.billing}>
            <Segmented label="Billing" options={BILLING} value={billing} onChange={(b) => choose({ billing: b })} />
            <p className={styles.save}>Save about {SAVE_PCT}% with annual billing</p>
          </div>
          {preselect === 'family' && <p className={styles.context}>Family lets everyone keep their own private history.</p>}
          <div className={styles.cards} role="radiogroup" aria-label="Plans">
            {planList.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                billing={billing}
                selected={p.id === selected}
                current={subscriber && p.id === currentPlan}
                onSelect={() => choose({ plan: p.id })}
              />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
