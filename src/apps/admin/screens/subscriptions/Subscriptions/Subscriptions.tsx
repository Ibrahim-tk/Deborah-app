/**
 * @screen  A-7.1 · Subscriptions (with A-7.2 plan list)
 * @flow    A7 Subscription & billing management (super admin only)
 * @states  default · checking payment connection
 * @spec    docs/admin/README.md#a-71-subscriptions
 * @xref    web: none (admin only)
 */
import { adminMetrics, count, useAdminStore } from '@shared/admin';
import { Button, DonutChart, KpiBand, LineChart } from '@admin/ui';
import { AdminPage, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { PlansTable } from './parts/PlansTable';
import { StripeCard } from './parts/StripeCard';
import styles from './Subscriptions.module.css';

const growth = adminMetrics.subscriptionGrowth;
const ACTIVE = growth.reduce((s, g) => s + g.added - g.churned, 0);
const FREE = Math.round(adminMetrics.activeUsers * 0.42);
const churnRate = (growth.at(-1)!.churned / ACTIVE) * 100;

export default function Subscriptions() {
  const clients = useAdminStore((s) => s.clients);
  const plans = useAdminStore((s) => s.plans);
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const stripeOn = useAdminStore((s) => s.stripe.status === 'connected');

  // Seeded clients set the mix; the headline total scales it.
  const paid = clients.filter((c) => c.planId !== 'free');
  const share = (id: string) => Math.round((paid.filter((c) => c.planId === id).length / (paid.length || 1)) * ACTIVE);
  const tones = ['accent', 'gold', 'success', 'muted'] as const;
  const distribution = plans
    .filter((p) => p.id !== 'free')
    .map((p, i) => ({ label: p.name, value: share(p.id), tone: tones[i % tones.length] }))
    .filter((d) => d.value > 0);

  return (
    <AdminPage title="Subscriptions" action={<Button leadingIcon="plus" onClick={() => openDrawer({ kind: 'plan', id: null })}>New plan</Button>}>
      <KpiBand
        items={[
          { label: 'Active subscriptions', value: count(ACTIVE) },
          { label: 'Free users', value: count(FREE) },
          { label: 'Paid share', value: `${Math.round((ACTIVE / (ACTIVE + FREE)) * 100)}%`, note: 'Paid against free users' },
          { label: 'Monthly churn', value: `${churnRate.toFixed(1)}%`, note: `${growth.at(-1)!.churned} cancelled this month` },
        ]}
      />
      <div className={styles.grid}>
        <Section title="Growth and churn" surface>
          <LineChart
            label="New and cancelled subscriptions by month"
            labels={growth.map((g) => g.label)}
            series={[
              { name: 'New', values: growth.map((g) => g.added) },
              { name: 'Cancelled', values: growth.map((g) => g.churned), tone: 'gold' },
            ]}
          />
        </Section>
        <Section title="Plan distribution" surface>
          <DonutChart label="Subscriptions by plan" totalLabel="subscribers" data={distribution} />
        </Section>
      </div>
      <Section title="Plans">
        {!stripeOn && <p className={styles.notice}>Payments are off until Stripe is connected. Plans show in the app but can't be bought yet.</p>}
        <PlansTable subscribers={share} />
      </Section>
      <Section title="Payments">
        <StripeCard />
      </Section>
    </AdminPage>
  );
}
