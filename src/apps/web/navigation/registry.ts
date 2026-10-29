/**
 * Screen registry: screen ID → component + presentation meta (docs/04-navigation.md §3).
 * Mirrored by docs/xref.md. A future `planned` entry renders the Planned placeholder until built.
 */
import { lazy } from 'react';
import type { ScreenMeta } from './types';

const FIGMA = 'https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=';

export const registry: Record<string, ScreenMeta> = {
  // F01 Onboarding
  'M-1.0': { title: 'Hero', component: lazy(() => import('@web/screens/onboarding/Hero')), presentation: 'root', stack: 'preauth', figma: '', spec: 'web guest-chat onboarding' },
  'M-1.1': { title: 'Splash', component: lazy(() => import('@web/screens/onboarding/Splash')), presentation: 'root', stack: 'preauth', statusBar: 'light', figma: `${FIGMA}47-184`, spec: 'docs/ux/F01-onboarding.md#m-11--splash' },
  'M-1.11': { title: 'Your name', component: lazy(() => import('@web/screens/onboarding/AskName')), presentation: 'sheet', detent: 'medium', dismissible: false, stack: 'preauth', figma: '', spec: 'web guest-chat onboarding' },
  'M-1.2': { title: 'Welcome', component: lazy(() => import('@web/screens/onboarding/Welcome')), presentation: 'root', stack: 'preauth', figma: `${FIGMA}47-184`, spec: 'docs/ux/F01-onboarding.md#m-12--welcome' },
  'M-1.3': { title: 'Before we begin', component: lazy(() => import('@web/screens/onboarding/Consent')), presentation: 'push', stack: 'preauth', figma: `${FIGMA}47-184`, spec: 'docs/ux/F01-onboarding.md#m-13--before-we-begin-consent' },
  'M-1.4': { title: 'Create profile', component: lazy(() => import('@web/screens/onboarding/CreateProfile')), presentation: 'push', stack: 'preauth', figma: '', spec: 'docs/ux/F01-onboarding.md (OPEN: add M-1.4)' },
  'M-1.5': { title: 'Terms / Privacy', component: lazy(() => import('@web/screens/onboarding/LegalSheet')), presentation: 'sheet', detent: 'medium', dismissible: true, stack: 'preauth', figma: '', spec: 'docs/ux/F01-onboarding.md (OPEN: add M-1.5)' },
  'M-1.8': { title: 'Health basics', component: lazy(() => import('@web/screens/onboarding/HealthBasics')), presentation: 'push', stack: 'preauth', figma: '', spec: 'docs/ux/F01-onboarding.md (OPEN: add M-1.8)' },
  'M-1.10': { title: 'Ask an adult', component: lazy(() => import('@web/screens/onboarding/AskParent')), presentation: 'sheet', detent: 'medium', dismissible: false, figma: '', spec: 'docs/ux/F01-onboarding.md#m-110--ask-a-parent' },
  'M-1.9': { title: "Deborah's welcome", component: lazy(() => import('@web/screens/onboarding/DeborahWelcome')), presentation: 'push', stack: 'preauth', figma: '', spec: 'docs/ux/F01-onboarding.md (OPEN: add M-1.9)' },

  // F02 Consultation
  // Ask tab root: Home dashboard. Chat (M-2.1) pushes on top.
  'M-2.0': { title: 'Home', component: lazy(() => import('@web/screens/consultation/Home')), presentation: 'tabRoot', tab: 'ask', stack: 'main', figma: '', spec: 'docs/ux/F02-consultation.md#m-20-home' },
  // Ask Deborah (Tone Guide dummy scripts via suggestions.json → Conversation).
  // Premade JSON flows stay on M-2.12 (FirstConsult) for lab/State menu only.
  'M-2.1': { title: 'Conversation', component: lazy(() => import('@web/screens/consultation/Conversation')), presentation: 'push', stack: 'main', figma: `${FIGMA}48-361`, spec: 'docs/ux/F02-consultation.md#m-21-conversation' },
  'M-2.7': { title: 'Shop', component: lazy(() => import('@web/screens/consultation/InAppShop')), presentation: 'modal', figma: `${FIGMA}48-361`, spec: 'docs/ux/F02-consultation.md#m-27--shop-in-app-browser' },
  'M-2.8': { title: 'Follow-up opt-in', component: lazy(() => import('@web/screens/consultation/FollowUpOptIn')), presentation: 'sheet', detent: 'medium', dismissible: true, figma: `${FIGMA}48-361`, spec: 'docs/ux/F02-consultation.md#m-28--follow-up-opt-in' },
  'M-2.9': { title: 'Scan a label', component: lazy(() => import('@web/screens/consultation/ScanLabel')), presentation: 'sheet', closeButton: true, detent: 'large', dismissible: true, figma: '', spec: 'intake V2 brief §3 Step E (OPEN: add to ux/F02)' },
  'M-2.11': { title: 'Profile question', component: lazy(() => import('@web/screens/consultation/ProfileQuestion')), presentation: 'sheet', detent: 'medium', dismissible: true, figma: '', spec: 'intake V2 brief §4 (OPEN: add to ux/F02)' },
  'M-2.13': { title: 'What the Oracle noted', component: lazy(() => import('@web/screens/consultation/ReviewFacts')), presentation: 'push', figma: '', spec: 'docs/ux/F02b-profile-aware-chat-intake.md#review-and-confirm' },
  'M-2.14': { title: 'Complete Intake', component: lazy(() => import('@web/screens/consultation/CompleteIntake')), presentation: 'push', figma: '', spec: 'Client discovery 2026-10-16 (placeholder sections)' },
  'M-2.12': { title: 'First consultation', component: lazy(() => import('@web/screens/consultation/FirstConsult')), presentation: 'push', figma: '', spec: 'data/conversation/flows/firstConsult.json (OPEN: add to ux/F02)' },
  'M-2.15': { title: 'Terms updated', component: lazy(() => import('@web/screens/account/PolicyUpdate')), presentation: 'modal', dismissible: false, figma: '', spec: 'Client discovery 2026-10-16 re-consent' },

  // F04 Free limit, plans & account
  'M-4.1': { title: 'Free limit', component: lazy(() => import('@web/screens/plans/FreeLimit')), presentation: 'sheet', detent: 'medium', dismissible: false, figma: `${FIGMA}49-353`, spec: 'docs/ux/F04-plans-account.md#m-41--free-limit-reached' },
  'M-4.2': { title: 'Choose your plan', component: lazy(() => import('@web/screens/plans/ChoosePlan')), presentation: 'push', figma: `${FIGMA}49-353`, spec: 'docs/ux/F04-plans-account.md#m-42--choose-your-plan' },
  // Guest auth stays a sheet; Create account is a push page on the tab stack.
  'M-4.0': { title: 'Sign in or sign up', component: lazy(() => import('@web/screens/plans/GuestAuth')), presentation: 'sheet', detent: 'medium', dismissible: true, closeButton: false, figma: '', spec: 'web guest-chat onboarding' },
  'M-4.3': { title: 'Create account', component: lazy(() => import('@web/screens/plans/CreateAccount')), presentation: 'push', figma: `${FIGMA}49-353`, spec: 'docs/ux/F04-plans-account.md#m-43--save-your-health-history-create-account--sign-in' },
  'M-4.4': { title: 'Store payment', component: lazy(() => import('@web/screens/plans/StorePayment')), presentation: 'sheet', detent: 'medium', dismissible: true, figma: `${FIGMA}49-353`, spec: 'docs/ux/F04-plans-account.md#m-44--store-payment-simulated' },
  'M-4.5': { title: 'You’re all set', component: lazy(() => import('@web/screens/plans/PlanSuccess')), presentation: 'push', statusBar: 'light', figma: `${FIGMA}49-353`, spec: 'docs/ux/F04-plans-account.md#m-45--youre-all-set' },

  // F05 Follow-up & labs (M-5.1 lock screen lives in shell/device/LockScreen)

  // F06 Family profiles
  'M-6.1': { title: 'Profile switcher', component: lazy(() => import('@web/screens/profiles/ProfileSwitcher')), presentation: 'sheet', closeButton: true, detent: 'medium', dismissible: true, figma: `${FIGMA}50-203`, spec: 'docs/ux/F06-family-profiles.md#m-61--profile-switcher' },
  'M-6.2': { title: 'Add family member', component: lazy(() => import('@web/screens/profiles/AddMember')), presentation: 'push', figma: `${FIGMA}50-203`, spec: 'docs/ux/F06-family-profiles.md#m-62--add-family-member' },
  'M-6.3': { title: 'Upgrade to Family', component: lazy(() => import('@web/screens/profiles/UpgradeFamily')), presentation: 'sheet', detent: 'medium', dismissible: true, figma: `${FIGMA}50-203`, spec: 'docs/ux/F06-family-profiles.md#m-63--upgrade-to-family' },
  'M-6.5': { title: 'Profile', component: lazy(() => import('@web/screens/profiles/ProfileDetails')), presentation: 'push', figma: `${FIGMA}50-203`, spec: 'docs/ux/F06-family-profiles.md#m-65--profile-details' },
  'M-6.6': { title: 'Family profiles', component: lazy(() => import('@web/screens/profiles/ManageProfiles')), presentation: 'push', figma: '', spec: 'docs/ux/F06-family-profiles.md#m-66--manage-profiles-not-in-wireframes' },

  // F07 My Health hub (M-7.1 is the hub's empty state)
  'M-7.2': { title: 'My Health', component: lazy(() => import('@web/screens/myhealth/MyHealthHub')), presentation: 'tabRoot', tab: 'health', stack: 'main', figma: `${FIGMA}52-280`, spec: 'docs/ux/F07-my-health-hub.md#m-72--my-health-hub' },
  'M-7.3': { title: 'Your Wellness Plan', component: lazy(() => import('@web/screens/myhealth/NinetyDayPlan')), presentation: 'push', figma: `${FIGMA}52-280`, spec: 'docs/ux/F07-my-health-hub.md#m-73--your-90-day-plan' },
  'M-7.4': { title: 'For you', component: lazy(() => import('@web/screens/myhealth/ContentDetail')), presentation: 'push', figma: `${FIGMA}52-280`, spec: 'docs/ux/F07-my-health-hub.md#m-74--for-you-content-detail' },
  'M-7.5': { title: 'The Oracle’s library', component: lazy(() => import('@web/screens/myhealth/Library')), presentation: 'push', figma: `${FIGMA}52-280`, spec: 'docs/ux/F07-my-health-hub.md#m-75--deborahs-library' },
  'M-7.6': { title: 'About the Oracle', component: lazy(() => import('@web/screens/myhealth/AboutDeborah')), presentation: 'push', figma: `${FIGMA}52-280`, spec: 'docs/ux/F07-my-health-hub.md#m-76--about-deborah' },
  'M-7.8': { title: 'Edit health profile', component: lazy(() => import('@web/screens/myhealth/EditHealthSection')), presentation: 'push', figma: '', spec: 'Design request 2026-10-20 (OPEN: add to docs/ux/F07)' },
  'M-7.7': { title: 'Edit health detail', component: lazy(() => import('@web/screens/myhealth/EditHealthDetail')), presentation: 'push', figma: '', spec: 'Design request 2026-10-20 (OPEN: add to docs/ux/F07)' },

  // F08 Book Deborah
  'M-8.2': { title: 'Book a consultation', component: lazy(() => import('@web/screens/booking/BookingInfo')), presentation: 'push', figma: `${FIGMA}50-470`, spec: 'docs/ux/F08-book-deborah.md#m-82--consult-with-deborah' },
  'M-8.3': { title: 'Pick a time', component: lazy(() => import('@web/screens/booking/Scheduler')), presentation: 'push', figma: `${FIGMA}50-470`, spec: 'docs/ux/F08-book-deborah.md#m-83--pick-a-time-simulated-scheduler' },
  'M-8.4': { title: 'Booking confirmed', component: lazy(() => import('@web/screens/booking/BookingConfirmed')), presentation: 'push', figma: `${FIGMA}50-470`, spec: 'docs/ux/F08-book-deborah.md#m-84--booking-confirmed' },

  // F09 Records (tab bar stays visible on the records list)
  'M-9.1': { title: 'My Visit Notes', component: lazy(() => import('@web/screens/records/Records')), presentation: 'push', tabBar: true, figma: `${FIGMA}50-598`, spec: 'docs/ux/F09-records.md#m-91--records' },
  'M-9.2': { title: 'Consultation', component: lazy(() => import('@web/screens/records/ConsultationDetail')), presentation: 'push', figma: `${FIGMA}50-598`, spec: 'docs/ux/F09-records.md#m-92--consultation-detail' },
  'M-9.4': { title: 'Note', component: lazy(() => import('@web/screens/records/NoteEditor')), presentation: 'push', figma: '', spec: 'docs/ux/F09-records.md#m-94--note-editor-not-in-wireframes' },
  'M-9.6': { title: 'PDF preview', component: lazy(() => import('@web/screens/records/PdfPreview')), presentation: 'push', figma: '', spec: 'docs/ux/F09-records.md#m-96--pdf-preview-not-in-wireframes' },
  'M-9.7': { title: 'My Visit Notes', component: lazy(() => import('@web/screens/records/VisitBrief')), presentation: 'push', figma: '', spec: 'docs/ux/F09b-visit-brief.md' },
  'M-9.10': { title: 'New note', component: lazy(() => import('@web/screens/records/MyVisitNote')), presentation: 'push', figma: '', spec: 'Design request 2026-10-20 (OPEN: add to docs/ux/F09)' },
  'M-9.9': { title: 'Log your visit', component: lazy(() => import('@web/screens/records/VisitLog')), presentation: 'push', figma: '', spec: 'Design request 2026-10-20 (OPEN: add to docs/ux/F09)' },
  'M-9.8': { title: 'Log your visit', component: lazy(() => import('@web/screens/records/LogVisit')), presentation: 'push', figma: '', spec: 'docs/ux/F09c-log-visit.md#m-98--log-your-visit' },

  // F11 Documents and reports — OPEN: planned = phases of docs/planning/documents-reports-plan-2026-10-19.md (not docs/11-build-plan.md).
  'M-11.2': { title: 'Document', component: lazy(() => import('@web/screens/documents/DocumentPreview')), presentation: 'push', figma: '', spec: 'docs/ux/F11-documents.md#m-112--document-preview' },

  // F10 Account, privacy & data
  'M-10.1': { title: 'Settings', component: lazy(() => import('@web/screens/account/Account')), presentation: 'tabRoot', tab: 'account', stack: 'main', figma: `${FIGMA}50-695`, spec: 'docs/ux/F10-account-privacy.md#m-101--account' },
  'M-10.2': { title: 'Privacy & data', component: lazy(() => import('@web/screens/account/PrivacyData')), presentation: 'push', figma: `${FIGMA}50-695`, spec: 'docs/ux/F10-account-privacy.md#m-102--privacy--data' },
  'M-10.3': { title: 'Subscription', component: lazy(() => import('@web/screens/account/Subscription')), presentation: 'push', figma: '', spec: 'docs/ux/F10-account-privacy.md#m-103--subscription-not-in-wireframes' },
  'M-10.4': { title: 'Notification settings', component: lazy(() => import('@web/screens/account/Notifications')), presentation: 'push', figma: '', spec: 'docs/ux/F10-account-privacy.md#m-104--notifications-not-in-wireframes' },
  // Modal everywhere (opened read-only from M-1.3 too); same component per the spec.
  'M-10.6': { title: 'Notifications', component: lazy(() => import('@web/screens/account/NotificationInbox')), presentation: 'push', figma: '', spec: 'docs/ux/F10-account-privacy.md' },
  'M-10.5': { title: 'Terms & disclaimer', component: lazy(() => import('@web/screens/account/Legal')), presentation: 'push', figma: '', spec: 'docs/ux/F10-account-privacy.md#m-105--terms--disclaimer-not-in-wireframes' },
  'M-10.7': { title: 'Change password', component: lazy(() => import('@web/screens/account/ChangePassword')), presentation: 'push', figma: '', spec: 'docs/ux/F10-account-privacy.md (OPEN: add M-10.7)' },
};

export const TAB_ROOTS = { ask: 'M-2.0', health: 'M-7.2', account: 'M-10.1' } as const;

export function meta(id: string): ScreenMeta | undefined {
  return registry[id];
}
