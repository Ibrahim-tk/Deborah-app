/** @pattern TableFilters — the one filter bar above every admin table (Filter Design Guidelines, Nov 2026):
 *  search on the left; up to 3 categories, "More filters" and Sort grouped on the right; quick filters under it; then
 *  the applied-filter chips with Clear all. The result count sits under the table (DataTable footer). Same pill controls as before. */
import { formatDate } from '@shared/admin';
import { Select } from '@admin/ui';
import { FilterBar } from '../FilterBar';
import { SortRange } from '../SortRange/SortRange';
import { QuickFilters } from './parts/QuickFilters';
import { MoreFilters } from './parts/MoreFilters';
import { ActiveFilters, type Chip } from './parts/ActiveFilters';
import type { FilterCategory, FilterState, QuickFilter } from './types';
import styles from './TableFilters.module.css';

export interface TableFiltersProps {
  state: FilterState;
  onChange: (next: FilterState) => void;
  /** The screen's starting view; "Clear all" returns here. */
  initial: FilterState;
  categories: FilterCategory[];
  quick?: QuickFilter[];
  placeholder: string;
  /** What the custom date range means, e.g. "Signed up between". */
  rangeLabel: string;
}

const isAll = (v: string | undefined) => !v || v === 'all';

export function TableFilters({ state, onChange, initial, categories, quick, placeholder, rangeLabel }: TableFiltersProps) {
  const set = (patch: Partial<FilterState>) => onChange({ ...state, ...patch });
  const setValue = (key: string, value: string) => set({ values: { ...state.values, [key]: value } });
  // Three or fewer categories all fit in the bar; otherwise `more` ones (and any past three) go behind More filters.
  const visible = categories.length <= 3 ? categories : categories.filter((c) => !c.more).slice(0, 3);
  const more = categories.filter((c) => !visible.includes(c));

  const chips: Chip[] = [
    ...categories
      .filter((c) => !isAll(state.values[c.key]))
      .map((c) => ({
        key: c.key,
        label: `${c.label}: ${c.options.find((o) => o.value === state.values[c.key])?.label ?? ''}`,
        onRemove: () => setValue(c.key, 'all'),
      })),
    ...(state.quick ? [{ key: 'quick', label: quick?.find((q) => q.key === state.quick)?.label ?? '', onRemove: () => set({ quick: null }) }] : []),
    ...(state.sort.order === 'custom'
      ? [{ key: 'dates', label: `Dates: ${formatDate(state.sort.from)} to ${formatDate(state.sort.to)}`, onRemove: () => set({ sort: { ...state.sort, order: 'latest' } }) }]
      : []),
  ];
  // "Clear all" only while a filter chip is showing; it returns the screen to its starting view.
  const clearLabel = chips.length ? 'Clear all' : null;

  return (
    <div className={styles.root}>
      <FilterBar
        query={state.query}
        onQuery={(query) => set({ query })}
        placeholder={placeholder}
      >
        {visible.map((c) => (
          <Select key={c.key} label={c.label} hideLabel category={c.label} value={state.values[c.key] ?? 'all'} onChange={(v) => setValue(c.key, v)} options={withAny(c)} />
        ))}
        {more.length > 0 && <MoreFilters categories={more.map((c) => ({ ...c, options: withAny(c) }))} values={state.values} onApply={(v) => set({ values: { ...state.values, ...v } })} />}
        <SortRange value={state.sort} onChange={(sort) => set({ sort })} rangeLabel={rangeLabel} />
      </FilterBar>
      {quick && quick.length > 0 && <QuickFilters items={quick} value={state.quick} onChange={(q) => set({ quick: q })} />}
      <ActiveFilters chips={chips} clearLabel={clearLabel} onClear={() => onChange(initial)} />
    </div>
  );
}

/** Every category starts with "Any" (value 'all'); the trigger then reads just the category name. */
function withAny(c: FilterCategory) {
  return [{ value: 'all', label: 'Any' }, ...c.options.filter((o) => o.value !== 'all')];
}
