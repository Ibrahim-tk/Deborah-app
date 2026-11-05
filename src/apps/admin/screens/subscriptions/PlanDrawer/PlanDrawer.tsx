/**
 * @screen  A-7.3 · Plan editor (side drawer)
 * @flow    A7 Subscription & billing management (super admin only; stories 8.1 and 8.2)
 * @states  new (draft / publish) · editing · price change confirm · inactive · invalid · read only (admin role)
 * @spec    docs/admin/stories.md#81---view--edit-subscription-plans
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { formatDate, money, useAdminStore, type Plan } from '@shared/admin';
import { Button, Drawer, Input, KeyValueList, Segmented, StatusText, TextArea } from '@admin/ui';
import { CopyText } from '@admin/screens/common/CopyEmail';
import { ConfirmDialog, Section, UnsavedChangesDialog } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import { NumberField } from './parts/NumberField';
import styles from './PlanDrawer.module.css';

const blank = (): Plan => ({
  id: `plan-${Date.now().toString(36)}`, name: '', kind: 'individual', monthly: 0, familyIncluded: 3, addOnPrice: 0,
  features: [], status: 'draft', priceHistory: [],
});

type Confirm = null | 'price' | 'publish' | 'inactive';

export default function PlanDrawer({ id: planId }: { id: string | null }) {
  const existing = useAdminStore((s) => s.plans.find((p) => p.id === planId));
  const plans = useAdminStore((s) => s.plans);
  const canEdit = useAdminStore((s) => s.role === 'super');
  const stripeOn = useAdminStore((s) => s.stripe.status === 'connected');
  const close = useAdminNav((s) => s.closeDrawer);
  const [plan, setPlan] = useState<Plan>(() => existing ?? blank());
  const [featuresText, setFeaturesText] = useState(plan.features.join('\n'));
  const [touched, setTouched] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const { busy, run } = useSim();
  const [start] = useState(() => JSON.stringify({ plan, featuresText }));
  const dirty = canEdit && JSON.stringify({ plan, featuresText }) !== start;
  const [leaving, setLeaving] = useState(false);
  const tryClose = () => (dirty ? setLeaving(true) : close());
  const set = <K extends keyof Plan>(k: K, v: Plan[K]) => setPlan((p) => ({ ...p, [k]: v }));

  const trial = plan.kind === 'trial';
  const features = featuresText.split('\n').map((f) => f.trim()).filter(Boolean);
  const errors = {
    name: !plan.name.trim() ? 'Please enter a plan name.' : plans.some((p) => p.id !== plan.id && p.name.trim().toLowerCase() === plan.name.trim().toLowerCase()) ? 'A plan with this name already exists.' : undefined,
    price: !trial && !(plan.monthly > 0) ? 'Please enter a valid monthly price.' : undefined,
    trial: trial && !((plan.trialDays ?? 0) > 0) ? 'Please enter a trial length in days, for example 14.' : undefined,
    family: plan.kind === 'family' && (!(plan.familyIncluded! > 0) || !(plan.addOnPrice! > 0)) ? 'Please enter the family members included and the add-on price.' : undefined,
    features: !trial && features.length === 0 ? 'Please add at least one feature.' : undefined,
  };
  const valid = !Object.values(errors).some(Boolean);

  const commit = (status: Plan['status'], done: string) =>
    run(() => {
      useAdminStore.getState().savePlan({ ...plan, name: plan.name.trim(), features, status });
      setConfirm(null);
      close();
    }, done);

  const save = (status: Plan['status']) => {
    setTouched(true);
    if (!valid) return;
    if (!existing && status === 'active') return setConfirm('publish');
    if (existing && existing.monthly !== plan.monthly && !trial) return setConfirm('price');
    commit(status, status === 'draft' ? 'Your draft has been saved.' : 'Your changes have been saved.');
  };

  return (
    <Drawer
      title={existing ? existing.name : 'New plan'}
      subtitle={canEdit ? undefined : 'Only the Super Admin can change plans.'}
      onClose={tryClose}
      actions={
        canEdit && (
          existing ? (
            <>
              <Button size="sm" loading={busy} onClick={() => save(plan.status === 'draft' ? 'active' : plan.status)}>{plan.status === 'draft' ? 'Publish' : 'Save changes'}</Button>
              {plan.status === 'active' && !trial && <Button size="sm" variant="secondary" onClick={() => setConfirm('inactive')}>Make inactive</Button>}
              {plan.status === 'inactive' && <Button size="sm" variant="secondary" onClick={() => commit('active', 'Your changes have been saved.')}>Make active</Button>}
            </>
          ) : (
            <>
              <Button size="sm" loading={busy} onClick={() => save('active')}>Publish</Button>
              <Button size="sm" variant="secondary" onClick={() => save('draft')}>Save as draft</Button>
              <Button size="sm" variant="ghost" onClick={tryClose}>Cancel</Button>
            </>
          )
        )
      }
    >
      <fieldset className={styles.form} disabled={!canEdit}>
        <Section title="Plan">
          <div className={styles.fields}>
            <Input label="Plan name" value={plan.name} disabled={trial} error={touched ? errors.name : undefined} onChange={(e) => set('name', e.target.value)} />
            {/* There's only one Free trial, so new plans are Individual or Family (story 8.2). */}
            {!trial && (
              <Segmented<Plan['kind']>
                label="Plan type"
                value={plan.kind}
                onChange={(v) => set('kind', v)}
                options={[{ value: 'individual', label: 'Individual' }, { value: 'family', label: 'Family' }]}
              />
            )}
          </div>
        </Section>
        <Section title={trial ? 'Trial length' : 'Pricing'}>
          <div className={styles.row}>
            {trial ? (
              <NumberField label="Trial length (days)" value={plan.trialDays ?? 14} hint="New trials only; current trials keep their length" onChange={(v) => set('trialDays', v)} />
            ) : (
              <NumberField label="Monthly price (USD)" decimals value={plan.monthly} hint="New subscribers straight away; existing ones from their next billing date" onChange={(v) => set('monthly', v)} />
            )}
            {plan.kind === 'family' && (
              <>
                <NumberField label="Family members included" value={plan.familyIncluded ?? 3} min={1} onChange={(v) => set('familyIncluded', v)} />
                <NumberField label="Price per add-on member (USD)" decimals value={plan.addOnPrice ?? 0} onChange={(v) => set('addOnPrice', v)} />
              </>
            )}
          </div>
          {touched && (errors.price || errors.trial || errors.family) && <p className={styles.error}>{errors.price ?? errors.trial ?? errors.family}</p>}
        </Section>
        <Section title="What's included">
          <TextArea
            label="Features shown to Clients, one per line"
            value={featuresText}
            minRows={5}
            hint={touched ? errors.features : undefined}
            onChange={(e) => setFeaturesText(e.target.value)}
          />
          <p className={styles.muted}>Consultations and the member discount aren't sold through plans.</p>
        </Section>
        {existing && existing.priceHistory.length > 0 && (
          <Section title="Price history">
            <KeyValueList items={[...existing.priceHistory].reverse().map((h) => ({ label: formatDate(h.at), value: `${h.price} · ${h.by}` }))} />
          </Section>
        )}
        {!trial && (
          <Section title="Stripe">
            {stripeOn && plan.stripePriceId ? (
              <KeyValueList
                items={[
                  { label: 'Price ID', value: <CopyText value={plan.stripePriceId} label="price ID" /> },
                  { label: 'Sync', value: <StatusText tone="success">Synced</StatusText> },
                ]}
              />
            ) : (
              <p className={styles.muted}>{stripeOn ? 'This plan syncs to Stripe, the App Store and Google Play when you publish it.' : 'Stripe isn’t connected yet, so this plan’s price isn’t synced.'}</p>
            )}
          </Section>
        )}
      </fieldset>
      {confirm === 'price' && (
        <ConfirmDialog
          title="Change the price?"
          body={`Change the price to ${money(plan.monthly)}? New subscribers will pay this straight away. Existing subscribers will pay it from their next billing date, after they've been told.`}
          confirm="Change price"
          busy={busy}
          onConfirm={() => commit(plan.status, 'Your changes have been saved.')}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === 'publish' && (
        <ConfirmDialog
          title="Publish this plan?"
          body={`Publish ${plan.name.trim()}? It will be shown to Clients on the plan screen.`}
          confirm="Publish"
          busy={busy}
          onConfirm={() => commit('active', `${plan.name.trim()} is now available to Clients.`)}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === 'inactive' && (
        <ConfirmDialog
          title="Make this plan inactive?"
          body="Make this plan inactive? New Clients won't be able to choose it. Clients already on it will keep it."
          confirm="Make inactive"
          busy={busy}
          onConfirm={() => commit('inactive', 'Your changes have been saved.')}
          onClose={() => setConfirm(null)}
        />
      )}
      {leaving && <UnsavedChangesDialog onLeave={close} onStay={() => setLeaving(false)} />}
    </Drawer>
  );
}
