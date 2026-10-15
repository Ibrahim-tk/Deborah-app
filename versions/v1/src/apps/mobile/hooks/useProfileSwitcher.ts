/** Opens M-6.1 from any tab-root avatar: medium sheet, large when there are more than 3 profiles (F06). */
import { useCallback } from 'react';
import { useAppStore } from '@flow-v1/shared/store';
import { useNav } from '@flow-v1/apps/mobile/navigation';

export function useProfileSwitcher() {
  const { presentSheet } = useNav();
  return useCallback(() => {
    const many = useAppStore.getState().profiles.order.length > 3;
    presentSheet('M-6.1', undefined, { detent: many ? 'large' : 'medium' });
  }, [presentSheet]);
}
