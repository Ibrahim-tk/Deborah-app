/**
 * The onboarding profile steps come from data/intake/healthBasics.json, in order. Each step can carry a
 * `showIf` rule (e.g. sex-at-birth × age branches); edit the JSON, not code.
 * `age` (number) and `ageGroup` are derived from the date of birth so rules can branch.
 */
import { healthBasicsData } from '@shared/data';
import { ageGroupFor, ageOn, shows, type ShowIfValue } from '@shared/engine';
import type { HealthBasicsStep } from '@shared/types/content';

export type Step = HealthBasicsStep;
export type Answers = Partial<Record<string, string>>;

export const STEPS: Step[] = healthBasicsData.steps;

/** Whole years from an ISO date of birth (yyyy-mm-dd). */
export function ageFromAnswers(a: Answers, now = new Date()): number | undefined {
  const dob = a.birthDate;
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return undefined;
  return ageOn(`${dob}T12:00:00`, now);
}

/**
 * Identity for save — banks still route on sex only.
 * Prefer the always-asked identity answer; fall back to sex if somehow missing.
 * Pronouns never override this.
 */
export function effectiveGender(a: Answers): string | undefined {
  return a.gender || a.sex;
}

/** Canonical pronoun string for profile save (US forms; describe → free text). */
export function pronounsForSave(a: Answers): string | undefined {
  if (!a.pronouns) return undefined;
  if (a.pronouns === 'describe') {
    const custom = a.pronounsOther?.trim();
    return custom || 'describe';
  }
  const map: Record<string, string> = {
    'she-her': 'she/her',
    'he-him': 'he/him',
    'they-them': 'they/them',
    'she-they': 'she/they',
    'he-they': 'he/they',
    any: 'any',
  };
  return map[a.pronouns] ?? a.pronouns;
}

/** Answers plus what's derived from them (`age`, `ageGroup`, `reproductiveStage`).
 * Intake `showIf` routes on sex at birth (pronouns / identity do not change the path). */
export const withDerived = (a: Answers): Record<string, ShowIfValue> => {
  const age = ageFromAnswers(a);
  const reproductiveStage = a.reproductive ?? a.reproductiveTeen;
  const derived: Record<string, ShowIfValue> = {
    ...a,
    ...(reproductiveStage && { reproductiveStage }),
  };
  if (age === undefined) return derived;
  return { ...derived, age, ageGroup: ageGroupFor(age) };
};

/** Questions to ask, given the answers so far. Inline steps (e.g. hrtType) expand under another step. */
export const visibleSteps = (a: Answers) =>
  STEPS.filter((s) => !s.inline && shows(s.showIf, withDerived(a)));

/** Step keys visible for a complete answer set (PDF matrix / contract tests). */
export const visibleStepKeys = (a: Answers) => visibleSteps(a).map((s) => s.key);

/** True when the profile being set up is for someone else. */
export const forSomeoneElse = (a: Answers) => a.profileFor === 'dependent';

/** Step title in the right voice ("When were you born?" or "When was Emma born?"). */
export function titleFor(s: Step, a: Answers): string {
  const name = a.memberName?.trim() || 'them';
  const t = forSomeoneElse(a) && s.titleOther ? s.titleOther : s.title;
  return t.replaceAll('{name}', name);
}
/** Suggestions to offer on a text step, given the answers so far. */
export const visibleSuggestions = (s: Step, a: Answers) =>
  (s.suggestions ?? []).filter((x) => shows(x.showIf, withDerived(a))).map((x) => x.label);

/** Splits a typed list ("a, b") into names; the "None" answers are stored as an empty list. */
export function list(value: string | undefined, none?: string): string[] {
  if (!value || value === none) return [];
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

/** Authored growth stops: a visible root on entry, branches first, then a continuous bloom. */
const OPENING = [0.08, 0.19, 0.3, 0.4];
export function bloomProgress(i: number, n: number): number {
  if (n <= 1) return 1;
  const index = Math.max(0, Math.min(n - 1, i));
  if (n <= OPENING.length + 1) return OPENING[0] + (1 - OPENING[0]) * index / (n - 1);
  if (index < OPENING.length) return OPENING[index];
  const start = OPENING[OPENING.length - 1];
  return start + (1 - start) * (index - OPENING.length + 1) / (n - OPENING.length);
}
