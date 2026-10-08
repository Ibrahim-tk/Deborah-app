/** Profile rules shared by the engine and the app (docs/ux/F06-family-profiles.md). */
import type { AgeBand, Profile } from '../types/domain';

/** Teen or child profile: teen script, third-person intake, no product card (ASSUMPTION, F06 OPEN). */
export function isMinor(profile: Pick<Profile, 'intake' | 'relationship' | 'dob'>, now: Date = new Date()): boolean {
  if (profile.intake.ageBand === 'teen') return true;
  if (profile.dob) return ageOn(profile.dob, now) < 18;
  return profile.relationship === 'daughter' || profile.relationship === 'son';
}

/** Whole years between a date of birth and `now`. */
export function ageOn(dob: string, now: Date): number {
  const d = new Date(dob);
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

/** Intake age band for a new profile, so returning questions skip what's known. */
export function ageBandFor(age: number): AgeBand {
  if (age < 18) return 'teen';
  if (age < 40) return 'under-40';
  if (age <= 45) return '40-45';
  if (age <= 50) return '46-50';
  if (age <= 55) return '51-55';
  return '56+';
}
