/**
 * Simulated clock (docs/05-state-and-scenarios.md §2). The store keeps `simulatedNow` plus the real
 * time it was set (`clockAnchor`), so the simulated clock keeps running. UI uses these helpers
 * — never `new Date()` directly.
 */
export interface Clock {
  simulatedNow: string;
  clockAnchor: number;
}

export function nowFrom(clock: Clock): Date {
  return new Date(new Date(clock.simulatedNow).getTime() + (Date.now() - clock.clockAnchor));
}

export function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * 86_400_000).toISOString();
}

export type DayPart = 'morning' | 'afternoon' | 'evening';

export function dayPart(date: Date): DayPart {
  const h = date.getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Local calendar day "yyyy-mm-dd" (habit check-offs, week strips). */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Whole calendar days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: string | Date, to: string | Date): number {
  const a = new Date(from);
  const b = new Date(to);
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/** "Tuesday, Oct 28" */
export function formatDayDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}
