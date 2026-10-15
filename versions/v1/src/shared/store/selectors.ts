/** Selectors (docs/05-state-and-scenarios.md §1). Pure functions of AppState. */
import { libraryItems, scriptTopics } from '../data';
import { isMinor } from '../engine/profile';
import type { LibraryItem } from '../types/content';
import type { AppNotification, Booking, Conversation, LabReport, Message, Note, Plan90, Profile } from '../types/domain';
import { dayKey, daysBetween, nowFrom } from '../utils/dates';
import type { AppState } from './types';

export const FREE_CONSULTATIONS = 3;

export const selectActiveProfile = (s: AppState): Profile | undefined => s.profiles.byId[s.activeProfileId];

export const selectActiveConversation = (s: AppState): Conversation | undefined => {
  const id = s.conversations.activeByProfile[s.activeProfileId];
  return id ? s.conversations.byId[id] : undefined;
};

/** Free consultations left, or null on a paid plan (counter hidden). */
export const selectFreeLeft = (s: AppState): number | null =>
  s.plan === 'trial' ? Math.max(0, FREE_CONSULTATIONS - s.freeConsultationsUsed) : null;

/** Answered conversations for the active profile, newest first. */
export const selectHistory = (s: AppState): Conversation[] =>
  Object.values(s.conversations.byId)
    .filter((c) => c.profileId === s.activeProfileId && c.countedAt)
    .sort((a, b) => (b.countedAt ?? '').localeCompare(a.countedAt ?? ''));

export const selectAnsweredCount = (s: AppState, profileId = s.activeProfileId): number =>
  Object.values(s.conversations.byId).filter((c) => c.profileId === profileId && c.countedAt).length;

export const selectNow = (s: AppState): Date => nowFrom(s);

export const selectCanAddProfile = (s: AppState): boolean => s.plan === 'family' && s.profiles.order.length < 5;

/** Topic of the profile's most recent answered consultation (check-in memory line). */
export const selectLastTopic = (s: AppState, profileId = s.activeProfileId): string | undefined =>
  Object.values(s.conversations.byId)
    .filter((c) => c.profileId === profileId && c.countedAt && c.topic)
    .sort((a, b) => (b.countedAt ?? '').localeCompare(a.countedAt ?? ''))[0]?.topic;

/** Latest confirmed lab report for the profile. */
export const selectLatestLabs = (s: AppState, profileId = s.activeProfileId): LabReport | undefined =>
  Object.values(s.labs.reportsById)
    .filter((r) => r.profileId === profileId && r.confirmed)
    .sort((a, b) => (b.collectedAt ?? '').localeCompare(a.collectedAt ?? ''))[0];

/** Delivered notifications the user hasn't opened, newest first (lock screen, banners). */
export const selectUnreadNotifications = (s: AppState): AppNotification[] =>
  s.notifications.queue.filter((n) => n.delivered && !n.read).sort((a, b) => b.deliverAt.localeCompare(a.deliverAt));

// ── Phase 6: profiles, My Health, records, booking ─────────────────────────────

/** Every conversation with messages for the profile (consultations + check-ins), newest first. */
export const selectProfileConversations = (s: AppState, profileId = s.activeProfileId): Conversation[] =>
  Object.values(s.conversations.byId)
    .filter((c) => c.profileId === profileId && c.messages.length > 0)
    .sort((a, b) => (b.countedAt ?? b.startedAt).localeCompare(a.countedAt ?? a.startedAt));

/** M-7.1 until the profile's first completed consultation, then M-7.2 (F07). */
export const selectHubState = (s: AppState, profileId = s.activeProfileId): 'empty' | 'populated' =>
  selectAnsweredCount(s, profileId) > 0 ? 'populated' : 'empty';

/** Latest counted conversation: the hub's "Current focus". */
export const selectFocus = (s: AppState, profileId = s.activeProfileId): Conversation | undefined =>
  Object.values(s.conversations.byId)
    .filter((c) => c.profileId === profileId && c.countedAt)
    .sort((a, b) => (b.countedAt ?? '').localeCompare(a.countedAt ?? ''))[0];

export const selectPlan90 = (s: AppState, profileId = s.activeProfileId): Plan90 | undefined => s.plan90[profileId];

