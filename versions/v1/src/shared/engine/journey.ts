/**
 * Core experience journeys (plan C-03, nodes DN-08 to DN-11). Sex at birth picks the journey, the hormonal
 * stage or age band picks the sub-path; gender identity only changes wording (docs/ux/F02b §1, §5).
 * Clarifiers come from data/conversation/chatIntake.json — edit the JSON, not this file.
 */
import { chatIntakeData } from '../data';
import type { IntakeQuestion } from '../types/content';
import type { JourneyId, Profile, SymptomGroupId } from '../types/domain';
import { ageGroupFor, ageOf } from './profile';
import { shows, type ShowIfValue } from './showIf';

/** Placeholder in an intake plan: expanded into clarifiers once the questions before it are answered. */
export const CLARIFY = '@clarify';

const sexOf = (p: Profile) => p.sexAtBirth ?? p.health?.sexAtBirth?.value;

const FEMALE: Record<string, JourneyId> = {
  cycling: 'female-cycling',
  perimenopausal: 'female-peri',
  postmenopausal: 'female-post',
  pregnant: 'female-pregnant',
  na: 'female-unsure',
};

/** DN-08. Null while a basic it needs (sex, or a female stage) is still unknown. */
export function journeyFor(profile: Profile, now: Date): JourneyId | null {
  const age = ageOf(profile, now);
  if (age !== undefined && ageGroupFor(age) !== 'adult') return ageGroupFor(age) === 'teen' ? 'teen' : 'child';
  const sex = sexOf(profile);
  if (!sex) return null;
  if (sex === 'male') {
    // OPEN: "age unknown for a male profile" — documented default: the under-40 bank (no screening extras).
    if (age === undefined || age < 40) return 'male-under-40';
    return age < 55 ? 'male-40-54' : 'male-55-plus';
  }
  const stage = profile.intake.reproductive;
  return stage ? (FEMALE[stage] ?? 'female-unsure') : null;
}

/** What `showIf` rules in chatIntake.json can test. */
export function journeyVars(profile: Profile, now: Date): Record<string, ShowIfValue> {
  return {
    sex: sexOf(profile),
    stage: profile.intake.reproductive,
    age: ageOf(profile, now),
    meds: profile.intake.medications,
    conditions: profile.intake.conditions,
  };
}

export function chatQuestion(id: string): IntakeQuestion | undefined {
  return chatIntakeData.questions.find((q) => q.id === id);
}

const journeyDef = (id: JourneyId) => chatIntakeData.journeys.find((j) => j.id === id);

/** Missing basics this profile needs before clarifiers can be chosen (DN-09), e.g. the female stage. */
export function missingBasics(profile: Profile, now: Date): string[] {
  const vars = journeyVars(profile, now);
  return chatIntakeData.missingBasics.filter((b) => shows(b.showIf, vars)).map((b) => b.questionId);
}

/**
 * DN-10: up to `maxClarifiers` questions for this journey and symptom group, skipping anything the
 * profile already answers or this conversation already asked, then the red-flag screen (DN-11).
 * Returns null when the journey has no bank (teen, child): the script's own questions apply.
 */
export function planClarifiers(profile: Profile, now: Date, group: SymptomGroupId | undefined, asked: string[]): string[] | null {
  const id = journeyFor(profile, now);
  const def = id && journeyDef(id);
  if (!def) return null;
  const base = def.extends ? journeyDef(def.extends) : def;
  const bank = base?.clarifiers ?? {};
  const ids = (group && bank[group]) || bank.general || [];
  const vars = journeyVars(profile, now);
  const fits = (qid: string) => {
    const q = chatQuestion(qid);
    if (!q || asked.includes(qid) || !shows(q.showIf, vars)) return false;
    if (!q.skipIfKnown || !q.profileField.startsWith('intake.')) return true;
    const v = profile.intake[q.profileField.slice('intake.'.length) as keyof Profile['intake']];
    return Array.isArray(v) ? v.length === 0 : !v;
  };
  // F02b 3e: ask the stage first, then re-plan on the journey it gives.
  if (def.reroute && fits(ids[0])) return [ids[0], CLARIFY];
  let picked = ids.filter(fits).slice(0, chatIntakeData.maxClarifiers);
  // F02b 4d: an age extra replaces the lowest-priority clarifier.
  if (def.extra && fits(def.extra)) picked = [...picked.slice(0, chatIntakeData.maxClarifiers - 1), def.extra];
  const sex = sexOf(profile);
  const flags = sex === 'intersex' ? 'red-flags-intersex' : def.redFlags;
  return [...picked, ...(asked.includes(flags) ? [] : [flags])];
}

/** DN-12: journeys that never carry a product (pregnancy, breastfeeding, minors). */
export function journeyAllowsProduct(id: JourneyId | null | undefined): boolean {
  if (!id) return true;
  if (id === 'teen' || id === 'child') return false;
  return !journeyDef(id)?.noProduct;
}
