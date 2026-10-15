/** Default app data = scenario S01 "New user — first launch" (empty store). */
import type { AppData } from './types';

export const SELF_PROFILE_ID = 'p-self';

export function createDefaults(now: string = new Date().toISOString()): AppData {
  return {
    userName: '',
    activeProfileId: SELF_PROFILE_ID,
    isLocked: false,
    simulatedNow: now,
    clockAnchor: Date.now(),
    notificationPermission: 'unknown',
    followUpSnoozeUntil: 1,
    plan: 'trial',
    billing: 'monthly',
    freeConsultationsUsed: 0,
    limitReachedPending: false,
    profiles: { byId: {}, order: [] },
    conversations: { byId: {}, activeByProfile: {} },
    labs: { reportsById: {} },
    plan90: {},
    notes: { byId: {} },
    notifications: { queue: [], followUp: {}, bookingReminders: true },
    booking: { bookings: [] },
    settings: { theme: 'light', textSize: 1 },
    scenario: { id: 'S01', start: { kind: 'screen', root: 'preauth', stack: ['M-1.1'] }, loadNonce: 0 },
    qa: { safetyBench: false },
    dev: { speed: 'normal', failNext: false },
  };
}