/** Day n of the 90-day plan on the simulated clock (day 1 = start date). Can exceed 90. */
export const selectPlanDay = (s: AppState, profileId = s.activeProfileId): number | undefined => {
  const plan = s.plan90[profileId];
  return plan ? daysBetween(plan.startDate, nowFrom(s)) + 1 : undefined;
};

/** Habit check-offs in the last 7 days vs. what was possible (habits × 7). */
export const selectWeekProgress = (s: AppState, profileId = s.activeProfileId): { done: number; total: number } => {
  const plan = s.plan90[profileId];
  if (!plan) return { done: 0, total: 0 };
  const now = nowFrom(s);
  const week = new Set(Array.from({ length: 7 }, (_, i) => dayKey(new Date(now.getTime() - i * 86_400_000))));
  const done = plan.habits.reduce((n, h) => n + h.doneDates.filter((d) => week.has(d)).length, 0);
  return { done, total: plan.habits.length * 7 };
};

export const selectProfileNotes = (s: AppState, profileId = s.activeProfileId): Note[] =>
  Object.values(s.notes.byId)
    .filter((n) => n.profileId === profileId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

/** Confirmed lab reports for the profile, newest first. */
export const selectProfileLabs = (s: AppState, profileId = s.activeProfileId): LabReport[] =>
  Object.values(s.labs.reportsById)
    .filter((r) => r.profileId === profileId && r.confirmed)
    .sort((a, b) => (b.collectedAt ?? '').localeCompare(a.collectedAt ?? ''));

/** Next booked consultation with Deborah for the profile (hub "Upcoming"). */
export const selectUpcomingBooking = (s: AppState, profileId = s.activeProfileId): Booking | undefined => {
  const now = nowFrom(s).toISOString();
  return s.booking.bookings
    .filter((b) => b.profileId === profileId && b.status === 'booked' && b.slot >= now)
    .sort((a, b) => a.slot.localeCompare(b.slot))[0];
};

/** Next follow-up notification not yet delivered for the profile (CheckInCard). */
export const selectNextCheckIn = (s: AppState, profileId = s.activeProfileId): AppNotification | undefined =>
  s.notifications.queue
    .filter((n) => n.deepLink === `followup:${profileId}` && !n.delivered)
    .sort((a, b) => a.deliverAt.localeCompare(b.deliverAt))[0];

/** A delivered, unread follow-up: the check-in is due now. */
export const selectCheckInDue = (s: AppState, profileId = s.activeProfileId): boolean =>
  s.notifications.queue.some((n) => n.deepLink === `followup:${profileId}` && n.delivered && !n.read);

export interface ForYouItem {
  item: LibraryItem;
  /** "Because you asked about sleep" — undefined when ranked by recency only. */
  reason?: string;
}

/**
 * "For you" = topic overlap with the profile's consultation topics, then recency (06 §3).
 * Minor profiles see teen-appropriate content only; adults never see teen-only items.
 */
export const selectForYou = (s: AppState, profileId = s.activeProfileId): ForYouItem[] => {
  const profile = s.profiles.byId[profileId];
  const minor = profile ? isMinor(profile, nowFrom(s)) : false;
  const asked = selectProfileConversations(s, profileId)
    .map((c) => scriptTopics[c.scriptId ?? ''])
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  return libraryItems
    .filter((i) => (minor ? i.audience !== 'adult' : i.audience !== 'teen'))
    .map((item) => {
      const match = asked.find((t) => t.topics.some((topic) => item.topics.includes(topic)));
      return { item, reason: match ? `Because ${match.reason}` : undefined, score: match ? 1 : 0 };
    })
    .sort((a, b) => b.score - a.score || b.item.publishedAt.localeCompare(a.item.publishedAt))
    .map(({ item, reason }) => ({ item, reason }));
};

/** Find a message in any conversation (M-9.6 from an answer's "Save PDF"). */
export const selectMessage = (s: AppState, messageId: string): { conversation: Conversation; message: Message } | undefined => {
  for (const conversation of Object.values(s.conversations.byId)) {
    const message = conversation.messages.find((m) => m.id === messageId);
    if (message) return { conversation, message };
  }
  return undefined;
};
