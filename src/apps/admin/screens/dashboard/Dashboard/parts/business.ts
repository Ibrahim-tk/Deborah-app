/** Story 2.1 business KPIs and series: teen accounts (everyone), active subscribers and free trial (Super Admin only).
 *  Seeded counts are scaled to the dashboard's headline numbers; the date range picks how many months show. */
import { adminMetrics, count, useAdminStore } from '@shared/admin';
import type { Kpi } from '@admin/ui';
import type { DateRange } from '@admin/patterns';
import { daysIn } from './kpis';

export function useBusinessKpis(range: DateRange) {
  const role = useAdminStore((s) => s.role);
  const clients = useAdminStore((s) => s.clients);
  const months = Math.max(2, Math.ceil(daysIn(range) / 30));

  const teens = clients.filter((c) => c.accountType === 'teen');
  const joined = teens.filter((t) => t.teenStatus === 'joined').length;
  const invited = teens.filter((t) => t.teenStatus === 'invite_sent').length;
  const paused = teens.filter((t) => t.teenStatus === 'paused').length;

  const growth = adminMetrics.subscriptionGrowth.slice(-months);
  const adults = clients.filter((c) => c.accountType === 'adult');
  const familyShare = adults.filter((c) => c.planId === 'family-monthly').length / (adults.filter((c) => c.planId !== 'trial').length || 1);
  let total = adminMetrics.subscriptionGrowth.slice(0, -months).reduce((n, g) => n + g.added - g.churned, 0);
  const subscribers = growth.map((g) => {
    total += g.added - g.churned;
    return { label: g.label, family: Math.round(total * familyShare), individual: Math.round(total * (1 - familyShare)) };
  });
  const last = subscribers.at(-1) ?? { individual: 0, family: 0 };
  const onTrial = adults.filter((c) => c.planId === 'trial').length;
  // OPEN: trial conversions aren't in the seed; shown as roughly a third of trials in the range.
  const converted = Math.round(onTrial * months * 0.35);

  const kpis: Kpi[] = [
    { label: 'Teen accounts', value: count(teens.length), note: `${joined} joined · ${invited} invite sent · ${paused} access paused` },
    ...(role === 'super'
      ? [
          { label: 'Active subscribers', value: count(last.individual + last.family), note: `${count(last.individual)} Individual · ${count(last.family)} Family` },
          { label: 'Free trial', value: count(onTrial), note: `${count(converted)} converted to a paid plan in this range` },
        ]
      : []),
  ];

  const teenSeries = growth.map((g, i) => ({ label: g.label, value: Math.max(0, joined - (growth.length - 1 - i)) }));
  return { kpis, teenSeries, subscribers: role === 'super' ? subscribers : null };
}
