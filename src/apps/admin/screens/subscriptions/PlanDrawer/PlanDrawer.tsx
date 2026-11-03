/**
 * @screen  A-7.3 · Plan editor (side drawer)
 * @flow    A7 Subscription & billing management (super admin only)
 * @states  new · editing · invalid · saving · read only (admin role)
 * @spec    docs/admin/README.md#a-73-plan-editor
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { useAdminStore, type Plan } from '@shared/admin';
import { Button, Drawer, Input, KeyValueList, Segmented, StatusText, TextArea, Toggle } from '@admin/ui';
import { CopyText } from '@admin/screens/common/CopyEmail';
import { Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import { NumberField } from './parts/NumberField';
import styles from './PlanDrawer.module.css';

// Mirrors what the app offers per plan (shared/data/commerce/plans.json and the free-limit gate in engine/counting.ts).
const FEATURES = [
  'Unlimited conversations',
  'Your Wellness Plan',
  'Provider-ready notes',
  'Lab and document review',
  'Family profiles (up to 3 dependents)',
  'Advocate for each member',
  'Invite teens to their own account',
];
const blank = (): Plan => ({
  id: `plan-${Date.now().toString(36)}`, name: '', kind: 'individual', monthly: 0, freeQuestions: 3,
  maxProfiles: 1, features: Object.fromEntries(FEATURES.map((f) => [f, false])), rules: '', active: false,
});

export default function PlanDrawer({ id: planId }: { id: string | null }) {
  const existing = useAdminStore((s) => s.plans.find((p) => p.id === planId));
  const canEdit = useAdminStore((s) => s.role === 'super');
  const stripeOn = useAdminStore((s) => s.stripe.status === 'connected');
  const close = useAdminNav((s) => s.closeDrawer);
  const [plan, setPlan] = useState<Plan>(() => existing ?? blank());
  const [touched, setTouched] = useState(false);
  const { busy, run } = useSim();
  const set = <K extends keyof Plan>(k: K, v: Plan[K]) => setPlan((p) => ({ ...p, [k]: v }));

  const save = () => {
    setTouched(true);
    if (!plan.name.trim()) return;
    run(() => {
      useAdminStore.getState().savePlan({ ...plan, name: plan.name.trim(), maxProfiles: plan.kind === 'individual' ? 1 : plan.maxProfiles });
      close();
    }, existing ? 'Plan saved' : 'Plan created');
  };

  return (
    <Drawer
      title={existing ? existing.name : 'New plan'}
      subtitle={canEdit ? undefined : 'Only super admins can change plans.'}
      onClose={close}
      actions={
        canEdit && (
          <>
            <Button size="sm" loading={busy} onClick={save}>{existing ? 'Save plan' : 'Create plan'}</Button>
            <Button size="sm" variant="secondary" onClick={close}>Cancel</Button>
          </>
        )
      }
    >
      <fieldset className={styles.form} disabled={!canEdit}>
        <Section title="Plan">
          <div className={styles.fields}>
            <Input label="Name" value={plan.name} error={touched && !plan.name.trim() ? 'Give the plan a name.' : undefined} onChange={(e) => set('name', e.target.value)} />
            <Segmented<Plan['kind']>
              label="Who it covers"
              value={plan.kind}
              onChange={(v) => set('kind', v)}
              options={[{ value: 'individual', label: 'Individual' }, { value: 'family', label: 'Family' }]}
            />
            {plan.kind === 'family' && <NumberField label="Profiles included" value={plan.maxProfiles} min={2} onChange={(v) => set('maxProfiles', v)} />}
          </div>
        </Section>
        <Section title="Pricing">
          <div className={styles.row}>
            <NumberField label="Monthly price (USD)" decimals value={plan.monthly} hint="0 makes this a free plan" onChange={(v) => set('monthly', v)} />
          </div>
        </Section>
        <Section title="Free use">
          <div className={styles.row}>
            <NumberField label="Free questions" value={plan.freeQuestions} hint="Before asking to subscribe" onChange={(v) => set('freeQuestions', v)} />
          </div>
        </Section>
        <Section title="Features">
          <div className={styles.toggles}>
            {FEATURES.map((f) => (
              <Toggle key={f} label={f} checked={!!plan.features[f]} onChange={(v) => set('features', { ...plan.features, [f]: v })} />
            ))}
          </div>
        </Section>
        <Section title="Rules">
          <TextArea label="Plan rules" value={plan.rules} minRows={3} onChange={(e) => set('rules', e.target.value)} />
        </Section>
        <Section title="Stripe">
          {stripeOn && plan.stripePriceId ? (
            <KeyValueList
              items={[
                { label: 'Price ID', value: <CopyText value={plan.stripePriceId} label="price ID" /> },
                { label: 'Sync', value: <StatusText tone="success">Synced</StatusText> },
              ]}
            />
          ) : (
            <p className={styles.muted}>{stripeOn ? 'This plan syncs to Stripe when you save it.' : 'Connect Stripe on the Subscriptions page to sync this plan\'s price.'}</p>
          )}
        </Section>
        <Section title="Availability">
          <Toggle
            label="Plan is active"
            description="Inactive plans are hidden from the app. Current subscribers keep them."
            checked={plan.active}
            onChange={(v) => set('active', v)}
          />
        </Section>
      </fieldset>
    </Drawer>
  );
}
