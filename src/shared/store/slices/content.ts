/** Labs, 90-day plan, notes, booking and settings — small slices kept together. */
import type { StateCreator } from 'zustand';
import { uid } from '../../utils/ids';
import { addDays, nowFrom } from '../../utils/dates';
import { createDefaults } from '../defaults';
import { BOOKING_REMINDER_BODY, FOLLOW_UP_TITLE } from './notifications';
import type { AppState, BookingSlice, LabsSlice, NotesSlice, Plan90Slice, SettingsSlice } from '../types';

type Actions = Pick<LabsSlice, 'addReport' | 'updateValue' | 'confirmReport' | 'replaceReport' | 'deleteReport'> &
  Pick<Plan90Slice, 'createPlanFromAnswer' | 'toggleHabit' | 'removeHabit'> &
  Pick<NotesSlice, 'addNote' | 'updateNote' | 'deleteNote' | 'appendToNote'> &
  Pick<BookingSlice, 'book' | 'cancelBooking'> &
  Pick<SettingsSlice, 'setTextSize' | 'requestExport' | 'signOut' | 'deleteAccount'>;

export const contentActions: StateCreator<AppState, [], [], Actions> = (set, get) => {
  /** Back to an empty store (S01-like). Scenario bookkeeping and dev flags belong to the shell. */
  const wipe = () => {
    const s = get();
    set({ ...createDefaults(nowFrom(s).toISOString()), scenario: s.scenario, dev: s.dev });
  };
  return {
  addReport: (r) => set((s) => ({ labs: { reportsById: { ...s.labs.reportsById, [r.id]: r } } })),
  updateValue: (reportId, valueId, value) =>
    set((s) => {
      const r = s.labs.reportsById[reportId];
      if (!r) return {};
      const values = r.values.map((v) => (v.id === valueId ? { ...v, value, edited: true } : v));
      return { labs: { reportsById: { ...s.labs.reportsById, [reportId]: { ...r, values } } } };
    }),
  confirmReport: (reportId) =>
    set((s) => {
      const r = s.labs.reportsById[reportId];
      return r ? { labs: { reportsById: { ...s.labs.reportsById, [reportId]: { ...r, confirmed: true } } } } : {};
    }),
  replaceReport: (r) => set((s) => ({ labs: { reportsById: { ...s.labs.reportsById, [r.id]: r } } })),
  deleteReport: (reportId) =>
    set((s) => {
      const reportsById = { ...s.labs.reportsById };
      delete reportsById[reportId];
      return { labs: { reportsById } };
    }),

  // Only the first answer creates the plan; later answers keep the existing one.
  createPlanFromAnswer: (profileId, goal, habits, productId, status) =>
    set((s) => {
      if (s.plan90[profileId]) return {};
      const now = nowFrom(s).toISOString();
      return {
        plan90: {
          ...s.plan90,
          [profileId]: {
            profileId,
            startDate: now,
            goal,
            habits: habits.map((text) => ({ id: uid('h'), text, doneDates: [] })),
            productId,
            status,
          },
        },
      };
    }),
  toggleHabit: (profileId, habitId, date) =>
    set((s) => {
      const plan = s.plan90[profileId];
      if (!plan) return {};
      const habits = plan.habits.map((h) =>
        h.id !== habitId ? h : { ...h, doneDates: h.doneDates.includes(date) ? h.doneDates.filter((d) => d !== date) : [...h.doneDates, date] },
      );
      return { plan90: { ...s.plan90, [profileId]: { ...plan, habits } } };
    }),
  removeHabit: (profileId, habitId) =>
    set((s) => {
      const plan = s.plan90[profileId];
      return plan ? { plan90: { ...s.plan90, [profileId]: { ...plan, habits: plan.habits.filter((h) => h.id !== habitId) } } } : {};
    }),

  addNote: (n) => set((s) => ({ notes: { byId: { ...s.notes.byId, [n.id]: n } } })),
  updateNote: (id, patch) =>
    set((s) => {
      const n = s.notes.byId[id];
      return n ? { notes: { byId: { ...s.notes.byId, [id]: { ...n, ...patch, updatedAt: nowFrom(s).toISOString() } } } } : {};
    }),
  deleteNote: (id) =>
    set((s) => {
      const byId = { ...s.notes.byId };
      delete byId[id];
      return { notes: { byId } };
    }),
  appendToNote: (profileId, kind, title, line) =>
    set((s) => {
      const now = nowFrom(s).toISOString();
      const existing = Object.values(s.notes.byId).find((n) => n.profileId === profileId && n.kind === kind);
      const note = existing
        ? { ...existing, body: existing.body ? `${existing.body}\n• ${line}` : `• ${line}`, updatedAt: now }
        : { id: uid('n'), profileId, kind, title, body: `• ${line}`, updatedAt: now };
      return { notes: { byId: { ...s.notes.byId, [note.id]: note } } };
    }),

  book: (b) =>
    set((s) => {
      // Lock-screen text stays generic: no symptoms, conditions or products.
      const reminder = {
        id: uid('n'),
        title: FOLLOW_UP_TITLE,
        body: BOOKING_REMINDER_BODY,
        deepLink: `booking:${b.id}`,
        deliverAt: addDays(b.slot, -1),
        delivered: false,
        read: false,
      };
      return {
        booking: { bookings: [...s.booking.bookings, b] },
        notifications: s.notifications.bookingReminders ? { ...s.notifications, queue: [...s.notifications.queue, reminder] } : s.notifications,
      };
    }),
  cancelBooking: (id) =>
    set((s) => ({
      booking: { bookings: s.booking.bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)) },
      notifications: { ...s.notifications, queue: s.notifications.queue.filter((n) => n.deepLink !== `booking:${id}` || n.delivered) },
    })),

  setTextSize: (textSize) => set((s) => ({ settings: { ...s.settings, textSize } })),
  requestExport: () => set((s) => ({ settings: { ...s.settings, dataExportRequestedAt: nowFrom(s).toISOString() } })),
  signOut: wipe,
  deleteAccount: wipe,
  };
};
