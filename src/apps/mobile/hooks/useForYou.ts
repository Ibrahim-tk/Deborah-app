/**
 * Stable "For you" list for the active profile (F07). selectForYou builds new objects on every call,
 * so we subscribe to primitive id / reason arrays and rebuild the items from the library.
 */
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { findLibraryItem } from '@shared/data';
import { selectForYou, useAppStore } from '@shared/store';
import type { LibraryItem } from '@shared/types/content';

export interface ForYouEntry {
  item: LibraryItem;
  reason?: string;
}

export function useForYou(): ForYouEntry[] {
  const ids = useAppStore(useShallow((s) => selectForYou(s).map((f) => f.item.id)));
  const reasons = useAppStore(useShallow((s) => selectForYou(s).map((f) => f.reason ?? '')));
  return useMemo(
    () =>
      ids.flatMap((id, i) => {
        const item = findLibraryItem(id);
        return item ? [{ item, reason: reasons[i] || undefined }] : [];
      }),
    [ids, reasons],
  );
}
