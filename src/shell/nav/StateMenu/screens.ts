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
}

const answered = (s: State) => {
  const conv = Object.values(s.conversations.byId).find((c) => c.messages.some((m) => m.kind === 'answer'));
  const msg = conv?.messages.find((m) => m.kind === 'answer');
  return { conversationId: conv?.id, messageId: msg?.id };
};
const firstReport = (s: State) => Object.keys(s.labs.reportsById)[0];

const ASK = { tab: 'ask' as const, under: ['M-2.0'] };
const HEALTH = { tab: 'health' as const, under: ['M-7.2'] };
const ACCOUNT = { tab: 'account' as const, under: ['M-10.1'] };

export const SCREEN_GROUPS: { title: string; screens: ScreenEntry[] }[] = [
  {
    title: 'Home & conversation',
    screens: [
      { id: 'M-2.0', name: 'Home', tab: 'ask', as: 'root' },
      { id: 'M-2.1', name: 'Conversation', ...ASK, as: 'push' },
      { id: 'M-2.12', name: 'First consultation', ...ASK, as: 'push' },
      { id: 'M-2.14', name: 'Complete intake', ...ASK, as: 'push' },
      { id: 'M-2.10', name: 'Health profile', ...ASK, as: 'modal' },
      { id: 'M-2.13', name: 'What Deborah noted', ...ASK, as: 'sheet', params: (s) => ({ conversationId: answered(s).conversationId }) },
      { id: 'M-2.8', name: 'Follow-up reminder', ...ASK, as: 'sheet' },
      { id: 'M-2.15', name: 'Terms updated', ...ASK, as: 'modal' },
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
      { id: 'M-7.3', name: 'Healing plan', ...HEALTH, as: 'push' },
      { id: 'M-7.4', name: 'For you', ...HEALTH, as: 'push', params: () => ({ itemId: libraryItems[0]?.id }) },
      { id: 'M-7.5', name: 'Library', ...HEALTH, as: 'push' },
      { id: 'M-7.6', name: 'About Deborah', ...HEALTH, as: 'push' },
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
    root: 'main',
    tab: e.tab ?? 'ask',
    stack,
    ...(e.as === 'sheet' && { sheet: e.id }),
    ...(e.as === 'modal' && { modal: e.id }),
    ...(params && { params }),
  };
}

/** Loads the base world, then re-applies the start so the navigator opens this screen. */
export function openScreen(e: ScreenEntry, load: (id: string) => void) {
  load(BASE_SCENARIO);
  const s = useAppStore.getState();
  useAppStore.setState({ scenario: { ...s.scenario, start: startFor(e, s), loadNonce: s.scenario.loadNonce + 1 } });
}
