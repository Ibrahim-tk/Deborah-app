import type { StateCreator } from 'zustand';
import { consentDoc } from '../../data';
import { addDays, nowFrom } from '../../utils/dates';
import { uid } from '../../utils/ids';
import { SELF_PROFILE_ID } from '../defaults';
import type { AppState, SessionSlice } from '../types';

type Actions = Pick<
  SessionSlice,
  | 'setName'
  | 'acceptConsent'
  | 'switchProfile'
  | 'advanceClock'
  | 'setPermission'
  | 'setLocked'
  | 'snoozeFollowUp'
  | 'createAccount'
  | 'restoreAccount'
  | 'requestDeepLink'
  | 'clearDeepLink'
>;

/** "maria@icloud.com" → "Maria". */
const nameFromEmail = (email: string) => {
  const local = email.split('@')[0].split(/[._-]/)[0] ?? '';
  return local ? local[0].toUpperCase() + local.slice(1) : 'Friend';
};

export const sessionActions: StateCreator<AppState, [], [], Actions> = (set, get) => ({
  // Setting the name also creates (or renames) the account holder's own profile.
  setName: (name) =>
    set((s) => {
      const now = nowFrom(s).toISOString();
      const existing = s.profiles.byId[SELF_PROFILE_ID];
      const self = existing
        ? { ...existing, name }
        : { id: SELF_PROFILE_ID, name, relationship: 'self' as const, intake: { conditions: [], medications: [] }, createdAt: now };
      return {
        userName: name,
        activeProfileId: s.activeProfileId || SELF_PROFILE_ID,
        profiles: {
          byId: { ...s.profiles.byId, [SELF_PROFILE_ID]: self },
          order: s.profiles.order.includes(SELF_PROFILE_ID) ? s.profiles.order : [SELF_PROFILE_ID, ...s.profiles.order],
        },
      };
    }),
  acceptConsent: (version) => set((s) => ({ consentAcceptedAt: nowFrom(s).toISOString(), consentVersion: version })),
  switchProfile: (id) => set({ activeProfileId: id }),
  advanceClock: (days) => {
    const s = get();
    set({ simulatedNow: addDays(nowFrom(s).toISOString(), days), clockAnchor: Date.now() });
    get().deliverDue();
  },
  setPermission: (notificationPermission) => set({ notificationPermission }),
  setLocked: (isLocked) => set({ isLocked }),
  snoozeFollowUp: (followUpSnoozeUntil) => set({ followUpSnoozeUntil }),
  createAccount: (email) => set({ accountId: uid('acct'), accountEmail: email }),
  restoreAccount: (email) => {
    if (!get().userName) get().setName(nameFromEmail(email));
    set((s) => ({
      accountId: uid('acct'),
      accountEmail: email,
      consentAcceptedAt: s.consentAcceptedAt ?? nowFrom(s).toISOString(),
      consentVersion: s.consentVersion ?? consentDoc.version,
      // ASSUMPTION: the restored account has an active Individual plan (S11 world).
      plan: s.plan === 'trial' ? 'individual' : s.plan,
      renewsAt: s.renewsAt ?? addDays(nowFrom(s).toISOString(), 30),
      limitReachedPending: false,
    }));
  },
  requestDeepLink: (link) => set((s) => ({ deepLink: { link, nonce: (s.deepLink?.nonce ?? 0) + 1 } })),
  clearDeepLink: () => set({ deepLink: undefined }),
});
