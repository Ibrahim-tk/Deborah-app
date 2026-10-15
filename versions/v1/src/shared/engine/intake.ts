/**
 * Intake rules (docs/07-ai-simulation.md §2): at most 3 topic questions, one at a time, from the
 * script's list, skipping fields already known in the profile. F01 adds the health profile in
 * chat: a health-data consent, safety gates before supplement advice, and a country check.
 */
import { intakeData } from '../data';
import type { IntakeQuestion } from '../types/content';
import type { Intake, Option, Profile } from '../types/domain';
import type { EngineContext } from '../types/engine';
import { CLARIFY, chatQuestion, journeyAllowsProduct, journeyFor, missingBasics } from './journey';
import { ageBandFor, ageOn, isMinor } from './profile';

export const CONSENT_ID = 'health-consent';
export const COUNTRY_ID = 'country';
export const SAFETY_GATES = intakeData.safetyGates;

export function question(id: string): IntakeQuestion | undefined {
  return intakeData.questions.find((q) => q.id === id) ?? chatQuestion(id);
}

function isKnown(profile: Profile, q: IntakeQuestion): boolean {
  // Intake V2 stores a birth year; that is enough for the safety gate (full DOB is deferred).
  if (q.id === 'dob') return Boolean(profile.dob || profile.health?.birthYear);
  if (q.id === 'sex') return Boolean(profile.sexAtBirth);
  // A known date of birth answers the age band too.
  if (q.id === 'age' && (profile.dob || profile.health?.birthYear)) return true;
  if (q.profileField.startsWith('conversation.')) return false;
  const field = q.profileField.replace(/^intake\./, '') as keyof Intake;
  const value = profile.intake[field];
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

const unknown = (profile: Profile) => (id: string) => {
  const q = question(id);
  return Boolean(q) && !isKnown(profile, q!);
};

/** Planned questions still worth asking: anything answered since planning drops out. */
export function stillOpen(plan: string[], done: string[], profile: Profile): string[] {
  return plan.filter((id) => done.includes(id) || id === CONSENT_ID || unknown(profile)(id) || !question(id)?.skipIfKnown);
}

/** Topic questions to ask in a new consultation. */
export function planIntake(scriptIntake: string[], profile: Profile): string[] {
  return scriptIntake
    .map(question)
    .filter((q): q is IntakeQuestion => Boolean(q) && !(q!.skipIfKnown && isKnown(profile, q!)))
    .slice(0, intakeData.maxQuestions)
    .map((q) => q.id);
}

/** True when this answer would recommend a supplement (the script carries a product). */
export function recommendsProduct(ctx: EngineContext, hasProduct: boolean): boolean {
  return hasProduct && !isMinor(ctx.profile, new Date(ctx.now));
}

/** Safety gates still missing for this profile (F01: no supplement advice without them). */
export function missingGates(profile: Profile): string[] {
  return SAFETY_GATES.filter(unknown(profile));
}

/** Onboarding basics still unknown (date of birth, sex at birth): asked in the consultation, before the topic. */
export function missingOnboarding(profile: Profile): string[] {
  return (intakeData.onboarding ?? []).filter(unknown(profile));
}

/**
 * Full plan for a new consultation: consent first (only if any health question follows), then the
 * missing basics and safety gates, then the topic, then the country check.
 * Core experience (DN-09 · DN-10): adults get the journey's missing basics and a `@clarify` slot that
 * expands into the journey × symptom-group clarifiers once the questions before it are answered.
 * Teens and children keep the script's own questions (no bank yet, plan § Scope).
 */
export function planConsultation(ctx: EngineContext, scriptIntake: string[], hasProduct: boolean): string[] {
  const now = new Date(ctx.now);
  const journey = journeyFor(ctx.profile, now);
  const usesBank = ctx.profileGates !== false && !isMinor(ctx.profile, now) && journey !== 'teen' && journey !== 'child';
  // OPEN: "child and male-teen question banks" (plan § Scope) — documented default: a boy under 18 gets only
  // the neutral how-long / how-often questions, never the scripts' cycle questions.
  const minorBoy = isMinor(ctx.profile, now) && (ctx.profile.sexAtBirth ?? ctx.profile.health?.sexAtBirth?.value) === 'male';
  let topic = usesBank ? [...missingBasics(ctx.profile, now), CLARIFY] : minorBoy ? ['how-long', 'how-often'] : planIntake(scriptIntake, ctx.profile);
  if (ctx.profileGates === false) return topic;
  // Basics first (date of birth, sex at birth), then the topic, then the product safety gates
  // (medications, allergies) so she's asked about her own concern before her medicine cabinet.
  const basics = missingOnboarding(ctx.profile);
  // No gates when the journey never carries a product (pregnancy, breastfeeding).
  const product = recommendsProduct(ctx, hasProduct) && journeyAllowsProduct(journey);
  const gates = product ? missingGates(ctx.profile).filter((id) => !basics.includes(id)) : [];
  topic = topic.filter((id) => !gates.includes(id) && !basics.includes(id));
  // Date of birth answers the age band, so the topic's age question would repeat it.
  if (basics.includes('dob')) topic = topic.filter((id) => id !== 'age');
  const self = ctx.profile.relationship === 'self';
  const country = self && !ctx.profile.intake.country ? [COUNTRY_ID] : [];
  const health = [...basics, ...topic, ...gates];
  if (!health.length) return country;
  return [...(ctx.healthConsent ? [] : [CONSENT_ID]), ...health, ...country];
}

/** "US" → "the United States" style label; falls back to the code. */
export function countryName(region: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(region) ?? region;
  } catch {
    return region;
  }
}

