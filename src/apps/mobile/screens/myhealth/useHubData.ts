/** M-7.2 data for the active profile: primitives / stable objects only (store subscriptions). */
import {
  selectCheckInDue,
  selectFocus,
  selectNextCheckIn,
  selectPlan90,
  selectProfileConversations,
  selectProfileLabs,
  selectProfileNotes,
  selectUpcomingBooking,
  useAppStore,
} from '@shared/store';
import { activePlanSummary } from '@shared/engine/planConcerns';
import { daysBetween, formatDayDate, formatTime, nowFrom } from '@shared/utils';
import type { CheckInCardState } from '@mobile/patterns/health';

export function useHubData() {
  const profileId = useAppStore((s) => s.activeProfileId);
  const focus = useAppStore(selectFocus);
  const hasPlan = useAppStore((s) => Boolean(selectPlan90(s)));
  const concern = useAppStore((s) => activePlanSummary(selectPlan90(s)).concern);
  const done = useAppStore((s) => activePlanSummary(selectPlan90(s)).done);
  const total = useAppStore((s) => activePlanSummary(selectPlan90(s)).total);
  const due = useAppStore(selectCheckInDue);
  const next = useAppStore(selectNextCheckIn);
  const daysUntil = useAppStore((s) => (next ? daysBetween(nowFrom(s), next.deliverAt) : 0));
  const remindersOn = useAppStore((s) => Boolean(s.notifications.followUp[s.activeProfileId]?.enabled) && s.notificationPermission === 'granted');
  const booking = useAppStore(selectUpcomingBooking);
  const counts = {
    consultations: useAppStore((s) => selectProfileConversations(s).length),
    notes: useAppStore((s) => selectProfileNotes(s).length),
    labs: useAppStore((s) => selectProfileLabs(s).length),
  };

  // Due wins; then a scheduled reminder; reminders off asks to turn them on.
  const checkIn: CheckInCardState = due
    ? { kind: 'due' }
    : !remindersOn
      ? { kind: 'off' }
      : next
        ? { kind: 'scheduled', daysUntil }
        : { kind: 'unscheduled' };

  return {
    profileId,
    focus,
    plan: hasPlan ? { concern, done, total } : undefined,
    checkIn,
    upcoming: booking ? `${formatDayDate(booking.slot)}, ${formatTime(booking.slot)}` : undefined,
    counts,
  };
}
