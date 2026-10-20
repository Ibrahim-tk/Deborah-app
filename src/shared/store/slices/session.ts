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
  | 'acceptHealthConsent'
  | 'dismissDisclaimer'
  | 'switchProfile'
  | 'advanceClock'
  | 'setPermission'
  | 'setLocked'
  | 'snoozeFollowUp'
  | 'createAccount'
  | 'setContactPhone'
  | 'restoreAccount'
  | 'setReferralSource'
  | 'acceptTerms'
  | 'setGenesisGoldCustomer'
  | 'discardGuestData'
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
  acceptHealthConsent: () => set((s) => ({ healthConsentAt: s.healthConsentAt ?? nowFrom(s).toISOString() })),
  dismissDisclaimer: () => set((s) => ({ disclaimerSeenAt: s.disclaimerSeenAt ?? nowFrom(s).toISOString() })),
  switchProfile: (id) => set({ activeProfileId: id }),
  advanceClock: (days) => {
    const s = get();
    set({ simulatedNow: addDays(nowFrom(s).toISOString(), days), clockAnchor: Date.now() });
    get().deliverDue();
  },
  setPermission: (notificationPermission) => set({ notificationPermission }),
  setLocked: (isLocked) => set({ isLocked }),
  snoozeFollowUp: (followUpSnoozeUntil) => set({ followUpSnoozeUntil }),
  createAccount: (email, lastName) => set({ accountId: uid('acct'), accountEmail: email, accountLastName: lastName, authFlow: 'signup' }),
  setContactPhone: (countryCode, number) =>
    set({
      accountPhoneCountry: countryCode || undefined,
      accountPhoneNumber: number.trim() || undefined,
    }),
  restoreAccount: (email) => {
    if (!get().userName) get().setName(nameFromEmail(email));
    set((s) => ({
      accountId: uid('acct'),
      accountEmail: email,
      authFlow: 'login',
      consentAcceptedAt: s.consentAcceptedAt ?? nowFrom(s).toISOString(),
      consentVersion: s.consentVersion ?? consentDoc.version,
      // ASSUMPTION: the restored account has an active Individual plan (S11 world).
      plan: s.plan === 'trial' ? 'individual' : s.plan,
      renewsAt: s.renewsAt ?? addDays(nowFrom(s).toISOString(), 30),
      limitReachedPending: false,
    }));
  },
  setReferralSource: (referralSource) => set((s) => (s.referralSource ? {} : { referralSource })),
  acceptTerms: () => set((s) => ({ termsAcceptedAt: s.termsAcceptedAt ?? nowFrom(s).toISOString() })),
  setGenesisGoldCustomer: (isGenesisGoldCustomer) => set({ isGenesisGoldCustomer }),
  discardGuestData: () =>
    set({
      conversations: { byId: {}, activeByProfile: {} },
      labs: { reportsById: {} },
      notes: { byId: {} },
      documents: { byId: {} },
      plan90: {},
      freeConsultationsUsed: 0,
    }),
  requestDeepLink: (link) => set((s) => ({ deepLink: { link, nonce: (s.deepLink?.nonce ?? 0) + 1 } })),
  clearDeepLink: () => set({ deepLink: undefined }),
});
