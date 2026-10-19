/**
 * Intake rules (docs/07-ai-simulation.md §2): at most 3 topic questions, one at a time, from the
 * script's list, skipping fields already known in the profile. F01 adds the health profile in
 * chat: a health-data consent, safety gates before supplement advice, and a country check.
 */
import { intakeData } from '../data';
import type { IntakeQuestion } from '../types/content';
import type { Intake, Option, Profile } from '../types/domain';
import type { EngineContext } from '../types/engine';
import { CLARIFY, SESSION_QUESTIONS, chatQuestion, journeyAllowsProduct, journeyFor, missingBasics } from './journey';
import { ageBandFor, ageOn, isMinor } from './profile';

export const CONSENT_ID = 'health-consent';
export const COUNTRY_ID = 'country';
export const SAFETY_GATES = intakeData.safetyGates;

/** Repeat rounds use suffixed ids (`fam-med-name#2`); the base id is the question. */
export const baseId = (id: string) => id.split('#')[0];

export function question(id: string): IntakeQuestion | undefined {
  const base = baseId(id);
  return intakeData.questions.find((q) => q.id === base) ?? chatQuestion(base);
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
 * Ask Dibora: adults get missing basics, session questions (concern / other / goal / meds /
 * completeness), then `@clarify` → red-flag screen only. Teens and children keep script questions.
 */
const HORMONE_GROUPS = new Set(['sleep', 'temperature', 'cycle', 'mood']);

export function planConsultation(
  ctx: EngineContext,
  scriptIntake: string[],
  hasProduct: boolean,
  own = false,
  symptomGroup?: string,
  hasConcern = false,
): string[] {
  // F02f scripted consultation: exactly the script's questions, in order (showIf / repeat run while asking).
  if (own) {
    const topic = scriptIntake.filter((id) => {
      const q = question(id);
      return Boolean(q) && !(q!.skipIfKnown && isKnown(ctx.profile, q!));
    });
    return topic.length && !ctx.healthConsent && ctx.profileGates !== false ? [CONSENT_ID, ...topic] : topic;
  }
  const now = new Date(ctx.now);
  const journey = journeyFor(ctx.profile, now);
  const usesBank = ctx.profileGates !== false && !isMinor(ctx.profile, now) && journey !== 'teen' && journey !== 'child';
  // OPEN: "child and male-teen question banks" (plan § Scope) — documented default: a boy under 18 gets only
  // the neutral how-long / how-often questions, never the scripts' cycle questions.
  const minorBoy = isMinor(ctx.profile, now) && (ctx.profile.sexAtBirth ?? ctx.profile.health?.sexAtBirth?.value) === 'male';
  let topic = usesBank
    ? [...missingBasics(ctx.profile, now), ...SESSION_QUESTIONS, CLARIFY]
    : minorBoy
      ? ['how-long', 'how-often']
      : planIntake(scriptIntake, ctx.profile);
  // A stated concern is the consultation. Goal and "any other issues" belong only before one exists.
  if (hasConcern) topic = topic.filter((id) => id !== 'session-goal' && id !== 'session-other');
  // Reproductive history is for hormone-shaped concerns, not weight, skin, or an unrelated symptom.
  if (!HORMONE_GROUPS.has(symptomGroup ?? '')) topic = topic.filter((id) => id !== 'reproductive');
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
  if (q.profileField.startsWith('conversation.') || q.profileField.startsWith('session.')) return { profile: {}, intake: {} };
  const field = q.profileField.replace(/^intake\./, '');
  // Symptoms collect across questions and conversations; "None of these" adds nothing.
  if (field === 'symptoms') {
    const picked = optionIds.filter((id) => id !== 'none');
    return { profile: {}, intake: picked.length ? { symptoms: [...new Set([...(current?.intake.symptoms ?? []), ...picked])] } : {} };
  }
  // Session free-text / confirm / expanded pills: store the human label the user sees.
  if (field === 'mainConcern' || field === 'otherIssues' || field === 'healthGoal' || field === 'newMeds') {
    if (optionIds[0] === 'none') return { profile: {}, intake: { [field]: 'None' } as Partial<Intake> };
    const text = otherText?.trim();
    if (text) return { profile: {}, intake: { [field]: text } as Partial<Intake> };
    const catalog = [...q.options, ...(q.expandOptions ?? [])];
    const labels = optionIds
      .filter((id) => id !== 'yes' && id !== 'other')
      .map((id) => catalog.find((o) => o.id === id)?.label ?? id);
    return { profile: {}, intake: labels.length ? ({ [field]: labels.join(', ') } as Partial<Intake>) : {} };
  }
  return { profile: {}, intake: { [field]: q.multi ? optionIds : optionIds[0] } as Partial<Intake> };
}

export function optionLabels(q: IntakeQuestion, optionIds: string[], otherText?: string, options: Option[] = q.options): string {
  if (q.input === 'date') return new Date(optionIds[0]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  if (q.input === 'measure') return optionIds.filter(Boolean).join(' · ');
  // Wheels and rulers pass the label in the user's units (e.g. "5 ft 6 in").
  if (q.input === 'year' || q.input === 'height' || q.input === 'weight') return otherText?.trim() || optionIds[0];
  // Prefer expand pills + gate options when labeling session answers.
  const catalog = options.length ? options : [...q.options, ...(q.expandOptions ?? [])];
  const full = [...catalog, ...(q.expandOptions ?? []).filter((o) => !catalog.some((c) => c.id === o.id))];
  // The "other" option echoes what the user typed; the scripted reply stays the same.
  return optionIds
    .filter((id) => id !== 'yes')
    .map((id) => (id === 'other' && otherText?.trim() ? otherText.trim() : full.find((o) => o.id === id)?.label ?? id))
    .join(', ');
}

/** Human label for the profile's age band, for interpolation ("46–50"). */
export function ageLabel(profile: Profile): string | undefined {
  const band = profile.intake.ageBand;
  return question('age')?.options.find((o) => o.id === band)?.label;
}
