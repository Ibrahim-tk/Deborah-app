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
export function deletionDaysLeft(received: string, regulation: 'GDPR' | 'CCPA'): number {
  return (regulation === 'GDPR' ? 30 : 45) - daysBetween(received);
}

/** Invites expire 24 hours after they're sent. */
export function inviteHoursLeft(invitedAt: string, nowIso: string = ADMIN_NOW): number {
  return 24 - Math.floor((Date.parse(nowIso) - Date.parse(invitedAt)) / 3_600_000);
}

export const money = (n: number) => (n === 0 ? 'Free' : `$${n.toLocaleString('en-US')}`);
export const count = (n: number) => n.toLocaleString('en-US');

/** What a client is on, without the billing period: Free, Individual or Family. */
export const planLabel = (plan?: Plan) => (!plan ? '—' : plan.monthly === 0 && plan.yearly === 0 ? 'Free' : plan.kind === 'family' ? 'Family' : 'Individual');
