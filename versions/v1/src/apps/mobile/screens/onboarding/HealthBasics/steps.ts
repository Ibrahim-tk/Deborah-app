/**
 * The onboarding profile steps come from data/intake/healthBasics.json, in order. Each step can carry a
 * `showIf` rule (e.g. "someone else" adds relationship, name and consent); edit the JSON, not code.
 * `ageGroup` is derived from the birth year so rules can branch on child · teen · adult.
 */
import { healthBasicsData } from '@flow-v1/shared/data';
import { ageGroupFor, shows } from '@flow-v1/shared/engine';
import type { HealthBasicsStep } from '@flow-v1/shared/types/content';

export type Step = HealthBasicsStep;
export type Answers = Partial<Record<string, string>>;

export const STEPS: Step[] = healthBasicsData.steps;

const THIS_YEAR = new Date().getFullYear();

/** Answers plus what's derived from them (`ageGroup`). */
export const withDerived = (a: Answers): Answers =>
  a.birthYear ? { ...a, ageGroup: ageGroupFor(THIS_YEAR - Number(a.birthYear)) } : a;

/** Questions to ask, given the answers so far. */
export const visibleSteps = (a: Answers) => STEPS.filter((s) => shows(s.showIf, withDerived(a)));

/** True when the profile being set up is for someone else. */
export const forSomeoneElse = (a: Answers) => a.profileFor === 'dependent';

/** Step title in the right voice ("What year were you born?" or "What year was Emma born?"). */
export function titleFor(s: Step, a: Answers): string {
  const name = a.memberName?.trim() || 'them';
  const t = forSomeoneElse(a) && s.titleOther ? s.titleOther : s.title;
  return t.replaceAll('{name}', name);
}
/** Suggestions to offer on a text step, given the answers so far. */
export const visibleSuggestions = (s: Step, a: Answers) => (s.suggestions ?? []).filter((x) => shows(x.showIf, a)).map((x) => x.label);

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
