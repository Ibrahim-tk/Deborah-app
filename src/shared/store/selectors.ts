/** Selectors (docs/05-state-and-scenarios.md §1). Pure functions of AppState. */
import { libraryItems, scriptTopics } from '../data';
import { isMinor } from '../engine/profile';
import type { LibraryItem } from '../types/content';
import type { AppNotification, Booking, Conversation, HealthDocument, LabReport, Message, Note, Plan90, Profile } from '../types/domain';
import { dayKey, daysBetween, nowFrom } from '../utils/dates';
import type { AppState } from './types';

/** Free trial length (Oracle Change Requests, Oct 26): 14 days, conversations only. */
export const TRIAL_DAYS = 14;
/** @deprecated 3-consultation trial replaced by the 14-day trial (2026-10-29). Kept for old scenarios. */
export const FREE_CONSULTATIONS = 3;

/** Trial days left (0 = ended), or null on a paid plan. Old scenarios without `trialStartedAt` count a
 *  used-up consultation allowance as an ended trial. */
export const selectTrialDaysLeft = (s: AppState): number | null => {
  if (s.plan !== 'trial') return null;
  if (!s.trialStartedAt) return s.freeConsultationsUsed >= FREE_CONSULTATIONS ? 0 : TRIAL_DAYS;
  return Math.max(0, TRIAL_DAYS - daysBetween(s.trialStartedAt, nowFrom(s)));
};

export const selectActiveProfile = (s: AppState): Profile | undefined => s.profiles.byId[s.activeProfileId];

export const selectActiveConversation = (s: AppState): Conversation | undefined => {
  const id = s.conversations.activeByProfile[s.activeProfileId];
  return id ? s.conversations.byId[id] : undefined;
};

/** Trial days left, or null on a paid plan (counter hidden). Was free consultations left until 2026-10-29. */
export const selectFreeLeft = selectTrialDaysLeft;

/** Answered conversations for the active profile, newest first. */
export const selectHistory = (s: AppState): Conversation[] =>
  Object.values(s.conversations.byId)
    .filter((c) => c.profileId === s.activeProfileId && c.countedAt)
    .sort((a, b) => (b.countedAt ?? '').localeCompare(a.countedAt ?? ''));

export const selectAnsweredCount = (s: AppState, profileId = s.activeProfileId): number =>
  Object.values(s.conversations.byId).filter((c) => c.profileId === profileId && c.countedAt).length;

export const selectNow = (s: AppState): Date => nowFrom(s);

/** Teen account invited onto a parent's Family Plan (F06 teen invite). */
export const selectIsTeenAccount = (s: AppState): boolean => s.accountKind === 'teen';

/** Whole years from a yyyy-mm-dd date of birth. */
export function ageFromDob(dob: string, now: Date): number {
  const [y, m, d] = dob.split('-').map(Number);
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age -= 1;
  return age;
}

// OPEN: "DOB + State/Country → applicable age category" — default age of majority is 18 everywhere.
// OPEN: reminder 2 weeks before a teen reaches legal age; the account ends on that date.
export const AGE_OF_MAJORITY = 18;

/** Under the age of majority, from the age step's date of birth. */
export const selectIsUnderAge = (s: AppState): boolean =>
  !!s.accountDob && ageFromDob(s.accountDob, nowFrom(s)) < AGE_OF_MAJORITY;

/** Family = 4 profiles (1 primary + 3); more members are a paid add-on. */
export const selectCanAddProfile = (s: AppState): boolean => {
  const max = s.plan === 'family' ? 4 : 1;
  return max > 1 && s.profiles.order.length < max;
};

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

/** F11 My Uploads: the profile's documents, newest upload first; deleted ones are hidden. */
export const selectDocuments = (s: AppState, profileId = s.activeProfileId): HealthDocument[] =>
  Object.values(s.documents.byId)
    .filter((d) => d.profileId === profileId && !d.deletedAt)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

/** A live (not deleted) document, or undefined. */
export const selectDocument = (s: AppState, id: string): HealthDocument | undefined => {
  const d = s.documents.byId[id];
  return d && !d.deletedAt ? d : undefined;
};

/** F11 Saved Reports: visit summaries (provider-brief) and saved guidance, newest first. */
export const selectSavedReports = (s: AppState, profileId = s.activeProfileId): Note[] =>
  Object.values(s.notes.byId)
    .filter((n) => n.profileId === profileId && (n.kind === 'provider-brief' || n.kind === 'saved-answer'))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

/**
 * F09c Home entry: the most recent provider brief whose appointment date has passed and that no
 * after-visit note links to yet ("How did your visit go?").
 */
export const selectVisitToLog = (s: AppState, profileId = s.activeProfileId): string | undefined => {
  const now = nowFrom(s).getTime();
  const notes = Object.values(s.notes.byId).filter((n) => n.profileId === profileId);
  const logged = new Set(notes.map((n) => n.visit?.briefNoteId).filter(Boolean));
  return notes
    .filter((n) => n.kind === 'provider-brief' && n.brief?.appointmentDate && new Date(n.brief.appointmentDate).getTime() < now && !logged.has(n.id))
    .sort((a, b) => (b.brief!.appointmentDate! < a.brief!.appointmentDate! ? -1 : 1))[0]?.id;
};
