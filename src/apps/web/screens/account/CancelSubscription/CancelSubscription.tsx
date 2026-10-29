/**
 * @screen  M-10.8 · Cancel subscription
 * @flow    F10 Account, privacy & data — replaces the system alert on M-10.3 (designer, 2026-10-29)
 * @states  default · reason picked · confirmed (consent ticked)
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F10-account-privacy.md#m-103--subscription-not-in-wireframes
 * @xref    mobile: M-10.8 (apps/mobile/screens/account/CancelSubscription)
 */
// OPEN: Oct 26 — "Checkout, renewal disclosures and cancellation flow to follow the wording counsel provides
// (California Automatic Renewal Law)." All copy here is placeholder until counsel supplies it.
import { useState } from 'react';
import { findPlan } from '@shared/data';
import { useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import { Button, Checkbox, TextArea } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { useToast } from '@web/hooks/toast.store';
import { useNav } from '@web/navigation';
import styles from './CancelSubscription.module.css';

const REASONS = [
  { id: 'price', label: 'It costs too much' },
  { id: 'usage', label: 'I don’t use it enough' },
  { id: 'answers', label: 'The answers didn’t help me' },
  { id: 'other-app', label: 'I’m using something else' },
  { id: 'other', label: 'Something else' },
];

export default function CancelSubscription() {
  const { pop } = useNav();
  const toast = useToast();
  const plan = findPlan(useAppStore((s) => s.plan));
  const renewsAt = useAppStore((s) => s.renewsAt);
  const [reason, setReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [agreed, setAgreed] = useState(false);
  const endDate = renewsAt ? formatShortDate(renewsAt) : 'the end of this billing period';

  const confirm = () => {
    useAppStore.getState().cancelSubscription();
    toast('Subscription cancelled');
    pop();
  };

  return (
    <DerivedPage title="Cancel subscription" composerPlaceholder="Ask Oracle about your plan…">
      <div className={styles.body} data-xref="M-10.8 · Cancel subscription" data-placeholder>
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

        {/* Small inline checkboxes, no container (single pick: ticking one clears the other). */}
        <div className={styles.reasons} role="group" aria-label="Why are you cancelling? (optional)">
          {REASONS.map((r) => (
            <Checkbox key={r.id} size="sm" checked={reason === r.id} onChange={(on) => setReason(on ? r.id : null)} label={r.label} />
          ))}
        </div>

        <TextArea
          label="Anything we could do better? (optional)"
          className={styles.field}
          minRows={3}
          maxRows={6}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        <Checkbox
          emphasis
          checked={agreed}
          onChange={setAgreed}
          label={`I understand my subscription ends on ${endDate} and won’t renew.`}
        />
      </div>
      <div className={styles.footer}>
        <Button fullWidth variant="destructive" disabled={!agreed} onClick={confirm}>Cancel subscription</Button>
        <Button fullWidth variant="secondary" onClick={pop}>Keep my plan</Button>
      </div>
    </DerivedPage>
  );
}
