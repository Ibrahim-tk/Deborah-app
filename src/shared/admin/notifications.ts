/** useAdminNotifications — the admin notification feed and per-category delivery preferences (A-12.1).
 *  Quiet by design: routine billing rolls into a daily summary; repeats are grouped. Simulated (CLAUDE.md §1). */
import { create } from 'zustand';
import seed from './data/notifications.json';
import type { AdminRole } from './types';

export type NotificationCategory = 'safety' | 'support' | 'data' | 'clients' | 'billing' | 'team' | 'security' | 'compliance';

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

export interface DeliveryPref {
  inApp: boolean;
  email: boolean;
  frequency?: 'instant' | 'daily';
}

export interface CategoryMeta {
  label: string;
  description: string;
  superOnly?: boolean;
  /** Safety-critical: both channels stay on. */
  locked?: boolean;
  /** Offers Instant / Daily summary. */
  digest?: boolean;
}

export const CATEGORIES: Record<NotificationCategory, CategoryMeta> = {
  safety: { label: 'Safety escalations', description: 'Emergency and critical cases, and reopened cases. Emergencies always reach you.', locked: true },
  support: { label: 'Support requests', description: 'New requests, and clients asking for Deborah.', digest: true },
  data: { label: 'Data requests', description: 'Deletion requests, deadlines and dependent transfers.' },
  clients: { label: 'Client consent', description: 'When a client withdraws consent.' },
  billing: { label: 'Billing', description: 'Failed payments (grouped), the daily summary, and Stripe connection issues. Never one per subscription.', superOnly: true, digest: true },
  team: { label: 'Team', description: 'Admin invites accepted or expired, and deactivations.', superOnly: true },
  security: { label: 'Security', description: 'New sign-ins to your account and repeated failed sign-ins on admin accounts.', superOnly: true, locked: true },
  compliance: { label: 'Compliance', description: 'New consent versions and framework items due for review.', superOnly: true },
};

export const NOTIFICATION_ORDER = Object.keys(CATEGORIES) as NotificationCategory[];

interface NotificationsState {
  items: AdminNotification[];
  prefs: Record<NotificationCategory, DeliveryPref>;
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  markAllRead: (role: AdminRole) => void;
  setPref: (category: NotificationCategory, pref: Partial<DeliveryPref>) => void;
  /** Adds a notification if in-app delivery is on for its category. */
  post: (n: Omit<AdminNotification, 'id' | 'at' | 'read' | 'status'>) => void;
}

export const visibleFor = (items: AdminNotification[], role: AdminRole) => items.filter((n) => role === 'super' || n.audience === 'all');

let n = 0;

export const useAdminNotifications = create<NotificationsState>((set, get) => ({
  items: (seed as AdminNotification[]).sort((a, b) => b.at.localeCompare(a.at)),
  prefs: {
    safety: { inApp: true, email: true },
    support: { inApp: true, email: false, frequency: 'instant' },
    data: { inApp: true, email: true },
    clients: { inApp: true, email: false },
    billing: { inApp: true, email: true, frequency: 'daily' },
    team: { inApp: true, email: false },
    security: { inApp: true, email: true },
    compliance: { inApp: true, email: false },
  },
  markRead: (id) => set((s) => ({ items: s.items.map((x) => (x.id === id ? { ...x, read: true } : x)) })),
  markUnread: (id) => set((s) => ({ items: s.items.map((x) => (x.id === id ? { ...x, read: false } : x)) })),
  markAllRead: (role) => set((s) => ({ items: s.items.map((x) => (role === 'super' || x.audience === 'all' ? { ...x, read: true } : x)) })),
  setPref: (category, pref) => set((s) => ({ prefs: { ...s.prefs, [category]: { ...s.prefs[category], ...pref } } })),
  post: (item) => {
    if (!get().prefs[item.category].inApp && !CATEGORIES[item.category].locked) return;
    const next: AdminNotification = { ...item, id: `nl${Date.now().toString(36)}${n++}`, at: new Date().toISOString().slice(0, 16), read: false, status: 'placeholder' };
    set((s) => ({ items: [next, ...s.items] }));
  },
}));