/** Options for a question; the country check is built from the device locale. */
export function optionsFor(q: IntakeQuestion, ctx: EngineContext): Option[] {
  if (q.id !== COUNTRY_ID) return q.options;
  const region = ctx.region ?? 'US';
  return [
    { id: region, label: `Yes, ${countryName(region)}` },
    { id: 'other', label: 'Somewhere else…' },
  ];
}

/** Profile + intake patches for an answered question. */
export function answerPatch(q: IntakeQuestion, optionIds: string[], otherText: string | undefined, now: Date, current?: Profile): { intake: Partial<Intake>; profile: Partial<Profile> } {
  const stamp = now.toISOString();
  const health = (patch: Partial<NonNullable<Profile['health']>>) => ({ health: { ...current?.health, ...patch } });
  // Year wheel: a birth year is enough for the safety gate; the full date is deferred.
  if (q.input === 'year') {
    const year = Number(optionIds[0]);
    return { profile: health({ birthYear: { value: year, source: 'manual', updatedAt: stamp } }), intake: { ageBand: ageBandFor(now.getFullYear() - year) } };
  }
  if (q.input === 'height') {
    const cm = Number(optionIds[0]);
    return { profile: health({ heightCm: { value: cm, source: 'manual', updatedAt: stamp } }), intake: { height: `${cm} cm` } };
  }
  if (q.input === 'weight') {
    const kg = Number(optionIds[0]);
    return { profile: health({ weightKg: { value: kg, source: 'manual', updatedAt: stamp } }), intake: { weight: `${kg} kg` } };
  }
  if (q.id === 'dob') {
    const dob = optionIds[0];
    return { profile: { dob }, intake: { ageBand: ageBandFor(ageOn(dob, now)) } };
  }
  if (q.id === 'sex') return { profile: { sexAtBirth: optionIds[0] as Profile['sexAtBirth'] }, intake: {} };
  if (q.id === 'body') return { profile: {}, intake: { height: optionIds[0], weight: optionIds[1] } };
  if (q.id === COUNTRY_ID) return { profile: {}, intake: { country: optionIds[0] === 'other' ? otherText?.trim() || 'other' : optionIds[0] } };
  // Clarifier answers that only matter to this conversation never touch the profile.
  if (q.profileField.startsWith('conversation.')) return { profile: {}, intake: {} };
  const field = q.profileField.replace(/^intake\./, '');
  // Symptoms collect across questions and conversations; "None of these" adds nothing.
  if (field === 'symptoms') {
    const picked = optionIds.filter((id) => id !== 'none');
    return { profile: {}, intake: picked.length ? { symptoms: [...new Set([...(current?.intake.symptoms ?? []), ...picked])] } : {} };
  }
  return { profile: {}, intake: { [field]: q.multi ? optionIds : optionIds[0] } as Partial<Intake> };
}

export function optionLabels(q: IntakeQuestion, optionIds: string[], otherText?: string, options: Option[] = q.options): string {
  if (q.input === 'date') return new Date(optionIds[0]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  if (q.input === 'measure') return optionIds.filter(Boolean).join(' · ');
  // Wheels and rulers pass the label in the user's units (e.g. "5 ft 6 in").
  if (q.input === 'year' || q.input === 'height' || q.input === 'weight') return otherText?.trim() || optionIds[0];
  // The "other" option echoes what the user typed; the scripted reply stays the same.
  return optionIds
    .map((id) => (id === 'other' && otherText?.trim() ? otherText.trim() : options.find((o) => o.id === id)?.label ?? id))
    .join(', ');
}

/** Human label for the profile's age band, for interpolation ("46–50"). */
export function ageLabel(profile: Profile): string | undefined {
  const band = profile.intake.ageBand;
  return question('age')?.options.find((o) => o.id === band)?.label;
}
