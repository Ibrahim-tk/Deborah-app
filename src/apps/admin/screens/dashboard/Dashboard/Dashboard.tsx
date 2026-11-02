/**
 * @screen  A-2.1 · Dashboard
 * @flow    A2 Dashboard & analytics
 * @states  default · date range (preset / custom) · week / month growth
 * @spec    docs/admin/README.md#a-21-dashboard
 * @xref    web: none (admin only)
 */
import { useMemo, useState } from 'react';
import { adminMetrics, count, useAdminStore } from '@shared/admin';
import { BarChart, DonutChart, KpiBand, LineChart, Segmented } from '@admin/ui';
import { AdminPage, DateRangeFilter, Section, presetRange, type DateRange } from '@admin/patterns';
import { useLiveMetrics } from '@admin/hooks/useLiveMetrics';
import styles from './Dashboard.module.css';

/** Weekly points shown for a range: at least 4 so the line still reads. */
const weeksFor = (r: DateRange) => Math.max(4, Math.ceil((Date.parse(r.to) - Date.parse(r.from)) / (7 * 86_400_000)));

export default function Dashboard() {
  const [range, setRange] = useState<DateRange>(presetRange('90'));
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const live = useLiveMetrics();
  const clients = useAdminStore((s) => s.clients.length);
  const escalations = useAdminStore((s) => s.escalations);

  const weeks = weeksFor(range);
  const growth = period === 'week' ? adminMetrics.registrationsWeekly.slice(-weeks) : adminMetrics.registrationsMonthly;
  const conversations = period === 'week' ? adminMetrics.conversationsWeekly.slice(-weeks) : adminMetrics.conversationsMonthly;
  const registered = adminMetrics.registrationsMonthly.reduce((s, p) => s + p.value, 0) + clients;

  const status = useMemo(() => {
    const open = escalations.filter((e) => e.status === 'open');
    return [
      { label: 'Open', value: open.filter((e) => e.type === 'critical').length, tone: 'accent' as const },
      { label: 'In review', value: escalations.filter((e) => e.status === 'in_review').length, tone: 'gold' as const },
      { label: 'Resolved', value: escalations.filter((e) => e.status === 'resolved').length, tone: 'success' as const },
      { label: 'Emergency', value: open.filter((e) => e.type === 'emergency').length, tone: 'danger' as const },
    ];
  }, [escalations]);
  const openCount = escalations.filter((e) => e.status !== 'resolved').length;

  return (
    <AdminPage title="Dashboard" action={<DateRangeFilter value={range} onChange={setRange} />}>
      <KpiBand
        items={[
          { label: 'Registered users', value: count(registered) },
          { label: 'Active users', value: count(live.active), note: 'Last 30 days', live: true },
          { label: 'Conversations', value: count(live.conversations), live: true },
          { label: 'Open escalations', value: count(openCount), note: `${status[3].value} emergency` },
        ]}
      />
      <div className={styles.grid}>
        <Section
          title="User growth"
          surface
          trailing={
            <Segmented
              label="Group by"
              value={period}
              onChange={setPeriod}
              options={[{ value: 'week', label: 'Weekly' }, { value: 'month', label: 'Monthly' }]}
            />
          }
        >
          <LineChart label="New registrations" labels={growth.map((p) => p.label)} series={[{ name: 'New registrations', values: growth.map((p) => p.value) }]} />
        </Section>
        <Section title="Conversations" surface>
          <BarChart label="AI conversations" data={conversations} />
        </Section>
        <Section title="Top health topics" surface>
          <BarChart label="Top health topics" orientation="horizontal" data={adminMetrics.topics} />
        </Section>
        <Section title="Escalations by status" surface>
          <DonutChart label="Escalations by status" totalLabel="cases" data={status} />
        </Section>
      </div>
    </AdminPage>
  );
}
