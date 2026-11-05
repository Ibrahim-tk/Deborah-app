/** Sort state shared by admin tables: Latest, Oldest, or only a custom date range (newest first). */
import { TODAY } from '../DateRangeFilter/range';

export interface SortValue {
  order: 'latest' | 'oldest' | 'custom';
  from: string;
  to: string;
}

export const DEFAULT_SORT: SortValue = { order: 'latest', from: '2026-09-01', to: TODAY };

/** Filters (custom range) and orders rows by the date `dateOf` returns (ISO date or datetime). */
export function applySort<T>(rows: T[], sort: SortValue, dateOf: (row: T) => string): T[] {
  const inRange = sort.order === 'custom' ? rows.filter((r) => dateOf(r).slice(0, 10) >= sort.from && dateOf(r).slice(0, 10) <= sort.to) : rows;
  return [...inRange].sort((a, b) => (sort.order === 'oldest' ? dateOf(a).localeCompare(dateOf(b)) : dateOf(b).localeCompare(dateOf(a))));
}
