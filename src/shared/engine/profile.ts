/** Profile rules shared by the engine and the app (docs/ux/F06-family-profiles.md). */
import type { AgeBand, AgeGroup, Profile, Relationship } from '../types/domain';

/** DN-03: under 13 is a child, 13–17 a teen, 18 and over an adult. */
export function ageGroupFor(age: number): AgeGroup {
  if (age < 13) return 'child';
  if (age < 18) return 'teen';
  return 'adult';
}

/** Best-known age: full date of birth, else birth year, else undefined. */
export function ageOf(profile: Pick<Profile, 'dob' | 'health'>, now: Date): number | undefined {
  if (profile.dob) return ageOn(profile.dob, now);
  const year = profile.health?.birthYear?.value;
  return year ? now.getFullYear() - year : undefined;
}

/** Child / legacy daughter|son — used when DOB is unknown for minor heuristics. */
export function isChildRelationship(r: Relationship): boolean {
  return r === 'child' || r === 'daughter' || r === 'son';
}

/**
 * Teen or child profile: teen script, third-person intake, no product card (ASSUMPTION, F06 OPEN).
 * Decided by age when it is known; the relationship alone never makes an adult child a minor.
 */
export function isMinor(profile: Pick<Profile, 'intake' | 'relationship' | 'dob'> & Partial<Pick<Profile, 'health'>>, now: Date = new Date()): boolean {
  const age = ageOf(profile, now);
  if (age !== undefined) return ageGroupFor(age) !== 'adult';
  if (profile.intake.ageBand) return profile.intake.ageBand === 'teen';
  // OPEN: "child profile with no date of birth" — documented default (F06): a child relationship is a minor.
  return isChildRelationship(profile.relationship);
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
