/** The table's one live count, e.g. "Showing 3 clients with Payment issue". */
import { formatDate } from '@shared/admin';
import type { SortValue } from './sortValue';

export function showing(count: number, noun: [string, string], details: (string | false | undefined | null)[]) {
  const parts = details.filter(Boolean);
  return `Showing ${count} ${count === 1 ? noun[0] : noun[1]}${parts.length ? ` ${parts.join(', ')}` : ''}`;
}

/** "from 1 Sep 2026 to 2 Nov 2026" when a custom range is on, otherwise nothing. */
export const rangePhrase = (sort: SortValue, verb: string) =>
  sort.order === 'custom' ? `${verb} ${formatDate(sort.from)} to ${formatDate(sort.to)}` : false;
