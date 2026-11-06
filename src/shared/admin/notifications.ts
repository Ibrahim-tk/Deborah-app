/** useAdminNotifications — the admin notification feed and email preferences per type (story 11.1, A-12.1).
 *  In-app is always on; email can be turned off per type, except deletion deadline reminders. Escalations and
 *  Client exports are never notified. Simulated (CLAUDE.md §1). */
import { create } from 'zustand';
import seed from './data/notifications.json';
import type { AdminRole } from './types';

export type NotificationCategory = 'support' | 'gaps' | 'deletion' | 'deadline' | 'content' | 'policies' | 'admins';

/** A drawer record (`kind` + `id`) or a section to go to. */
export type NotificationTarget = { kind: string; id: string } | { section: string };

export interface AdminNotification {
  id: string;
  category: NotificationCategory;
  kind: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  audience: 'all' | 'super';
  severity: 'emergency' | 'high' | 'normal';
  target: NotificationTarget;
  groupCount?: number;
  status: 'placeholder';
}

/** Email delivery for a type; in-app notifications are always on. */
export interface DeliveryPref {
  email: boolean;
}

export interface CategoryMeta {
  label: string;
  description: string;
  superOnly?: boolean;
  /** Can't be turned off (deletion deadline reminders). */
  locked?: boolean;
}

export const CATEGORIES: Record<NotificationCategory, CategoryMeta> = {
  support: { label: 'Support requests', description: 'A new Talk to Support Team or Consultation Request.' },
  gaps: { label: 'Knowledge gaps', description: 'A question the Oracle couldn\u2019t answer.' },
  deletion: { label: 'Deletion requests', description: 'A new deletion request.' },
  deadline: { label: 'Deletion deadlines', description: 'A reminder when a deletion request is 2 business days from its deadline.', locked: true },
  content: { label: 'Content to approve', description: 'Knowledge base content waiting for your approval.', superOnly: true },
  policies: { label: 'Policy updates', description: 'A new version of the Terms of Service, Privacy Policy or Health Consent is live.' },
  admins: { label: 'New admins', description: 'A new admin has set up their account.', superOnly: true },
};

export const NOTIFICATION_ORDER = Object.keys(CATEGORIES) as NotificationCategory[];

interface NotificationsState {
  items: AdminNotification[];
  prefs: Record<NotificationCategory, DeliveryPref>;
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  markAllRead: (role: AdminRole) => void;
  setPref: (category: NotificationCategory, pref: Partial<DeliveryPref>) => void;
  /** Adds a notification to the centre (in-app is always on). */
  post: (n: Omit<AdminNotification, 'id' | 'at' | 'read' | 'status'>) => void;
}

export const visibleFor = (items: AdminNotification[], role: AdminRole) => items.filter((n) => role === 'super' || n.audience === 'all');

let n = 0;

export const useAdminNotifications = create<NotificationsState>((set) => ({
  items: (seed as AdminNotification[]).sort((a, b) => b.at.localeCompare(a.at)),
  prefs: {
    support: { email: true },
    gaps: { email: true },
    deletion: { email: true },
    deadline: { email: true },
    content: { email: true },
    policies: { email: false },
    admins: { email: false },
  },

  markRead: (id) => set((s) => ({ items: s.items.map((x) => (x.id === id ? { ...x, read: true } : x)) })),
  markUnread: (id) => set((s) => ({ items: s.items.map((x) => (x.id === id ? { ...x, read: false } : x)) })),
  markAllRead: (role) => set((s) => ({ items: s.items.map((x) => (role === 'super' || x.audience === 'all' ? { ...x, read: true } : x)) })),
  setPref: (category, pref) => set((s) => ({ prefs: { ...s.prefs, [category]: { ...s.prefs[category], ...pref } } })),
  post: (item) => {
    const next: AdminNotification = { ...item, id: `nl${Date.now().toString(36)}${n++}`, at: new Date().toISOString().slice(0, 16), read: false, status: 'placeholder' };
    set((s) => ({ items: [next, ...s.items] }));
  },
}));
