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

/** M-1.8 only. Clinical steps stay in the same file for the Health Profile. */
const ONBOARDING_KEYS = new Set(
  healthBasicsData.onboardingKeys ?? ['profileFor', 'relationship', 'memberName', 'birthDate', 'consent', 'sex', 'gender', 'pronouns'],
);

export const isOnboardingStep = (s: Step) => ONBOARDING_KEYS.has(s.key);

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
  if (a.gender === 'other') {
    const custom = a.genderOther?.trim();
    return custom || 'other';
  }
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

/**
 * Intersex / legal brief (MVP baseline): the sex-characteristics section is optional and asked of all
 * adults (18+), not only when sex at birth is intersex or doesn't match gender.
 */
export function asksSexCharacteristics(a: Answers): boolean {
  const age = ageFromAnswers(a);
  return age !== undefined && age >= 18;
}

const SEX_CHARACTERISTICS_NONE = 'None of these';
const MENSTRUAL_ORGANS = ['Uterus', 'Cervix', 'Ovaries'];
const PROSTATE_ORGANS = ['Prostate', 'Testes'];

/**
 * Sex used to route the reproductive / puberty banks. The brief: "Use these answers, not gender identity
 * alone, to decide which menstrual, reproductive or prostate questions appear." Body answers win when
 * given; skipped, "None of these" or "Prefer not to say" falls back to sex assigned at birth.
 */
export function routeSexFor(a: Answers): string | undefined {
  const body = list(a.sexCharacteristics, SEX_CHARACTERISTICS_NONE);
  if (body.includes('Prefer not to say')) return a.sex;
  const menstrual = body.some((x) => MENSTRUAL_ORGANS.includes(x));
  const prostate = body.some((x) => PROSTATE_ORGANS.includes(x));
  // OPEN: "Use these answers … to decide which menstrual, reproductive or prostate questions appear."
  // Mixed anatomy uses the intersex bank (puberty → reproductive); confirm with the Oracle.
  if (menstrual && prostate) return 'intersex';
  if (menstrual) return 'female';
  if (prostate) return 'male';
  return a.sex;
}

// OPEN: F01 sex-characteristics §4 said picking a procedure shows an optional context field
// ("Anything you’d like to add about these?" / sexProceduresNote). User (2026-10-31): that
// follow-up doesn’t make sense — removed from the visible Health Profile / intake flow.

/** Someone else under 18 gets `childLabels` (Boy / Girl) — was under 13 until 2026-10-29. */
const minorOther = (a: Answers) => {
  const age = ageFromAnswers(a);
  return forSomeoneElse(a) && age !== undefined && age < 18;
};

/** Labels for a choice step: a minor's profile gets `childLabels` (Boy / Girl). */
export function choiceLabel(s: Step, value: string, label: string, a: Answers): string {
  return minorOther(a) ? s.childLabels?.[value] ?? label : label;
}

/** Choices in display order: with child labels, Boy comes before Girl (designer, 2026-10-29). */
export function orderedChoices(s: Step, a: Answers) {
  const choices = s.choices ?? [];
  if (!minorOther(a) || !s.childLabels) return choices;
  const rank = (v: string) => (v === 'man' ? 0 : v === 'woman' ? 1 : 2);
  return [...choices].sort((x, y) => rank(x.value) - rank(y.value));
}

/** Answers plus what's derived from them (`age`, `ageGroup`, `reproductiveStage`).
 * Banks route on `routeSex` (body answers, else sex at birth); pronouns / identity never change the path. */
export const withDerived = (a: Answers): Record<string, ShowIfValue> => {
  const age = ageFromAnswers(a);
  const reproductiveStage = a.reproductive ?? a.reproductiveTeen;
  const derived: Record<string, ShowIfValue> = {
    ...a,
    ...(reproductiveStage && { reproductiveStage }),
    sexCharacteristicsAsk: asksSexCharacteristics(a) ? 'yes' : 'no',
    ...(routeSexFor(a) && { routeSex: routeSexFor(a) }),
  };
  if (age === undefined) return derived;
  return { ...derived, age, ageGroup: ageGroupFor(age) };
};

/** Onboarding questions, given the answers so far. Inline steps expand under another step. */
export const visibleSteps = (a: Answers) =>
  STEPS.filter((s) => !s.inline && isOnboardingStep(s) && shows(s.showIf, withDerived(a)));

/** Health Profile questions (reproductive, puberty, medicines, Genesis Gold, and their branches). */
export const profileVisibleSteps = (a: Answers) =>
  STEPS.filter((s) => !s.inline && !isOnboardingStep(s) && shows(s.showIf, withDerived(a)));

/** Onboarding step keys for a complete answer set (PDF matrix / contract tests). */
export const visibleStepKeys = (a: Answers) => visibleSteps(a).map((s) => s.key);

/** Health Profile step keys for a complete answer set. */
export const profileStepKeys = (a: Answers) => profileVisibleSteps(a).map((s) => s.key);

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
