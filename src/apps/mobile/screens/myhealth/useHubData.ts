/** M-7.2 data for the active profile: primitives / stable objects only (store subscriptions). */
import {
  selectCheckInDue,
  selectFocus,
  selectNextCheckIn,
  selectPlan90,
  selectPlanDay,
  selectProfileConversations,
  selectProfileLabs,
  selectProfileNotes,
  selectUpcomingBooking,
  selectWeekProgress,
  useAppStore,
} from '@shared/store';
import { daysBetween, formatDayDate, formatTime, nowFrom } from '@shared/utils';
import type { CheckInCardState } from '@mobile/patterns/health';

export function useHubData() {
  const profileId = useAppStore((s) => s.activeProfileId);
  const focus = useAppStore(selectFocus);
  const hasPlan = useAppStore((s) => Boolean(selectPlan90(s)));
  const planDay = useAppStore(selectPlanDay);
  const weekDone = useAppStore((s) => selectWeekProgress(s).done);
  const weekTotal = useAppStore((s) => selectWeekProgress(s).total);
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
    plan: hasPlan && planDay !== undefined ? { day: planDay, done: weekDone, total: weekTotal } : undefined,
    checkIn,
    upcoming: booking ? `${formatDayDate(booking.slot)}, ${formatTime(booking.slot)}` : undefined,
    counts,
  };
}
