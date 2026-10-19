import type { StateCreator } from 'zustand';
import { FLAGS } from '../../flags';
import { SELF_PROFILE_ID } from '../defaults';
import type { AppState, ProfilesSlice } from '../types';

import type { HealthProfile } from '../../types/health';
import type { Intake, Profile } from '../../types/domain';
import { ageBandFor } from '../../engine/profile';
import { nowFrom } from '../../utils/dates';

type Actions = Pick<ProfilesSlice, 'addProfile' | 'updateProfile' | 'updateIntake' | 'deleteProfile' | 'setHealth' | 'setIntakeProgress'>;

/** Legacy fields the conversation engine reads (safety gates, product rules), kept in step with V2. */
function mirror(h: HealthProfile, now: Date): { profile: Partial<Profile>; intake: Partial<Intake> } {
  const none = (xs: unknown[] | undefined) => (xs && xs.length === 0 ? ['none'] : undefined);
  const intake: Partial<Intake> = {};
  if (h.birthYear) intake.ageBand = ageBandFor(now.getFullYear() - h.birthYear.value);
  if (h.medications) intake.medications = none(h.medications.value) ?? h.medications.value.map((m) => m.name);
  if (h.allergies) intake.allergies = none(h.allergies.value) ?? h.allergies.value.map((a) => a.substance);
  if (h.conditions) intake.conditions = none(h.conditions.value) ?? h.conditions.value.map((c) => c.name);
  if (h.heightCm) intake.height = `${h.heightCm.value} cm`;
  if (h.weightKg) intake.weight = `${h.weightKg.value} kg`;
  if (h.country) intake.country = h.country.value;
  return { profile: h.sexAtBirth ? { sexAtBirth: h.sexAtBirth.value } : {}, intake };
}

/** Keep only the entries of a record whose value doesn't belong to `profileId`. */
const without = <T extends { profileId: string }>(byId: Record<string, T>, profileId: string) =>
  Object.fromEntries(Object.entries(byId).filter(([, v]) => v.profileId !== profileId));

export const profilesActions: StateCreator<AppState, [], [], Actions> = (set) => ({
  setHealth: (id, patch) =>
    set((s) => {
      const p = s.profiles.byId[id];
      // Health data is stored only after explicit consent (or the prototype skip flag).
      if (!p || !(FLAGS.skipHealthConsent || s.healthConsentAt)) return {};
      const health = { ...p.health, ...patch };
      const m = mirror(health, nowFrom(s));
      const next = { ...p, ...m.profile, health, intake: { ...p.intake, ...m.intake } };
      return { profiles: { ...s.profiles, byId: { ...s.profiles.byId, [id]: next } } };
    }),
  setIntakeProgress: (id, patch) =>
    set((s) => {
      const p = s.profiles.byId[id];
      if (!p) return {};
      const intakeV2 = { step: 'consent' as const, ...p.intakeV2, ...patch };
      return { profiles: { ...s.profiles, byId: { ...s.profiles.byId, [id]: { ...p, intakeV2 } } } };
    }),
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
        documents: { byId: without(s.documents.byId, id) },
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
