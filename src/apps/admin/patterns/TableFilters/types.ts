/** Shared filter model for admin tables (Filter Design Guidelines, Nov 2026). */
import type { SortValue } from '../SortRange/sortValue';

/** One single-select category. 'all' means no filter. `more` tucks it behind "More filters". */
export interface FilterCategory {
  key: string;
  /** Same word as the table column header, e.g. "Status". */
  label: string;
  options: { value: string; label: string }[];
  more?: boolean;
}

/** A one-tap shortcut for a common task, e.g. "Needs attention". */
export interface QuickFilter {
  key: string;
  label: string;
}

export interface FilterState {
  query: string;
  values: Record<string, string>;
  quick: string | null;
  sort: SortValue;
}
