/** Store shape (docs/05-state-and-scenarios.md §1). One slice interface per concern. */
import type {
  AppNotification,
  Billing,
  Booking,
  ContentStatus,
  Conversation,
  ID,
  Intake,
  LabReport,
  Message,
  Note,
  NoteKind,
  NotificationPermission,
  PendingFact,
  Plan90,
  PlanTier,
  Profile,
} from '../types/domain';
import type { HealthProfile, IntakeProgress } from '../types/health';
import type { ScenarioStart } from '../types/scenario';

export interface SessionSlice {
  userName: string;
  accountId?: string;
  /** Shown on the store sheet's account row (M-4.4). */
  accountEmail?: string;
  /** Optional at sign-up (F01 step 4). */
  accountLastName?: string;
  /** Best contact phone — manual outreach only (no OTP/SMS). */
  accountPhoneCountry?: string;
  accountPhoneNumber?: string;
  consentAcceptedAt?: string;
  consentVersion?: string;
  /** Consent to process health data, asked in chat the first time it asks about health (F01). */
  healthConsentAt?: string;
  /** "Not a substitute for professional care" line above the first chat; shown once. */
  disclaimerSeenAt?: string;
  /** Deep-link attribution captured silently at launch (genesis-gold | newsletter | social | direct). */
  referralSource?: string;
  /** Welcome "Get started": agreeing to Terms and Privacy Policy. */
  termsAcceptedAt?: string;
  isGenesisGoldCustomer?: boolean;
  activeProfileId: ID;
  isLocked: boolean;
  simulatedNow: string;
  clockAnchor: number;
  notificationPermission: NotificationPermission;
  /** M-2.8 is offered when the answered count reaches this (1 = first answer; "Not now" adds 3). */
  followUpSnoozeUntil: number;
  setName: (name: string) => void;
  acceptConsent: (version: string) => void;
  acceptHealthConsent: () => void;
  dismissDisclaimer: () => void;
  switchProfile: (id: ID) => void;
  advanceClock: (days: number) => void;
  setPermission: (p: NotificationPermission) => void;
  setLocked: (locked: boolean) => void;
  snoozeFollowUp: (untilAnswerCount: number) => void;
  /** M-4.3 create mode: the trial history simply stays with the new account. */
  createAccount: (email: string, lastName?: string) => void;
  /** Optional best-contact phone (country code + national number). */
  setContactPhone: (countryCode: string, number: string) => void;
  /**
   * M-4.3 sign-in mode from Welcome: restores an S11-like world (plan active, consent on file,
   * no history on this device) so Main is reachable (docs/ux/F01-onboarding.md › Sign in).
   */
  restoreAccount: (email: string) => void;
  setReferralSource: (source: string) => void;
  acceptTerms: () => void;
  setGenesisGoldCustomer: (on: boolean) => void;
  /** Sign-in over a guest who already chatted, "Discard": this phone's guest history is dropped. */
  discardGuestData: () => void;
  /**
   * Deep link requested from outside the app (lock screen, notification banner). The mobile
   * navigator consumes it; `nonce` lets the same link fire twice.
   */
  deepLink?: { link: string; nonce: number };
  requestDeepLink: (link: string) => void;
  clearDeepLink: () => void;
}

export interface SubscriptionSlice {
  plan: PlanTier;
  billing: Billing;
  freeConsultationsUsed: number;
  renewsAt?: string;
  /** M-10.3 Cancel: the plan stays active until `renewsAt`, then ends. */
  cancelled?: boolean;
  limitReachedPending: boolean;
  /**
   * Text that hit the free-limit gate (F04 M-4.1). It stays in the composer and is sent after a
   * successful purchase once M-4.5 "Continue my conversation" sets `release`.
   */
  heldMessage?: { text: string; scriptId?: string; release?: boolean };
  purchase: (plan: PlanTier, billing: Billing) => void;
  cancelSubscription: () => void;
  holdMessage: (text: string, scriptId?: string) => void;
  releaseHeld: () => void;
  clearHeld: () => void;
  /** M-4.1 shown (or "Maybe later"): the post-answer prompt is no longer pending. */
  dismissLimit: () => void;
}

export interface ProfilesSlice {
  profiles: { byId: Record<ID, Profile>; order: ID[] };
  addProfile: (p: Profile) => void;
  updateProfile: (id: ID, patch: Partial<Profile>) => void;
  updateIntake: (id: ID, patch: Partial<Intake>) => void;
  /**
   * Intake V2: merge health fields (each with source + updatedAt). Ignored until health-data
   * consent exists. Mirrors into the legacy profile/intake fields so the engine's safety gates see them.
   */
  setHealth: (id: ID, patch: Partial<HealthProfile>) => void;
  setIntakeProgress: (id: ID, patch: Partial<IntakeProgress>) => void;
  /** Deletes the profile and all of its data; switches to self if it was active (M-6.5). */
  deleteProfile: (id: ID) => void;
}

