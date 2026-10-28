/**
 * Shared by M-6.1 and M-6.6: what the "Add a family member" row shows and where it leads.
 * Family with room → M-6.2; any other plan → M-6.3 (F06 flow).
 */
import { useCallback } from 'react';
import { selectCanAddProfile, useAppStore } from '@shared/store';
import type { AddMemberState } from '@mobile/patterns/profile';
import { useNav } from '@mobile/navigation';
import { useAccountGate } from '@mobile/hooks/useAccountGate';

/** Cap for the active plan: Family 4 (1 + 3); extra members are a paid add-on (M-6.3). */
export function maxProfilesFor(plan: string): number {
  if (plan === 'family') return 4;
  return 1;
}

export const MAX_PROFILES = 4;

export function useAddMember() {
  const { presentModal, presentSheet, dismissSheet } = useNav();
  const gate = useAccountGate();
  const canAdd = useAppStore(selectCanAddProfile);
  const plan = useAppStore((s) => s.plan);
  const familySlots = plan === 'family';
  // At the plan cap: show "n of n" rather than the upgrade sheet.
  const addState: AddMemberState = canAdd ? 'available' : familySlots ? 'full' : 'locked';

  const add = useCallback(
    (fromSheet: boolean) => {
      if (addState === 'full') return;
      if (fromSheet) dismissSheet();
      gate('family', () => {
        if (addState === 'available') presentModal('M-6.2');
        else presentSheet('M-6.3');
      });
    },
    [addState, dismissSheet, gate, presentModal, presentSheet],
  );

  return { addState, add };
}
