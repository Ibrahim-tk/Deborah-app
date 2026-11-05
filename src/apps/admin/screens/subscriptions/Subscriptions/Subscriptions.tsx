/**
 * @screen  A-7.1 · Subscriptions (with A-7.2 plan list)
 * @flow    A7 Subscription & billing management (super admin only)
 * @states  default · checking payment connection
 * @spec    docs/admin/README.md#a-71-subscriptions
 * @xref    web: none (admin only)
 */
import { adminMetrics, count, useAdminStore } from '@shared/admin';
import { useState, type ReactNode } from 'react';
import { Button, DonutChart, LineChart, Select } from '@admin/ui';
import { AdminPage, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { PlansTable } from './parts/PlansTable';
import { KpiCard, MiniStats } from './parts/KpiCard';
import { Breakdown } from './parts/Breakdown';
import { PaidFreeSplit } from './parts/PaidFreeVisuals';
import styles from './Subscriptions.module.css';

const growth = adminMetrics.subscriptionGrowth;
/** Paid subscriptions today: the net of the last six months of the seed (keeps the headline stable). */
const ACTIVE = growth.slice(-6).reduce((s, g) => s + g.added - g.churned, 0);

type PlanFilter = 'all' | 'individual' | 'family';
type Period = '3' | '6' | '12' | 'all';

export default function Subscriptions() {
  const clients = useAdminStore((s) => s.clients);
  const plans = useAdminStore((s) => s.plans);
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const stripeOn = useAdminStore((s) => s.stripe.status === 'connected');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [period, setPeriod] = useState<Period>('6');

  // Seeded clients set the mix; the headline total scales it.
  const paid = clients.filter((c) => c.planId !== 'trial' && c.accountType === 'adult');
  const share = (id: string) => Math.round((paid.filter((c) => c.planId === id).length / (paid.length || 1)) * ACTIVE);
  const tones = ['accent', 'gold', 'success', 'muted'] as const;
  const distribution = plans
    .filter((p) => p.kind !== 'trial')
    .map((p, i) => ({ label: p.name, value: share(p.id), tone: tones[i % tones.length] }))
    .filter((d) => d.value > 0);

  // Filters: the plan type scales the trend by that plan's share; the period picks the last N months.
  const kindShare =
    planFilter === 'all' ? 1 : plans.filter((p) => p.kind === planFilter && p.monthly > 0).reduce((n, p) => n + share(p.id), 0) / (ACTIVE || 1);
  const months = (period === 'all' ? growth : growth.slice(-Number(period))).map((g) => ({
    label: g.label,
    added: Math.round(g.added * kindShare),
    churned: Math.round(g.churned * kindShare),
  }));
  const added = months.reduce((n, m) => n + m.added, 0);
  const churned = months.reduce((n, m) => n + m.churned, 0);
  const active = Math.round(ACTIVE * kindShare);
  const last = months.at(-1)!;
  // The equal-length period before this one, for trends (none when the range already starts at launch).
  const prior = period === 'all' ? [] : growth.slice(0, -Number(period)).slice(-Number(period));
  const addedBefore = prior.length === months.length ? Math.round(prior.reduce((n, g) => n + g.added, 0) * kindShare) : 0;
  // Free accounts at the same scale as the paid headline, from the seeded free/paid mix.
  const freeUsers = Math.round(((clients.length - paid.length) / (paid.length || 1)) * ACTIVE);
  const churnRate = active ? (last.churned / active) * 100 : 0;

  // Active subscriptions card; the left-side visual for free vs paid users is the free vs paid split.
  const activeCard = (visual: ReactNode) => (
    <KpiCard
      label="Total users"
      layout="split"
      value={count(active + freeUsers)}
      aside={
        // The ring and its plan legend sit together on the right.
        <div className={styles.ring}>
          <DonutChart label="Plan distribution" totalLabel="subscribers" data={distribution} legend={false} />
          <Breakdown rows={distribution.map((d) => ({ label: d.label, value: d.value, pct: Math.round((d.value / (active || 1)) * 100), tone: d.tone === 'gold' ? 'gold' : 'accent' }))} />
        </div>
      }
    >
      {visual}
    </KpiCard>
  );

  return (
    <AdminPage
      title="Subscriptions"
      action={<Button leadingIcon="plus" onClick={() => openDrawer({ kind: 'plan', id: null })}>New plan</Button>}
      toolbar={
        // Trend controls: which plans and how far back. They drive the figures and the growth chart.
        <div className={styles.filters}>
          <Select<PlanFilter>
            label="Plan type"
            hideLabel
            value={planFilter}
            onChange={setPlanFilter}
            options={[{ value: 'all', label: 'All plans' }, { value: 'individual', label: 'Individual' }, { value: 'family', label: 'Family' }]}
          />
          <Select<Period>
            label="Period"
            hideLabel
            value={period}
            onChange={setPeriod}
            options={[{ value: '3', label: 'Last 3 months' }, { value: '6', label: 'Last 6 months' }, { value: '12', label: 'Last 12 months' }, { value: 'all', label: 'All time' }]}
          />
        </div>
      }
    >
      {/* Two cards cover the four stats: subscribers (active, plan mix, free vs paid) and growth and churn. */}
      <div className={styles.grid}>
        {activeCard(<PaidFreeSplit paid={active} free={freeUsers} />)}
        <KpiCard
          label="New subscriptions"
          value={count(added)}
          trend={addedBefore ? { delta: ((added - addedBefore) / addedBefore) * 100, against: `previous ${months.length} months` } : undefined}
          aside={
            <MiniStats
              items={[
                { label: 'Cancelled', value: count(churned) },
                { label: 'Net growth', value: `${added - churned >= 0 ? '+' : ''}${count(added - churned)}` },
                { label: 'Monthly churn', value: `${churnRate.toFixed(1)}%` },
              ]}
            />
          }
        >
          <LineChart
            label="Subscription growth and churn by month"
            height={150}
            labels={months.map((g) => g.label)}
            series={[
              { name: 'New', values: months.map((g) => g.added), tone: 'success' },
              { name: 'Cancelled', values: months.map((g) => g.churned), tone: 'danger' },
            ]}
          />
        </KpiCard>
      </div>
      <Section title="Plans">
        {!stripeOn && <p className={styles.notice}>Payments are off until Stripe is connected in Integrations. Plans show in the app but can't be bought yet.</p>}
        <PlansTable subscribers={share} />
      </Section>
    </AdminPage>
  );
}
