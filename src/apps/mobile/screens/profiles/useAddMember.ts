/**
 * Shared by M-6.1 and M-6.6: what the "Add a family member" row shows and where it leads.
 * Family plan with room → M-6.2; any other plan → M-6.3 (F06 flow).
 */
import { useCallback } from 'react';
import { selectCanAddProfile, useAppStore } from '@shared/store';
import type { AddMemberState } from '@mobile/patterns/profile';
import { useNav } from '@mobile/navigation';

export const MAX_PROFILES = 5;

export function useAddMember() {
  const { presentModal, presentSheet, dismissSheet } = useNav();
  const canAdd = useAppStore(selectCanAddProfile);
  const family = useAppStore((s) => s.plan === 'family');
  // ASSUMPTION: a Family subscriber at 5 profiles sees the row disabled with "5 of 5" rather than the
  // upgrade sheet, whose copy would be wrong for them. The spec only covers "< 5" vs "other plans".
  const addState: AddMemberState = canAdd ? 'available' : family ? 'full' : 'locked';

  const add = useCallback(
    (fromSheet: boolean) => {
      if (addState === 'full') return;
      if (fromSheet) dismissSheet();
      if (addState === 'available') presentModal('M-6.2');
      else presentSheet('M-6.3');
    },
    [addState, dismissSheet, presentModal, presentSheet],
  );

  return { addState, add };
}
