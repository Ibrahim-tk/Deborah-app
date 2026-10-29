/**
 * @screen  M-4.2 · Choose your plan
 * @flow    F04 Free limit, plans & account
 * @states  trial (Continue — price) · subscriber (Current plan, Switch plan) · preselected (from M-6.3)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353
 * @spec    docs/ux/F04-plans-account.md#m-42--choose-your-plan
 * @xref    web: W-4.2 (apps/web/screens/plans/ChoosePlan) — not built
 *
 * Web: a full-window page over the app (no sidebar). Choose → confirm & subscribe → "You're all set",
 * all on this page; "Continue to dashboard" returns Home. Guests still go through account creation (M-4.3).
 */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { findPlan, planList } from '@shared/data';
import { useAppStore } from '@shared/store';
import type { Billing } from '@shared/types/domain';
import { Button, Icon, OVERLAY_HOST_ID, Spinner } from '@web/ui';
import { simMs } from '@web/hooks/simTiming';
import { PlanCard, planPrice } from '@web/patterns/commerce';
import { useToast } from '@web/hooks/toast.store';
import { useNav, useNavStore, useScreenParams } from '@web/navigation';
import styles from './ChoosePlan.module.css';

type PaidPlan = (typeof planList)[number]['id'];

// Oct 27: only Individual and Family plans (no Premium, no teen plan).
const ref = planList.find((p) => p.recommended) ?? planList[0];

type Phase = 'choose' | 'confirm' | 'processing' | 'done';

export default function ChoosePlan() {
  // returnTo: set by M-6.3 so M-4.5 leads back into M-6.2; forwarded through M-4.3 / M-4.4.
  const { preselect, returnTo } = useScreenParams<{ preselect: PaidPlan; returnTo: string }>();
  const { push, pop, popToRoot, switchTab, open } = useNav();
  // Paint the full-window page only while this route is on top (screens under a push stay mounted).
  const onTop = useNavStore((st) => st.layers.length === 0 && st.tabs[st.activeTab].at(-1)?.id === 'M-4.2');
  const [phase, setPhase] = useState<Phase>('choose');
  const toast = useToast();
  const currentPlan = useAppStore((s) => s.plan);
  const currentBilling = useAppStore((s) => s.billing);
  const hasAccount = useAppStore((s) => Boolean(s.accountId));
  const email = useAppStore((s) => s.accountEmail);
  const subscriber = currentPlan !== 'trial';

  // One plan is always selected: entry context, else the subscriber's plan, else recommended.
  const [selected, setSelected] = useState<PaidPlan>(preselect ?? (subscriber ? (currentPlan as PaidPlan) : ref.id));
  const [billing, setBilling] = useState<Billing>('monthly');
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
    if (hasAccount) setPhase('confirm');
    else push('M-4.3', { mode: 'create', ...params });
  };

  // Simulated store payment (no SDK): processing → purchase → confirmation on this page.
  useEffect(() => {
    if (phase !== 'processing') return;
    const id = window.setTimeout(() => {
      useAppStore.getState().purchase(selected, billing);
      setPhase('done');
    }, simMs(1200));
    return () => window.clearTimeout(id);
  }, [phase, selected, billing]);

  const toDashboard = () => {
    // A message held by the free-limit gate is still sent (F04 M-4.1 behaviour).
    useAppStore.getState().releaseHeld();
    switchTab('ask');
    popToRoot();
  };

  const amount = billing === 'annual' ? plan.annual : plan.monthly;
  const period = billing === 'annual' ? 'year' : 'month';

  const page = (
    <div className={styles.page} data-xref="M-4.2 · Choose plan">
      <header className={styles.top}>
        {phase !== 'done' && (
          <Button variant="ghost" size="sm" leadingIcon="back" onClick={() => (phase === 'confirm' ? setPhase('choose') : pop())} disabled={phase === 'processing'}>
            Back
          </Button>
        )}
      </header>

      <main className={styles.main}>
        {phase === 'choose' && (
          <div className={styles.body}>
            <div className={styles.intro}>
              <h1 className={styles.title}>Choose your plan</h1>
              <p className={styles.subtitle}>Renews monthly. Cancel anytime online.</p>
            </div>
          {/* Monthly only (Oracle Change Requests, Oct 26): no annual toggle. */}
            {preselect === 'family' && <p className={styles.context}>Family lets everyone keep their own private history.</p>}
            <div className={styles.cards} role="radiogroup" aria-label="Plans">
              {planList.map((p) => (
                <PlanCard key={p.id} plan={p} billing={billing} selected={p.id === selected} current={subscriber && p.id === currentPlan} onSelect={() => choose({ plan: p.id })} />
              ))}
            </div>
            {note && <p className={styles.note} role="status">{note}</p>}
            <Button fullWidth onClick={onContinue}>
              {subscriber ? 'Switch plan' : 'Continue'} — {price}
            </Button>
            <div className={styles.links}>
              <Button variant="link" size="sm" onClick={() => toast('No purchases to restore (demo)')}>Restore purchase</Button>
              <Button variant="link" size="sm" onClick={() => open('M-10.5', { section: 'terms' })}>Terms</Button>
              <Button variant="link" size="sm" onClick={() => open('M-10.5', { section: 'privacy' })}>Privacy</Button>
            </div>
          </div>
        )}

        {(phase === 'confirm' || phase === 'processing') && (
          <div className={styles.body}>
            <div className={styles.intro}>
              <h1 className={styles.title}>Confirm your plan</h1>
              <p className={styles.subtitle}>{plan.name} · {billing === 'annual' ? 'Annual' : 'Monthly'}</p>
            </div>
            <dl className={styles.summary}>
              <div><dt>Price</dt><dd>${amount.toFixed(2)} per {period}</dd></div>
              <div><dt>Account</dt><dd>{email ?? 'maria@icloud.com'}</dd></div>
            </dl>
            <p className={styles.note}>Renews automatically until cancelled. Cancel anytime in Settings at least a day before each renewal.</p>
            <Button fullWidth onClick={() => setPhase('processing')} disabled={phase === 'processing'} aria-live="polite">
              {phase === 'processing' ? <><Spinner size={18} label="Processing" /> Processing</> : `Subscribe — ${price}`}
            </Button>
          </div>
        )}

        {phase === 'done' && (
          <div className={styles.done} role="status">
            <span className={styles.check}><Icon name="check" size={32} /></span>
            <h1 className={styles.title}>You’re all set.</h1>
            <p className={styles.subtitle}>Your {plan.name} plan is active.</p>
            <Button onClick={toDashboard}>Continue to dashboard</Button>
          </div>
        )}
      </main>

      <footer className={styles.footer}>© {new Date().getFullYear()} Your Oracle. All rights reserved.</footer>
    </div>
  );

  const host = typeof document !== 'undefined' ? document.getElementById(OVERLAY_HOST_ID) : null;
  return onTop && host ? createPortal(page, host) : null;
}
