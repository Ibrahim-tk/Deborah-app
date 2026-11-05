/** KPI figures and trends for the selected date range, from the seeded weekly series.
 *  A trend compares the range with the equal-length period just before it. */
import type { SeriesPoint } from '@shared/admin';
import type { Kpi } from '@admin/ui';
import type { DateRange } from '@admin/patterns';

const DAY = 86_400_000;
export const daysIn = (r: DateRange) => Math.max(1, Math.round((Date.parse(r.to) - Date.parse(r.from)) / DAY));

/** Per-day rate over the last `days` vs the `days` before (series is weekly; the oldest data repeats if the window runs past it). */
export function windows(series: SeriesPoint[], days: number) {
  const perDay = series.map((p) => p.value / 7);
  const at = (i: number) => perDay[Math.max(0, perDay.length - 1 - i)];
  let now = 0, before = 0;
  for (let d = 0; d < days; d++) {
    now += at(Math.floor(d / 7));
    before += at(Math.floor((d + days) / 7));
  }
  return { now, before };
}

export const pct = (now: number, before: number) => (before === 0 ? 0 : ((now - before) / before) * 100);

export function rangeLabel(r: DateRange) {
  return r.preset === 'custom' ? 'previous period' : `previous ${r.preset} days`;
}

export function trend(now: number, before: number, r: DateRange, lowerIsBetter = false): Kpi['trend'] {
  // Nothing to compare against (e.g. no escalations in the earlier period): show no trend rather than a fake 0%.
  if (before === 0) return undefined;
  return { delta: pct(now, before), against: rangeLabel(r), lowerIsBetter };
}


