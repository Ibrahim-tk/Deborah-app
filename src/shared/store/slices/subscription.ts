import type { StateCreator } from 'zustand';
import { addDays, nowFrom } from '../../utils/dates';
import type { AppState, SubscriptionSlice } from '../types';

type Actions = Pick<SubscriptionSlice, 'purchase' | 'cancelSubscription' | 'holdMessage' | 'releaseHeld' | 'clearHeld' | 'dismissLimit'>;

export const subscriptionActions: StateCreator<AppState, [], [], Actions> = (set) => ({
  purchase: (plan, billing) =>
    set((s) => ({
      plan,
      billing,
      limitReachedPending: false,
      cancelled: false,
      renewsAt: addDays(nowFrom(s).toISOString(), billing === 'annual' ? 365 : 30),
    })),
  cancelSubscription: () => set({ cancelled: true }),
  holdMessage: (text, scriptId) => set({ heldMessage: { text, scriptId } }),
  releaseHeld: () => set((s) => (s.heldMessage ? { heldMessage: { ...s.heldMessage, release: true } } : {})),
  clearHeld: () => set({ heldMessage: undefined }),
  dismissLimit: () => set({ limitReachedPending: false }),
});
