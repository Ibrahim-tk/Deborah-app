/** Admin formatting helpers (non-visual). */
import { ADMIN_NOW } from './store';
import type { Plan } from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-10-20" → "20 Oct 2026"; with a time part → "20 Oct, 14:05". */
export function formatDate(iso: string): string {
  const [date, time] = iso.split('T');
  const [y, m, d] = date.split('-').map(Number);
  return time ? `${d} ${MONTHS[m - 1]}, ${time.slice(0, 5)}` : `${d} ${MONTHS[m - 1]} ${y}`;
}

export function daysBetween(fromIso: string, toIso: string = ADMIN_NOW): number {
  return Math.round((Date.parse(toIso.slice(0, 10)) - Date.parse(fromIso.slice(0, 10))) / 86_400_000);
}

/** GDPR: 30 days. CCPA/CPRA: 45 days. Returns days left (negative when overdue). */
/** Deletion deadline: 10 business days from the date received (story 5.2). */
export function deletionDueDate(received: string): string {
  const d = new Date(`${received.slice(0, 10)}T12:00:00`);
  for (let added = 0; added < 10; ) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d.toISOString().slice(0, 10);
}

/** Business days left until the deadline (negative when overdue). */
export function businessDaysLeft(received: string, nowIso: string = ADMIN_NOW): number {
  const due = Date.parse(`${deletionDueDate(received)}T12:00:00`);
  const d = new Date(`${nowIso.slice(0, 10)}T12:00:00`);
  const sign = d.getTime() <= due ? 1 : -1;
  let n = 0;
  while (sign > 0 ? d.getTime() < due : d.getTime() > due) {
    d.setDate(d.getDate() + sign);
    if (d.getDay() !== 0 && d.getDay() !== 6) n += sign;
  }
  return n;
}

/** Invites expire 24 hours after they're sent. */
export function inviteHoursLeft(invitedAt: string, nowIso: string = ADMIN_NOW): number {
  return 24 - Math.floor((Date.parse(nowIso) - Date.parse(invitedAt)) / 3_600_000);
}

export const money = (n: number) => (n === 0 ? 'Free' : `$${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`);
export const count = (n: number) => n.toLocaleString('en-US');

/** What a client is on, without the billing period: Free, Individual or Family. */
export const planLabel = (plan?: Plan) => (!plan ? '—' : plan.kind === 'trial' ? 'Free' : plan.kind === 'family' ? 'Family' : 'Individual');

/** "Just now", "12 min ago", "3 h ago", "Yesterday", or "2 Nov" (relative to the prototype clock). */
export function timeAgo(iso: string, nowIso: string = new Date().toISOString().slice(0, 16)): string {
  const mins = Math.round((Date.parse(nowIso) - Date.parse(iso)) / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  if (hours < 48) return 'Yesterday';
  return formatDate(iso).split(',')[0];
}

/** Today / Yesterday / Earlier bucket for grouping a feed. */
export function dayBucket(iso: string, nowIso: string = new Date().toISOString().slice(0, 10)): 'Today' | 'Yesterday' | 'Earlier' {
  const days = Math.round((Date.parse(nowIso.slice(0, 10)) - Date.parse(iso.slice(0, 10))) / 86_400_000);
  return days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : 'Earlier';
}

/** An admin's full name. */
export const adminName = (a: { firstName: string; lastName: string }) => `${a.firstName} ${a.lastName}`;
