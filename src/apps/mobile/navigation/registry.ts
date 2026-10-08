/**
 * Screen registry: screen ID → component + presentation meta (docs/04-navigation.md §3).
 * Mirrored by docs/xref.md. A future `planned` entry renders the Planned placeholder until built.
 */
import { lazy } from 'react';
import type { ScreenMeta } from './types';

const FIGMA = 'https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=';

export const registry: Record<string, ScreenMeta> = {
  // F01 Onboarding
  'M-1.1': { title: 'Splash', component: lazy(() => import('@mobile/screens/onboarding/Splash')), presentation: 'root', stack: 'preauth', statusBar: 'light', figma: `${FIGMA}47-184`, spec: 'docs/ux/F01-onboarding.md#m-11--splash' },
  'M-1.2': { title: 'Welcome', component: lazy(() => import('@mobile/screens/onboarding/Welcome')), presentation: 'root', stack: 'preauth', figma: `${FIGMA}47-184`, spec: 'docs/ux/F01-onboarding.md#m-12--welcome' },
  'M-1.3': { title: 'Before we begin', component: lazy(() => import('@mobile/screens/onboarding/Consent')), presentation: 'push', stack: 'preauth', figma: `${FIGMA}47-184`, spec: 'docs/ux/F01-onboarding.md#m-13--before-we-begin-consent' },

  // F02 Consultation
  'M-2.0': { title: 'Home', component: lazy(() => import('@mobile/screens/consultation/Home')), presentation: 'tabRoot', tab: 'ask', stack: 'main', figma: '', spec: 'docs/ux/F02-consultation.md#m-20-home' },
  'M-2.1': { title: 'Conversation', component: lazy(() => import('@mobile/screens/consultation/Conversation')), presentation: 'push', figma: `${FIGMA}48-361`, spec: 'docs/ux/F02-consultation.md#m-21-conversation' },
  'M-2.7': { title: 'Shop', component: lazy(() => import('@mobile/screens/consultation/InAppShop')), presentation: 'modal', figma: `${FIGMA}48-361`, spec: 'docs/ux/F02-consultation.md#m-27--shop-in-app-browser' },
  'M-2.8': { title: 'Follow-up opt-in', component: lazy(() => import('@mobile/screens/consultation/FollowUpOptIn')), presentation: 'sheet', detent: 'medium', dismissible: true, figma: `${FIGMA}48-361`, spec: 'docs/ux/F02-consultation.md#m-28--follow-up-opt-in' },

  // F04 Free limit, plans & account
  'M-4.1': { title: 'Free limit', component: lazy(() => import('@mobile/screens/plans/FreeLimit')), presentation: 'sheet', detent: 'medium', dismissible: false, figma: `${FIGMA}49-353`, spec: 'docs/ux/F04-plans-account.md#m-41--free-limit-reached' },
  'M-4.2': { title: 'Choose your plan', component: lazy(() => import('@mobile/screens/plans/ChoosePlan')), presentation: 'modal', figma: `${FIGMA}49-353`, spec: 'docs/ux/F04-plans-account.md#m-42--choose-your-plan' },
  // Pushed inside the plans modal; `open()` presents it as its own modal (sign-in from M-1.2).
  'M-4.3': { title: 'Create account', component: lazy(() => import('@mobile/screens/plans/CreateAccount')), presentation: 'modal', figma: `${FIGMA}49-353`, spec: 'docs/ux/F04-plans-account.md#m-43--save-your-health-history-create-account--sign-in' },
  'M-4.4': { title: 'Store payment', component: lazy(() => import('@mobile/screens/plans/StorePayment')), presentation: 'sheet', detent: 'medium', dismissible: true, figma: `${FIGMA}49-353`, spec: 'docs/ux/F04-plans-account.md#m-44--store-payment-simulated' },
  'M-4.5': { title: 'You’re all set', component: lazy(() => import('@mobile/screens/plans/PlanSuccess')), presentation: 'push', statusBar: 'light', figma: `${FIGMA}49-353`, spec: 'docs/ux/F04-plans-account.md#m-45--youre-all-set' },

  // F05 Follow-up & labs (M-5.1 lock screen lives in shell/device/LockScreen)
  'M-5.3': { title: 'Add lab results', component: lazy(() => import('@mobile/screens/followup/AddLabs')), presentation: 'sheet', detent: 'medium', dismissible: true, figma: `${FIGMA}49-547`, spec: 'docs/ux/F05-followup-labs.md#m-53--add-your-lab-results' },
  'M-5.4': { title: 'Check your results', component: lazy(() => import('@mobile/screens/followup/ConfirmLabs')), presentation: 'modal', figma: `${FIGMA}49-547`, spec: 'docs/ux/F05-followup-labs.md#m-54--check-your-results' },

  // F06 Family profiles
  'M-6.1': { title: 'Profile switcher', component: lazy(() => import('@mobile/screens/profiles/ProfileSwitcher')), presentation: 'sheet', detent: 'medium', dismissible: true, figma: `${FIGMA}50-203`, spec: 'docs/ux/F06-family-profiles.md#m-61--profile-switcher' },
  'M-6.2': { title: 'Add family member', component: lazy(() => import('@mobile/screens/profiles/AddMember')), presentation: 'modal', figma: `${FIGMA}50-203`, spec: 'docs/ux/F06-family-profiles.md#m-62--add-family-member' },
  'M-6.3': { title: 'Upgrade to Family', component: lazy(() => import('@mobile/screens/profiles/UpgradeFamily')), presentation: 'sheet', detent: 'medium', dismissible: true, figma: `${FIGMA}50-203`, spec: 'docs/ux/F06-family-profiles.md#m-63--upgrade-to-family' },
  'M-6.5': { title: 'Profile', component: lazy(() => import('@mobile/screens/profiles/ProfileDetails')), presentation: 'push', figma: `${FIGMA}50-203`, spec: 'docs/ux/F06-family-profiles.md#m-65--profile-details' },
  'M-6.6': { title: 'Family profiles', component: lazy(() => import('@mobile/screens/profiles/ManageProfiles')), presentation: 'push', figma: '', spec: 'docs/ux/F06-family-profiles.md#m-66--manage-profiles-not-in-wireframes' },

  // F07 My Health hub (M-7.1 is the hub's empty state)
  'M-7.2': { title: 'My Health', component: lazy(() => import('@mobile/screens/myhealth/MyHealthHub')), presentation: 'tabRoot', tab: 'health', stack: 'main', figma: `${FIGMA}52-280`, spec: 'docs/ux/F07-my-health-hub.md#m-72--my-health-hub' },
  'M-7.3': { title: 'Your 90-day plan', component: lazy(() => import('@mobile/screens/myhealth/NinetyDayPlan')), presentation: 'push', figma: `${FIGMA}52-280`, spec: 'docs/ux/F07-my-health-hub.md#m-73--your-90-day-plan' },
  'M-7.4': { title: 'For you', component: lazy(() => import('@mobile/screens/myhealth/ContentDetail')), presentation: 'push', figma: `${FIGMA}52-280`, spec: 'docs/ux/F07-my-health-hub.md#m-74--for-you-content-detail' },
  'M-7.5': { title: 'Deborah’s library', component: lazy(() => import('@mobile/screens/myhealth/Library')), presentation: 'push', figma: `${FIGMA}52-280`, spec: 'docs/ux/F07-my-health-hub.md#m-75--deborahs-library' },
  'M-7.6': { title: 'About Deborah', component: lazy(() => import('@mobile/screens/myhealth/AboutDeborah')), presentation: 'push', figma: `${FIGMA}52-280`, spec: 'docs/ux/F07-my-health-hub.md#m-76--about-deborah' },

  // F08 Book Deborah
  'M-8.2': { title: 'Consult with Deborah', component: lazy(() => import('@mobile/screens/booking/BookingInfo')), presentation: 'push', figma: `${FIGMA}50-470`, spec: 'docs/ux/F08-book-deborah.md#m-82--consult-with-deborah' },
  'M-8.3': { title: 'Pick a time', component: lazy(() => import('@mobile/screens/booking/Scheduler')), presentation: 'push', figma: `${FIGMA}50-470`, spec: 'docs/ux/F08-book-deborah.md#m-83--pick-a-time-simulated-scheduler' },
  'M-8.4': { title: 'Booking confirmed', component: lazy(() => import('@mobile/screens/booking/BookingConfirmed')), presentation: 'push', figma: `${FIGMA}50-470`, spec: 'docs/ux/F08-book-deborah.md#m-84--booking-confirmed' },

  // F09 Records (tab bar stays visible on the records list)
  'M-9.1': { title: 'My Health records', component: lazy(() => import('@mobile/screens/records/Records')), presentation: 'push', tabBar: true, figma: `${FIGMA}50-598`, spec: 'docs/ux/F09-records.md#m-91--records' },
  'M-9.2': { title: 'Consultation', component: lazy(() => import('@mobile/screens/records/ConsultationDetail')), presentation: 'push', figma: `${FIGMA}50-598`, spec: 'docs/ux/F09-records.md#m-92--consultation-detail' },
  'M-9.4': { title: 'Note', component: lazy(() => import('@mobile/screens/records/NoteEditor')), presentation: 'modal', figma: '', spec: 'docs/ux/F09-records.md#m-94--note-editor-not-in-wireframes' },
  'M-9.5': { title: 'Lab report', component: lazy(() => import('@mobile/screens/records/LabReport')), presentation: 'push', figma: '', spec: 'docs/ux/F09-records.md#m-95--lab-report-not-in-wireframes' },
  'M-9.6': { title: 'PDF preview', component: lazy(() => import('@mobile/screens/records/PdfPreview')), presentation: 'modal', figma: '', spec: 'docs/ux/F09-records.md#m-96--pdf-preview-not-in-wireframes' },

  // F10 Account, privacy & data
  'M-10.1': { title: 'Settings', component: lazy(() => import('@mobile/screens/account/Account')), presentation: 'tabRoot', tab: 'account', stack: 'main', figma: `${FIGMA}50-695`, spec: 'docs/ux/F10-account-privacy.md#m-101--account' },
  'M-10.2': { title: 'Privacy & data', component: lazy(() => import('@mobile/screens/account/PrivacyData')), presentation: 'push', figma: `${FIGMA}50-695`, spec: 'docs/ux/F10-account-privacy.md#m-102--privacy--data' },
  'M-10.3': { title: 'Subscription', component: lazy(() => import('@mobile/screens/account/Subscription')), presentation: 'push', figma: '', spec: 'docs/ux/F10-account-privacy.md#m-103--subscription-not-in-wireframes' },
  'M-10.4': { title: 'Notifications', component: lazy(() => import('@mobile/screens/account/Notifications')), presentation: 'push', figma: '', spec: 'docs/ux/F10-account-privacy.md#m-104--notifications-not-in-wireframes' },
  // Modal everywhere (opened read-only from M-1.3 too); same component per the spec.
  'M-10.5': { title: 'Terms & disclaimer', component: lazy(() => import('@mobile/screens/account/Legal')), presentation: 'modal', figma: '', spec: 'docs/ux/F10-account-privacy.md#m-105--terms--disclaimer-not-in-wireframes' },
};

export const TAB_ROOTS = { ask: 'M-2.0', health: 'M-7.2', account: 'M-10.1' } as const;

export function meta(id: string): ScreenMeta | undefined {
  return registry[id];
}
