/**
 * @screen  A-7.3 · Plan editor
 * @flow    A7 Subscription & billing management (super admin only)
 * @states  new · editing · invalid · saving · read only (admin role)
 * @spec    docs/admin/README.md#a-73-plan-editor
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { useAdminStore, type Plan } from '@shared/admin';
import { Button, Input, Segmented, TextArea, Toggle } from '@admin/ui';
import { AdminPage, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import { NumberField } from './parts/NumberField';
import styles from './PlanEditor.module.css';

const FEATURES = ['Unlimited questions', 'Lab review', 'Family profiles', 'Visit briefs', 'Book Deborah'];
const blank = (): Plan => ({
  id: `plan-${Date.now().toString(36)}`, name: '', kind: 'individual', monthly: 0, yearly: 0, freeQuestions: 3, trialDays: 7,
  maxProfiles: 1, features: Object.fromEntries(FEATURES.map((f) => [f, false])), rules: '', active: false,
});

export default function PlanEditor({ planId }: { planId: string | null }) {
  const existing = useAdminStore((s) => s.plans.find((p) => p.id === planId));
  const canEdit = useAdminStore((s) => s.role === 'super');
  const pop = useAdminNav((s) => s.pop);
  const [plan, setPlan] = useState<Plan>(() => existing ?? blank());
  const [touched, setTouched] = useState(false);
  const { busy, run } = useSim();
  const set = <K extends keyof Plan>(k: K, v: Plan[K]) => setPlan((p) => ({ ...p, [k]: v }));

  const save = () => {
    setTouched(true);
    if (!plan.name.trim()) return;
    run(() => {
      useAdminStore.getState().savePlan({ ...plan, name: plan.name.trim(), maxProfiles: plan.kind === 'individual' ? 1 : plan.maxProfiles });
      pop();
    }, existing ? 'Plan saved' : 'Plan created');
  };

  return (
    <AdminPage
      title={existing ? existing.name : 'New plan'}
      subtitle={canEdit ? undefined : 'Only super admins can change plans.'}
      action={canEdit && <Button loading={busy} onClick={save}>{existing ? 'Save plan' : 'Create plan'}</Button>}
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
            <NumberField label="Monthly price (USD)" value={plan.monthly} hint="0 hides the monthly option" onChange={(v) => set('monthly', v)} />
            <NumberField label="Yearly price (USD)" value={plan.yearly} hint="0 hides the yearly option" onChange={(v) => set('yearly', v)} />
          </div>
        </Section>
        <Section title="Free use">
          <div className={styles.row}>
            <NumberField label="Free questions" value={plan.freeQuestions} hint="Before asking to subscribe" onChange={(v) => set('freeQuestions', v)} />
            <NumberField label="Trial length (days)" value={plan.trialDays} hint="0 means no trial" onChange={(v) => set('trialDays', v)} />
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
        <Section title="Availability">
          <Toggle
            label="Plan is active"
            description="Inactive plans are hidden from the app. Current subscribers keep them."
            checked={plan.active}
            onChange={(v) => set('active', v)}
          />
        </Section>
      </fieldset>
    </AdminPage>
  );
}
