/**
 * Internal Screens menu (designer request 2026-10-19): every signed-in screen by name, grouped by area,
 * so all the UI can be reviewed directly. Each entry loads the signed-in base world, then opens the
 * screen. Screens that need an id get one from that world (first answered conversation, lab report…).
 * Internal surface only; the client demo keeps "states, not screens" (CLAUDE.md rule 6).
 */
import { libraryItems, productList } from '@shared/data';
import { useAppStore } from '@shared/store';
import type { ScenarioStart } from '@shared/types/scenario';

/** Signed-in subscriber with labs, an answered consultation and a 90-day plan. */
export const BASE_SCENARIO = 'S08';

type Tab = 'ask' | 'health' | 'account';
type P = Record<string, string | number | boolean | undefined>;
type State = ReturnType<typeof useAppStore.getState>;

export interface ScreenEntry {
  id: string;
  name: string;
  tab?: Tab;
  /** Screens under it on its tab (e.g. Records under My Health). */
  under?: string[];
  as: 'root' | 'push' | 'sheet' | 'modal';
  params?: (s: State) => P;
  /** World to load first (default: signed-in BASE_SCENARIO). */
  base?: string;
  /** Before sign-in (onboarding stack). */
  preauth?: boolean;
}

const answered = (s: State) => {
  const conv = Object.values(s.conversations.byId).find((c) => c.messages.some((m) => m.kind === 'answer'));
  const msg = conv?.messages.find((m) => m.kind === 'answer');
  return { conversationId: conv?.id, messageId: msg?.id };
};
const firstDoc = (s: State) => Object.keys(s.documents.byId)[0];
const familyMember = (s: State) => Object.values(s.profiles.byId).find((p) => p.relationship !== 'self')?.id;
const firstReport = (s: State) => Object.keys(s.labs.reportsById)[0];

const ASK = { tab: 'ask' as const, under: ['M-2.0'] };
const HEALTH = { tab: 'health' as const, under: ['M-7.2'] };
const ACCOUNT = { tab: 'account' as const, under: ['M-10.1'] };

