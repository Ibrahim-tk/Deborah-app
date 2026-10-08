import type { StateCreator } from 'zustand';
import { SELF_PROFILE_ID } from '../defaults';
import type { AppState, ProfilesSlice } from '../types';

type Actions = Pick<ProfilesSlice, 'addProfile' | 'updateProfile' | 'updateIntake' | 'deleteProfile'>;

/** Keep only the entries of a record whose value doesn't belong to `profileId`. */
const without = <T extends { profileId: string }>(byId: Record<string, T>, profileId: string) =>
  Object.fromEntries(Object.entries(byId).filter(([, v]) => v.profileId !== profileId));

export const profilesActions: StateCreator<AppState, [], [], Actions> = (set) => ({
  addProfile: (p) =>
    set((s) => ({ profiles: { byId: { ...s.profiles.byId, [p.id]: p }, order: [...s.profiles.order, p.id] } })),
  updateProfile: (id, patch) =>
    set((s) => {
      const p = s.profiles.byId[id];
      return p ? { profiles: { ...s.profiles, byId: { ...s.profiles.byId, [id]: { ...p, ...patch } } } } : {};
    }),
  updateIntake: (id, patch) =>
    set((s) => {
      const p = s.profiles.byId[id];
      if (!p) return {};
      return { profiles: { ...s.profiles, byId: { ...s.profiles.byId, [id]: { ...p, intake: { ...p.intake, ...patch } } } } };
    }),
  // Histories never mix: deleting a profile removes everything scoped to it (F06 M-6.5).
  deleteProfile: (id) =>
    set((s) => {
      if (id === SELF_PROFILE_ID) return {};
      const byId = { ...s.profiles.byId };
      delete byId[id];
      const plan90 = { ...s.plan90 };
      delete plan90[id];
      const activeByProfile = { ...s.conversations.activeByProfile };
      delete activeByProfile[id];
      const followUp = { ...s.notifications.followUp };
      delete followUp[id];
      return {
        profiles: { byId, order: s.profiles.order.filter((x) => x !== id) },
        activeProfileId: s.activeProfileId === id ? SELF_PROFILE_ID : s.activeProfileId,
        conversations: { byId: without(s.conversations.byId, id), activeByProfile },
        labs: { reportsById: without(s.labs.reportsById, id) },
        notes: { byId: without(s.notes.byId, id) },
        plan90,
        booking: { bookings: s.booking.bookings.filter((b) => b.profileId !== id) },
        notifications: {
          ...s.notifications,
          followUp,
          queue: s.notifications.queue.filter((n) => n.deepLink !== `followup:${id}`),
        },
      };
    }),
});
