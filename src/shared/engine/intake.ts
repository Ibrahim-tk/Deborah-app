/**
 * Intake rules (docs/07-ai-simulation.md §2): at most 3 topic questions, one at a time, from the
 * script's list, skipping fields already known in the profile. F01 adds the health profile in
 * chat: a health-data consent, safety gates before supplement advice, and a country check.
 */
import { intakeData } from '../data';
import type { IntakeQuestion } from '../types/content';
import type { Intake, Option, Profile } from '../types/domain';
import type { EngineContext } from '../types/engine';
import { ageBandFor, ageOn, isMinor } from './profile';

export const CONSENT_ID = 'health-consent';
export const COUNTRY_ID = 'country';
export const SAFETY_GATES = intakeData.safetyGates;

export function question(id: string): IntakeQuestion | undefined {
  return intakeData.questions.find((q) => q.id === id);
}

function isKnown(profile: Profile, q: IntakeQuestion): boolean {
  // Intake V2 stores a birth year; that is enough for the safety gate (full DOB is deferred).
  if (q.id === 'dob') return Boolean(profile.dob || profile.health?.birthYear);
  if (q.id === 'sex') return Boolean(profile.sexAtBirth);
  // A known date of birth answers the age band too.
  if (q.id === 'age' && (profile.dob || profile.health?.birthYear)) return true;
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

/** Onboarding basics still unknown: asked in the first consultation, before the topic. */
export function missingOnboarding(profile: Profile): string[] {
  const ids = (intakeData.onboarding ?? []).filter(unknown(profile));
  // "Who is this profile for" only makes sense on the account holder's own profile.
  return profile.relationship === 'self' ? ids : ids.filter((id) => id !== 'profile-for');
}

/**
 * Full plan for a new consultation: consent first (only if any health question follows), then
 * the safety gates when the answer recommends a supplement, the country check, then the topic.
 */
export function planConsultation(ctx: EngineContext, scriptIntake: string[], hasProduct: boolean): string[] {
  let topic = planIntake(scriptIntake, ctx.profile);
  if (ctx.profileGates === false) return topic;
  // Onboarding through conversation: "who is this for" first, then the health basics.
  // OPEN: "Someone I care for" only records the answer; hand-off to F06 Add member is not specified.
  const onboarding = missingOnboarding(ctx.profile);
  const intro = onboarding.filter((id) => id === 'profile-for');
  const basics = onboarding.filter((id) => id !== 'profile-for');
  const gates = [...new Set([...basics, ...(recommendsProduct(ctx, hasProduct) ? missingGates(ctx.profile) : [])])];
  topic = topic.filter((id) => !gates.includes(id));
  // Date of birth answers the age band, so the topic's age question would repeat it.
  if (gates.includes('dob')) topic = topic.filter((id) => id !== 'age');
  const self = ctx.profile.relationship === 'self';
  const country = self && !ctx.profile.intake.country ? [COUNTRY_ID] : [];
  const health = [...gates, ...topic];
  if (!health.length) return [...intro, ...country];
  return [...intro, ...(ctx.healthConsent ? [] : [CONSENT_ID]), ...health, ...country];
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
  const field = q.profileField.replace(/^intake\./, '');
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