export const SCREEN_GROUPS: { title: string; screens: ScreenEntry[] }[] = [
  {
    title: 'Onboarding',
    screens: [
      { id: 'M-1.1', name: 'Splash', as: 'root', preauth: true, base: 'S01' },
      { id: 'M-1.2', name: 'Welcome', as: 'root', preauth: true, base: 'S01' },
      { id: 'M-1.5', name: 'Terms', as: 'sheet', preauth: true, base: 'S01', under: ['M-1.2'], params: () => ({ section: 'terms' }) },
      { id: 'M-1.4', name: 'Create account', as: 'sheet', preauth: true, base: 'S01', under: ['M-1.2'], params: () => ({ first: 'Maria' }) },
      { id: 'M-1.4', name: 'Sign in', as: 'sheet', preauth: true, base: 'S01', under: ['M-1.2'], params: () => ({ mode: 'signin' }) },
      { id: 'M-1.3', name: 'Before we begin', as: 'push', preauth: true, base: 'S01', under: ['M-1.2'] },
      { id: 'M-1.8', name: 'Health basics (intake)', as: 'root', preauth: true, base: 'S03' },
      { id: 'M-1.10', name: 'Ask an adult', as: 'sheet', preauth: true, base: 'S03', under: ['M-1.8'] },
    ],
  },
  {
    title: 'Login module',
    screens: [
      { id: 'M-1.4', name: 'Sign in', as: 'sheet', preauth: true, base: 'S01', under: ['M-1.2'], params: () => ({ mode: 'signin' }) },
      { id: 'M-1.4', name: 'Sign up', as: 'sheet', preauth: true, base: 'S01', under: ['M-1.2'], params: () => ({ first: 'Maria' }) },
      { id: 'M-1.5', name: 'T&C and privacy policy', as: 'sheet', preauth: true, base: 'S01', under: ['M-1.2'], params: () => ({ section: 'terms' }) },
      { id: 'M-1.4', name: '2FA (verification code)', as: 'sheet', preauth: true, base: 'S01', under: ['M-1.2'], params: () => ({ mode: 'signin', stage: 'code' }) },
      { id: 'M-1.4', name: 'Forgot password', as: 'sheet', preauth: true, base: 'S01', under: ['M-1.2'], params: () => ({ mode: 'signin', stage: 'forgot' }) },
      { id: 'M-10.1', name: 'Logout (Settings → Sign out)', tab: 'account', as: 'root' },
      { id: 'M-10.2', name: 'Delete account / revoke consent', ...ACCOUNT, as: 'push' },
      { id: 'M-1.3', name: 'Accept health consent', as: 'push', preauth: true, base: 'S01', under: ['M-1.2'] },
      // OPEN: "Existing Genesis Gold customer indicator" has no screen or spec yet.
    ],
  },
  {
    title: 'Health intake module',
    screens: [
      { id: 'M-1.8', name: 'Myself vs family member', as: 'root', preauth: true, base: 'S03' },
      { id: 'M-1.8', name: 'Basic details', as: 'root', preauth: true, base: 'S03', params: () => ({ start: 'details' }) },
    ],
  },
  {
    title: 'Dashboard',
    screens: [
      { id: 'M-2.0', name: 'Personalized greeting', tab: 'ask', as: 'root' },
      { id: 'M-2.10', name: 'Health profile completion %', ...ASK, as: 'modal' },
      { id: 'M-7.3', name: 'My Healing Plan journey', ...HEALTH, as: 'push' },
      { id: 'M-10.4', name: 'Notifications / reminders', ...ACCOUNT, as: 'push' },
      { id: 'M-6.1', name: 'Profile toggle', ...ASK, as: 'sheet' },
      { id: 'M-2.1', name: 'Ask Deborah CTA', ...ASK, as: 'push' },
      { id: 'M-8.2', name: 'Consult with Deborah', ...HEALTH, as: 'push' },
      { id: 'M-2.1', name: 'What’s next? (after an answer)', ...ASK, as: 'push' },
    ],
  },
  {
    title: 'Home & conversation',
    screens: [
      { id: 'M-2.0', name: 'Home', tab: 'ask', as: 'root' },
      { id: 'M-2.1', name: 'Conversation', ...ASK, as: 'push' },
      { id: 'M-2.12', name: 'First consultation', ...ASK, as: 'push' },
      { id: 'M-2.12', name: 'First chat — Sandra (premade)', ...ASK, as: 'push', params: () => ({ flow: 'sandra' }) },
      { id: 'M-2.14', name: 'Complete intake', ...ASK, as: 'push' },
      { id: 'M-2.10', name: 'Health profile', ...ASK, as: 'modal' },
      { id: 'M-2.13', name: 'What Deborah noted', ...ASK, as: 'sheet', params: (s) => ({ conversationId: answered(s).conversationId }) },
      { id: 'M-2.8', name: 'Follow-up reminder', ...ASK, as: 'sheet' },
      { id: 'M-2.15', name: 'Terms updated', ...ASK, as: 'modal' },
      { id: 'M-2.11', name: 'Profile question', ...ASK, as: 'sheet', params: () => ({ topic: 'lifestyle' }) },
      { id: 'M-2.9', name: 'Scan a label', ...ASK, as: 'sheet', params: () => ({ field: 'medications' }) },
      { id: 'M-2.7', name: 'Shop', ...ASK, as: 'modal', params: () => ({ productId: productList[0]?.id }) },
    ],
  },
  {
    title: 'Plans & payment',
    screens: [
      { id: 'M-4.1', name: 'Free limit reached', ...ASK, as: 'sheet' },
      { id: 'M-4.2', name: 'Choose a plan', ...ASK, as: 'modal' },
      { id: 'M-4.3', name: 'Create account', ...ASK, as: 'modal', params: () => ({ mode: 'create' }) },
      { id: 'M-4.4', name: 'Payment', ...ASK, as: 'sheet' },
      { id: 'M-4.5', name: 'Subscription confirmed', ...ASK, as: 'push' },
    ],
  },
  {
    title: 'Lab results',
    screens: [
      { id: 'M-5.3', name: 'Add lab results', ...ASK, as: 'sheet' },
      { id: 'M-5.4', name: 'Check your results', ...ASK, as: 'modal', params: () => ({ source: 'pdf', fileName: 'Lab report.pdf' }) },
      { id: 'M-9.5', name: 'Lab report', ...HEALTH, as: 'push', params: (s) => ({ reportId: firstReport(s) }) },
    ],
  },
  {
    title: 'My Health',
    screens: [
      { id: 'M-7.2', name: 'My Health', tab: 'health', as: 'root' },
      { id: 'M-7.2', name: 'My Health — empty', tab: 'health', as: 'root', base: 'S11' },
      { id: 'M-7.3', name: 'Healing plan', ...HEALTH, as: 'push' },
      { id: 'M-7.4', name: 'For you', ...HEALTH, as: 'push', params: () => ({ itemId: libraryItems[0]?.id }) },
      { id: 'M-7.5', name: 'Library', ...HEALTH, as: 'push' },
      { id: 'M-7.6', name: 'About Deborah', ...HEALTH, as: 'push' },
      { id: 'M-7.7', name: 'Edit health detail', ...HEALTH, as: 'sheet', params: (s) => ({ profileId: s.activeProfileId, key: 'medications' }) },
    ],
  },
  {
    title: 'Records',
    screens: [
      { id: 'M-9.1', name: 'Records', ...HEALTH, as: 'push' },
      { id: 'M-9.2', name: 'Consultation record', ...HEALTH, as: 'push', params: (s) => ({ conversationId: answered(s).conversationId }) },
      { id: 'M-9.7', name: 'Visit notes', ...HEALTH, as: 'modal', params: (s) => answered(s) },
      { id: 'M-9.6', name: 'PDF preview', ...HEALTH, as: 'modal', params: (s) => answered(s) },
    ],
  },
  {
    title: 'My Visit Notes',
    screens: [
      { id: 'M-9.7', name: 'View provider-ready notes', ...HEALTH, as: 'modal', params: (s) => answered(s) },
      { id: 'M-9.6', name: 'View provider summary', ...HEALTH, as: 'modal', params: (s) => answered(s) },
      { id: 'M-9.6', name: 'Download PDF', ...HEALTH, as: 'modal', params: (s) => answered(s) },
      { id: 'M-9.8', name: 'Log provider visit outcome', tab: 'health', under: ['M-7.2', 'M-9.1'], as: 'sheet' },
      { id: 'M-11.3', name: 'Upload supporting documents after visit', tab: 'health', under: ['M-7.2', 'M-11.1'], as: 'sheet' },
      // OPEN: "AI updates context" and "discuss outcome with Deborah" live inside the log-visit flow, not as screens.
      { id: 'M-9.8', name: 'AI updates context (profile updates on save)', tab: 'health', under: ['M-7.2', 'M-9.1'], as: 'sheet' },
      { id: 'M-9.1', name: 'Discuss outcome with Deborah (Records → Talk first)', ...HEALTH, as: 'push' },
    ],
  },
  {
    title: 'Doc & lab management',
    screens: [
      { id: 'M-11.3', name: 'Upload documents', tab: 'health', under: ['M-7.2', 'M-11.1'], as: 'sheet' },
      { id: 'M-5.4', name: 'OCR / data extraction', ...ASK, as: 'modal', params: () => ({ source: 'pdf', fileName: 'Lab report.pdf' }) },
      { id: 'M-11.2', name: 'Ask Deborah about document', tab: 'health', under: ['M-7.2', 'M-11.1'], as: 'push', params: (s) => ({ documentId: firstDoc(s) }) },
      { id: 'M-5.3', name: 'Type of uploads', ...ASK, as: 'sheet' },
      { id: 'M-11.2', name: 'Preview documents', tab: 'health', under: ['M-7.2', 'M-11.1'], as: 'push', params: (s) => ({ documentId: firstDoc(s) }) },
      { id: 'M-11.2', name: 'Download documents', tab: 'health', under: ['M-7.2', 'M-11.1'], as: 'push', params: (s) => ({ documentId: firstDoc(s) }) },
      { id: 'M-11.2', name: 'Delete documents', tab: 'health', under: ['M-7.2', 'M-11.1'], as: 'push', params: (s) => ({ documentId: firstDoc(s) }) },
      { id: 'M-11.1', name: 'Rename documents (library)', tab: 'health', under: ['M-7.2'], as: 'push' },
    ],
  },
  {
    title: 'Profile management',
    screens: [
      { id: 'M-6.5', name: 'View/edit my profile', ...ACCOUNT, as: 'push', params: (s) => ({ profileId: s.activeProfileId }) },
      { id: 'M-6.6', name: 'View/edit family member profiles', ...ACCOUNT, as: 'push' },
      { id: 'M-10.2', name: 'Delete my account', ...ACCOUNT, as: 'push' },
      { id: 'M-6.5', name: 'Remove family member', ...ACCOUNT, as: 'push', base: 'S08', params: (s) => ({ profileId: familyMember(s) ?? s.activeProfileId }) },
      { id: 'M-6.1', name: 'Toggle active profiles', ...ASK, as: 'sheet' },
      { id: 'M-6.2', name: 'Advocate-only mode (add member)', ...ACCOUNT, as: 'modal' },
      { id: 'M-2.10', name: 'Health profile completion %', ...ASK, as: 'modal' },
      { id: 'M-6.3', name: 'Family member limit (1 + 3)', ...ACCOUNT, as: 'sheet' },
    ],
  },
  {
    title: 'Subscription & billing',
    screens: [
      { id: 'M-10.3', name: 'View current plan', ...ACCOUNT, as: 'push' },
      { id: 'M-4.2', name: 'Upgrade/downgrade plan', ...ASK, as: 'modal' },
      { id: 'M-10.3', name: 'Cancel subscription', ...ACCOUNT, as: 'push' },
      { id: 'M-4.4', name: 'Payment method', ...ASK, as: 'sheet' },
      { id: 'M-10.3', name: 'Billing history', ...ACCOUNT, as: 'push' },
      { id: 'M-4.2', name: 'Renewal disclaimer', ...ASK, as: 'modal' },
      { id: 'M-6.3', name: 'Add-on member (paid)', ...ACCOUNT, as: 'sheet' },
    ],
  },
  {
    title: 'Notifications & reminders',
    screens: [
      { id: 'M-10.4', name: 'Notification types', ...ACCOUNT, as: 'push' },
      { id: 'M-10.4', name: 'Enable/disable notifications', ...ACCOUNT, as: 'push' },
      { id: 'M-2.8', name: 'Follow-up after guidance', ...ASK, as: 'sheet' },
      { id: 'M-10.4', name: '30-day inactivity reminder', ...ACCOUNT, as: 'push' },
      { id: 'M-7.3', name: 'Healing Plan check-in', ...HEALTH, as: 'push' },
      { id: 'M-2.8', name: 'Critical follow-up', ...ASK, as: 'sheet' },
      { id: 'M-2.15', name: 'Re-consent on policy update', ...ASK, as: 'modal' },
    ],
  },
  {
    title: 'Compliances',
    // OPEN: no region-specific screens yet (GDPR, HIPAA, CPRA, PIPEDA, Australian Privacy Act); these open the shared privacy and legal screens.
    screens: [
      { id: 'M-10.2', name: 'Europe GDPR (privacy & data)', ...ACCOUNT, as: 'push' },
      { id: 'M-10.2', name: 'US HIPAA (privacy & data)', ...ACCOUNT, as: 'push' },
      { id: 'M-10.2', name: 'US CPRA (privacy & data)', ...ACCOUNT, as: 'push' },
      { id: 'M-10.5', name: 'Canada PIPEDA (terms)', ...ACCOUNT, as: 'modal' },
      { id: 'M-10.5', name: 'Australia Privacy Act / NDB (terms)', ...ACCOUNT, as: 'modal' },
    ],
  },
  {
    title: 'Healing plan',
    screens: [
      { id: 'M-7.3', name: 'View my Healing Plan', ...HEALTH, as: 'push' },
      { id: 'M-7.3', name: 'Track goals / actions', ...HEALTH, as: 'push' },
      { id: 'M-7.3', name: 'AI updates plan milestones', ...HEALTH, as: 'push' },
    ],
  },
  {
    title: 'Knowledge-driven experience',
    // OPEN: books / protocols / blogs / website have no separate screens; they open Deborah's library.
    screens: [
      { id: 'M-2.1', name: 'Oracle uses approved Deborah content', ...ASK, as: 'push' },
      { id: 'M-7.5', name: 'Books', ...HEALTH, as: 'push' },
      { id: 'M-7.5', name: 'Protocols', ...HEALTH, as: 'push' },
      { id: 'M-7.5', name: 'Blogs', ...HEALTH, as: 'push' },
      { id: 'M-7.6', name: 'Website (About Deborah)', ...HEALTH, as: 'push' },
      { id: 'M-2.1', name: 'Q&A', ...ASK, as: 'push' },
      { id: 'M-2.1', name: 'Knowledge-gap escalation', ...ASK, as: 'push' },
      { id: 'M-2.1', name: 'No open-internet retrieval', ...ASK, as: 'push' },
    ],
  },
  {
    title: 'Booking',
    screens: [
      { id: 'M-8.2', name: 'Consult with Deborah', ...HEALTH, as: 'push' },
      { id: 'M-8.3', name: 'Pick a time', ...HEALTH, as: 'push' },
      { id: 'M-8.4', name: 'Booking confirmed', ...HEALTH, as: 'push', params: (s) => ({ bookingId: s.booking.bookings[0]?.id }) },
    ],
  },
  {
    title: 'Family',
    screens: [
      { id: 'M-6.1', name: 'Profile switcher', ...ASK, as: 'sheet' },
      { id: 'M-6.6', name: 'Family profiles', ...ACCOUNT, as: 'push' },
      { id: 'M-6.5', name: 'Profile', ...ACCOUNT, as: 'push', params: (s) => ({ profileId: s.activeProfileId }) },
      { id: 'M-6.2', name: 'Add family member', ...ACCOUNT, as: 'modal' },
      { id: 'M-6.3', name: 'Upgrade to Family', ...ACCOUNT, as: 'sheet' },
    ],
  },
  {
    title: 'Settings',
    screens: [
      { id: 'M-10.1', name: 'Settings', tab: 'account', as: 'root' },
      { id: 'M-10.2', name: 'Privacy & data', ...ACCOUNT, as: 'push' },
      { id: 'M-10.3', name: 'Subscription', ...ACCOUNT, as: 'push' },
      { id: 'M-10.4', name: 'Notifications', ...ACCOUNT, as: 'push' },
      { id: 'M-10.5', name: 'Terms & disclaimer', ...ACCOUNT, as: 'modal' },
    ],
  },
];

/** Start for an entry, with any params it needs from the freshly loaded world. */
export function startFor(e: ScreenEntry, s: State): ScenarioStart {
  const base = e.under ?? [];
  const stack = e.as === 'root' ? [e.id] : e.as === 'push' ? [...base, e.id] : base;
  const params = e.params ? { [e.id]: e.params(s) } : undefined;
  return {
    kind: 'screen',
    root: e.preauth ? 'preauth' : 'main',
    tab: e.tab ?? 'ask',
    stack,
    ...(e.as === 'sheet' && { sheet: e.id }),
    ...(e.as === 'modal' && { modal: e.id }),
    ...(params && { params }),
  };
}

/** Loads the base world, then re-applies the start so the navigator opens this screen. */
export function openScreen(e: ScreenEntry, load: (id: string) => void) {
  load(e.base ?? BASE_SCENARIO);
  const s = useAppStore.getState();
  useAppStore.setState({ scenario: { ...s.scenario, start: startFor(e, s), loadNonce: s.scenario.loadNonce + 1 } });
}
