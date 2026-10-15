/**
 * useAppStore — one Zustand store composed of slices, in memory only — no storage; a reload
 * starts fresh from the scenario (docs/05-state-and-scenarios.md §1). Actions are the only way to mutate.
 */
import { create } from 'zustand';
import { createDefaults } from './defaults';
import { sessionActions } from './slices/session';
import { subscriptionActions } from './slices/subscription';
import { profilesActions } from './slices/profiles';
import { conversationsActions } from './slices/conversations';
import { contentActions } from './slices/content';
import { notificationsActions } from './slices/notifications';
import type { AppState } from './types';

export const useAppStore = create<AppState>()((...a) => ({
  ...createDefaults(),
  ...sessionActions(...a),
  ...subscriptionActions(...a),
  ...profilesActions(...a),
  ...conversationsActions(...a),
  ...contentActions(...a),
  ...notificationsActions(...a),
}));

export type { AppState, AppData } from './types';
export { SELF_PROFILE_ID, createDefaults } from './defaults';
export * from './selectors';
export { loadScenario } from './loadScenario';
export { FOLLOW_UP_BODY, FOLLOW_UP_TITLE } from './slices/notifications';
