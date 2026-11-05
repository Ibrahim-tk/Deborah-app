/** Story 2.1 business KPIs and series: teen accounts (everyone), active subscribers and free trial (Super Admin only).
 *  Seeded counts are scaled to the dashboard's headline numbers; the date range picks how many months show. */
import { adminMetrics, count, useAdminStore } from '@shared/admin';
import type { Kpi } from '@admin/ui';
import type { DateRange } from '@admin/patterns';
import { daysIn, trend } from './kpis';

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
  // Subscribers at the start of the range, for the trend.
  const startTotal = total;
  const subscribers = growth.map((g) => {
    total += g.added - g.churned;
    return { label: g.label, family: Math.round(total * familyShare), individual: Math.round(total * (1 - familyShare)) };
  });
  const last = subscribers.at(-1) ?? { individual: 0, family: 0 };

  // Folded into the dashboard's single number band: subscribers (with free trial) for the Super Admin, teens for all.
  const subscribersKpi: Kpi | null =
    role === 'super'
      ? { label: 'Active subscribers', value: count(last.individual + last.family), trend: trend(last.individual + last.family, startTotal, range) }
      : null;
  // One short line instead of a trend: with so few teens, a percentage swing means nothing.
  const off = teens.filter((t) => t.teenStatus === 'turned_off').length;
  const teensKpi: Kpi = { label: 'Teen accounts', value: count(teens.length), note: `${joined} joined · ${invited} invited · ${paused + off} paused or off` };
  return { subscribersKpi, teensKpi };
}