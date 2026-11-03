/**
 * @screen  A-7.1 · Subscriptions (with A-7.2 plan list)
 * @flow    A7 Subscription & billing management (super admin only)
 * @states  default · checking payment connection
 * @spec    docs/admin/README.md#a-71-subscriptions
 * @xref    web: none (admin only)
 */
import { adminMetrics, count, useAdminStore } from '@shared/admin';
import { useState } from 'react';
import { Button, DonutChart, KpiBand, LineChart, Segmented, Select } from '@admin/ui';
import { AdminPage, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { PlansTable } from './parts/PlansTable';
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
  const paid = clients.filter((c) => c.planId !== 'free');
  const share = (id: string) => Math.round((paid.filter((c) => c.planId === id).length / (paid.length || 1)) * ACTIVE);
  const tones = ['accent', 'gold', 'success', 'muted'] as const;
  const distribution = plans
    .filter((p) => p.id !== 'free')
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
  const churnRate = active ? (last.churned / active) * 100 : 0;
  const periodLabel = { '3': 'last 3 months', '6': 'last 6 months', '12': 'last 12 months', all: `time since launch (${growth[0].label})` }[period];

  return (
    <AdminPage
      title="Subscriptions"
      action={<Button leadingIcon="plus" onClick={() => openDrawer({ kind: 'plan', id: null })}>New plan</Button>}
      toolbar={
        // Trend controls: which plans and how far back. They drive the figures and the growth chart.
        <div className={styles.filters}>
          <Segmented<PlanFilter>
            label="Plan type"
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
      <KpiBand
        items={[
          { label: 'Active subscriptions', value: count(active) },
          { label: 'New subscriptions', value: count(added), note: period === 'all' ? `Since launch in ${growth[0].label}` : `In the ${periodLabel}` },
          { label: 'Net growth', value: `${added - churned >= 0 ? '+' : ''}${count(added - churned)}`, note: `${count(churned)} cancelled` },
          { label: 'Monthly churn', value: `${churnRate.toFixed(1)}%`, note: `${last.churned} cancelled in ${last.label}` },
        ]}
      />
      <div className={styles.grid}>
        <Section title="Growth and churn" surface>
          <LineChart
            label="New and cancelled subscriptions by month"
            labels={months.map((g) => g.label)}
            series={[
              { name: 'New', values: months.map((g) => g.added) },
              { name: 'Cancelled', values: months.map((g) => g.churned), tone: 'gold' },
            ]}
          />
        </Section>
        <Section title="Plan distribution" surface>
          <DonutChart label="Subscriptions by plan" totalLabel="subscribers" data={distribution} />
        </Section>
      </div>
      <Section title="Plans">
        {!stripeOn && <p className={styles.notice}>Payments are off until Stripe is connected in Integrations. Plans show in the app but can't be bought yet.</p>}
        <PlansTable subscribers={share} />
      </Section>
    </AdminPage>
  );
}
