/** Filter state for one admin table, kept in the nav store so it survives opening a record and coming back
 *  (cleared when the admin leaves the section). `initial` holds the screen's defaults (a TableFilters FilterState). */
import { useAdminNav } from '@admin/navigation';

export function useTableFilters<T>(key: string, initial: T) {
  const stored = useAdminNav((s) => s.filters[key] as T | undefined);
  const state = stored ?? initial;
  const set = (next: T) => useAdminNav.getState().setFilters(key, next);
  return { state, onChange: set, initial };
}
