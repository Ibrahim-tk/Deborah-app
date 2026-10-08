import type { StateCreator } from 'zustand';
import { nowFrom } from '../../utils/dates';
import { uid } from '../../utils/ids';
import type { AppState, DevSlice, NotificationsSlice } from '../types';

type Actions = Pick<
  NotificationsSlice,
  'scheduleNotification' | 'deliverFollowUpNow' | 'deliverDue' | 'markRead' | 'setFollowUp' | 'setBookingReminders' | 'deliverBookingReminderNow' | 'cancelNotifications'
> &
  Pick<DevSlice, 'setDev'>;

// Lock-screen text stays generic: never symptoms, conditions or product names (PHI).
export const FOLLOW_UP_TITLE = 'Your Oracle Clinician';
export const FOLLOW_UP_BODY = 'Deborah: How are you feeling this week?';
export const BOOKING_REMINDER_BODY = 'Reminder: you have a consultation with Deborah tomorrow.';

export const notificationsActions: StateCreator<AppState, [], [], Actions> = (set, get) => ({
  scheduleNotification: (n) => set((s) => ({ notifications: { ...s.notifications, queue: [...s.notifications.queue, n] } })),
  deliverFollowUpNow: () =>
    set((s) => {
      const n = {
        id: uid('n'),
        title: FOLLOW_UP_TITLE,
        body: FOLLOW_UP_BODY,
        deepLink: `followup:${s.activeProfileId}`,
        deliverAt: nowFrom(s).toISOString(),
        delivered: true,
        read: false,
      };
      return { notifications: { ...s.notifications, queue: [...s.notifications.queue, n] } };
    }),
  deliverDue: () =>
    set((s) => {
      const now = nowFrom(s).getTime();
      const queue = s.notifications.queue.map((n) =>
        !n.delivered && new Date(n.deliverAt).getTime() <= now ? { ...n, delivered: true } : n,
      );
      return { notifications: { ...s.notifications, queue } };
    }),
  markRead: (id) =>
    set((s) => ({ notifications: { ...s.notifications, queue: s.notifications.queue.map((n) => (n.id === id ? { ...n, read: true } : n)) } })),
  setFollowUp: (profileId, enabled, intervalDays) =>
    set((s) => ({ notifications: { ...s.notifications, followUp: { ...s.notifications.followUp, [profileId]: { enabled, intervalDays } } } })),
  setBookingReminders: (bookingReminders) =>
    set((s) => ({
      notifications: {
        ...s.notifications,
        bookingReminders,
        queue: bookingReminders ? s.notifications.queue : s.notifications.queue.filter((n) => n.delivered || !n.deepLink.startsWith('booking:')),
      },
    })),
  cancelNotifications: (deepLink) =>
    set((s) => ({ notifications: { ...s.notifications, queue: s.notifications.queue.filter((n) => n.delivered || n.deepLink !== deepLink) } })),
  deliverBookingReminderNow: () => {
    const s = get();
    const now = nowFrom(s).toISOString();
    const next = s.booking.bookings.filter((b) => b.status === 'booked' && b.slot >= now).sort((a, b) => a.slot.localeCompare(b.slot))[0];
    if (!next) return false;
    const n = { id: uid('n'), title: FOLLOW_UP_TITLE, body: BOOKING_REMINDER_BODY, deepLink: `booking:${next.id}`, deliverAt: now, delivered: true, read: false };
    set({ notifications: { ...s.notifications, queue: [...s.notifications.queue, n] } });
    return true;
  },
  setDev: (patch) => set((s) => ({ dev: { ...s.dev, ...patch } })),
});
