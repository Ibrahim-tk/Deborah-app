/**
 * @screen  A-2.1 · Dashboard
 * @flow    A2 Dashboard & analytics (story 2.1)
 * @states  needs attention · all clear · date range (preset / custom) · week / month · admin (no subscription, trial or content)
 * @spec    docs/admin/stories.md#21---dashboard--analytics
 * @xref    web: none (admin only)
 */
import { useMemo, useState } from 'react';
import { adminMetrics, count, useAdminStore } from '@shared/admin';
import { BarChart, DonutChart, KpiBand, LineChart, Segmented } from '@admin/ui';
import { AdminPage, DateRangeFilter, Section, presetRange, type DateRange } from '@admin/patterns';
import { useLiveMetrics } from '@admin/hooks/useLiveMetrics';
import { daysIn, trend, windows } from './parts/kpis';
import { NeedsAttention } from './parts/NeedsAttention';
import { useBusinessKpis } from './parts/business';
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
  // Weekly points are numbered within the selected range (W1 = its first week), not by calendar week.
  const numbered = (pts: typeof adminMetrics.registrationsWeekly) => pts.slice(-weeks).map((p, i) => ({ ...p, label: `W${i + 1}` }));
  const growth = period === 'week' ? numbered(adminMetrics.registrationsWeekly) : adminMetrics.registrationsMonthly;
  const conversations = period === 'week' ? numbered(adminMetrics.conversationsWeekly) : adminMetrics.conversationsMonthly;
  const registered = adminMetrics.registrationsMonthly.reduce((s, p) => s + p.value, 0) + clients;

  // Story 2.1: escalations by status (not yet reviewed split by level, then reviewed).
  const notReviewed = escalations.filter((e) => e.status === 'not_reviewed').length;
  const biz = useBusinessKpis(range);
  const status = useMemo(() => {
    const open = escalations.filter((e) => e.status === 'not_reviewed');
    return [
      { label: 'Emergency, not reviewed', value: open.filter((e) => e.type === 'emergency').length, tone: 'danger' as const },
      { label: 'Crisis, not reviewed', value: open.filter((e) => e.type === 'crisis').length, tone: 'gold' as const },
      { label: 'Urgent, not reviewed', value: open.filter((e) => e.type === 'urgent').length, tone: 'accent' as const },
      { label: 'Reviewed', value: escalations.filter((e) => e.status === 'reviewed').length, tone: 'success' as const },
    ];
  }, [escalations]);

  // KPI trends follow the date range: this range vs the equal period before it.
  const days = daysIn(range);
  const regs = windows(adminMetrics.registrationsWeekly, days);
  const convs = windows(adminMetrics.conversationsWeekly, days);
  const span = Date.parse(range.to) - Date.parse(range.from);
  const openedIn = (from: number, to: number) => escalations.filter((e) => { const t = Date.parse(e.opened); return t > from && t <= to; }).length;
  const escNow = openedIn(Date.parse(range.from), Date.parse(range.to));
  const escBefore = openedIn(Date.parse(range.from) - span, Date.parse(range.from));
  // Active users in the window scale with how busy conversations were; the 30-day figure is the live anchor.
  const active = Math.round(live.active * Math.min(1.6, convs.now / windows(adminMetrics.conversationsWeekly, 30).now));

  return (
    <AdminPage title="Dashboard" action={<DateRangeFilter value={range} onChange={setRange} />}>
      <NeedsAttention />
      <KpiBand
        items={[
          { label: 'Total registered clients', value: count(registered), trend: trend(regs.now, regs.before, range) },
          { label: 'Active clients', value: count(active), live: true, trend: trend(convs.now, convs.before, range) },
          { label: 'Total conversations', value: count(Math.round(convs.now)), trend: trend(convs.now, convs.before, range) },
          { label: 'Escalations', value: count(escNow), note: `${notReviewed} not yet reviewed`, trend: trend(escNow, escBefore, range, true) },
        ]}
      />
      <KpiBand items={biz.kpis} />
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
        <Section title="Escalation status" surface>
          <DonutChart label="Escalation status" totalLabel="cases" data={status} />
        </Section>
        <Section title="Conversations" surface>
          <BarChart label="AI conversations" data={conversations} />
        </Section>
        <Section title="Top health topics" surface>
          <BarChart label="Top health topics" orientation="horizontal" data={[...adminMetrics.topics].sort((a, b) => b.value - a.value)} />
        </Section>
        <Section title="Teen accounts over time" surface>
          <LineChart label="Teens with their own account (joined)" height={180} labels={biz.teenSeries.map((p) => p.label)} series={[{ name: 'Joined', values: biz.teenSeries.map((p) => p.value) }]} />
        </Section>
        {biz.subscribers && (
          <Section title="Subscribers over time" surface>
            <LineChart
              label="Active subscribers by plan"
              height={180}
              labels={biz.subscribers.map((p) => p.label)}
              series={[
                { name: 'Individual', values: biz.subscribers.map((p) => p.individual) },
                { name: 'Family', values: biz.subscribers.map((p) => p.family), tone: 'gold' },
              ]}
            />
          </Section>
        )}
      </div>
    </AdminPage>
  );
}