export interface ConversationsSlice {
  conversations: { byId: Record<ID, Conversation>; activeByProfile: Record<ID, ID | undefined> };
  startConversation: (c: Conversation) => void;
  appendMessage: (conversationId: ID, m: Message) => void;
  patchMessage: (conversationId: ID, messageId: ID, patch: Partial<Message>) => void;
  removeMessage: (conversationId: ID, messageId: ID) => void;
  setConversation: (conversationId: ID, patch: Partial<Conversation>) => void;
  setActiveConversation: (profileId: ID, conversationId: ID | undefined) => void;
  /** Archive the active conversation (kept in records) and show the empty state. */
  archiveActive: (profileId: ID) => void;
  completeConsultation: (conversationId: ID) => void;
  /** DN-13 Review and Confirm: facts noted in a conversation wait here; only confirm writes the profile. */
  proposeFacts: (conversationId: ID, facts: PendingFact[]) => void;
  /** Saves these facts to the conversation's profile (with where they came from); the rest stay pending. */
  confirmFacts: (conversationId: ID, factIds: ID[]) => void;
  /** "Don't save": these facts are dropped and never reach the profile. */
  discardFacts: (conversationId: ID, factIds: ID[]) => void;
  /** Edit before confirming: replaces the fact's value and patch. */
  editFact: (conversationId: ID, factId: ID, change: Pick<PendingFact, 'value' | 'patch'>) => void;
}

export interface LabsSlice {
  labs: { reportsById: Record<ID, LabReport> };
  addReport: (r: LabReport) => void;
  updateValue: (reportId: ID, valueId: ID, value: string) => void;
  confirmReport: (reportId: ID) => void;
  /** M-5.4 edit mode from M-9.5: replace values and metadata. */
  replaceReport: (r: LabReport) => void;
  deleteReport: (reportId: ID) => void;
}

export interface Plan90Slice {
  plan90: Record<ID, Plan90 | undefined>;
  createPlanFromAnswer: (profileId: ID, goal: string, habits: string[], productId?: ID, status?: ContentStatus) => void;
  toggleHabit: (profileId: ID, habitId: ID, date: string) => void;
  removeHabit: (profileId: ID, habitId: ID) => void;
}

export interface NotesSlice {
  notes: { byId: Record<ID, Note> };
  addNote: (n: Note) => void;
  updateNote: (id: ID, patch: Partial<Note>) => void;
  deleteNote: (id: ID) => void;
  /** Append a line to the profile's note of this kind, creating it if needed. */
  appendToNote: (profileId: ID, kind: NoteKind, title: string, line: string) => void;
}

export interface NotificationsSlice {
  notifications: {
    queue: AppNotification[];
    followUp: Record<ID, { enabled: boolean; intervalDays: number } | undefined>;
    /** M-10.4 Booking reminders toggle (default on). */
    bookingReminders: boolean;
  };
  scheduleNotification: (n: AppNotification) => void;
  /** After guidance when permission already granted — default ~14 days (Miro Step 4). */
  scheduleGuidanceFollowUp: (profileId: ID, days: number) => void;
  /** State menu › Deliver follow-up notification: generic text, active profile, delivered now. */
  deliverFollowUpNow: () => void;
  deliverDue: () => void;
  markRead: (id: ID) => void;
  setFollowUp: (profileId: ID, enabled: boolean, intervalDays: number) => void;
  /** Off also removes queued (undelivered) booking reminders. */
  setBookingReminders: (on: boolean) => void;
  /** Remove queued (undelivered) notifications for a deep link, e.g. `followup:<profileId>` (M-10.4). */
  cancelNotifications: (deepLink: string) => void;
  /** State menu › Booking reminder: `booking:<id>` for the next booking, delivered now. Returns false if none. */
  deliverBookingReminderNow: () => boolean;
}

export interface BookingSlice {
  booking: { bookings: Booking[] };
  /** Also schedules a generic reminder 1 day before (if booking reminders are on). */
  book: (b: Booking) => void;
  cancelBooking: (id: ID) => void;
}

export interface SettingsSlice {
  settings: { theme: 'light'; textSize: 0.9 | 1 | 1.15 | 1.3; dataExportRequestedAt?: string };
  setTextSize: (size: SettingsSlice['settings']['textSize']) => void;
  requestExport: () => void;
  /** M-10.1 Sign out: local data is cleared (prototype); the account "keeps" it. */
  signOut: () => void;
  /** M-10.2 Delete my account and all data: wipes the store → onboarding. */
  deleteAccount: () => void;
}

/** Scenario bookkeeping: the navigator watches `loadNonce` to reset itself to `start`. */
export interface MetaSlice {
  scenario: { id: string; start: ScenarioStart; loadNonce: number };
}

/** QA aids a scenario can switch on (S13 Safety test bench). */
export interface QaSlice {
  qa: {
    safetyBench: boolean;
    /** Simulated care-team notifications (emergency / crisis). Demo only. */
    teamAlerts: { level: 'emergency' | 'crisis'; at: string; conversationId: string; phrase?: string }[];
  };
}

/** Dev flags mirrored from the shell; never persisted. */
export interface DevSlice {
  dev: { speed: 'normal' | 'slow' | 'instant'; failNext: boolean };
  setDev: (patch: Partial<DevSlice['dev']>) => void;
}

export type AppState = SessionSlice &
  SubscriptionSlice &
  ProfilesSlice &
  ConversationsSlice &
  LabsSlice &
  Plan90Slice &
  NotesSlice &
  NotificationsSlice &
  BookingSlice &
  SettingsSlice &
  MetaSlice &
  QaSlice &
  DevSlice;

/** The data part of the store (no actions); what scenarios seed. */
export type AppData = {
  [K in keyof AppState as AppState[K] extends (...args: never[]) => unknown ? never : K]: AppState[K];
};
