/**
 * Mock structured extraction (intake V2). Stands in for the LLM call with the section-5 schema:
 * deterministic keyword rules over free text, voice transcripts and OCR. No network, ever.
 * Confidence is lower for vague phrasing so the confirm card can ask "Check this".
 */
import { healthKitMock, intakeSuggestionData } from '../data';
import type { Allergy, Condition, Extraction, HealthField, HealthProfile, Medication, SexAtBirth } from '../types/health';
import { REQUIRED_FIELDS } from '../types/health';
import type { Intake, Profile } from '../types/domain';
import { ageBandFor } from './profile';

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());
// Trailing digits allowed so "Vitamin D3" matches "Vitamin D".
const has = (text: string, word: string) => new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\d*\\b`, 'i').test(text);

/** "I'm 34" / "34 years old" / "born in 1990" → birth year (relative to `now`). */
function birthYear(text: string, now: Date): { value?: number; confidence: number } {
  const born = /born (?:in )?(19\d\d|20\d\d)/i.exec(text);
  if (born) return { value: Number(born[1]), confidence: 0.95 };
  const age = /\b(?:i'?m|i am|aged?)\s*(\d{2})\b|\b(\d{2})\s*(?:years? old|yo|y\/o)\b/i.exec(text);
  if (age) return { value: now.getFullYear() - Number(age[1] ?? age[2]), confidence: 0.9 };
  const decade = /\b(?:in my|early|mid|late)\s*(\d)0s\b/i.exec(text);
  if (decade) return { value: now.getFullYear() - (Number(decade[1]) * 10 + 5), confidence: 0.5 };
  return { confidence: 0 };
}

function sex(text: string): { value?: SexAtBirth; confidence: number } {
  if (/\bintersex\b/i.test(text)) return { value: 'intersex', confidence: 0.9 };
  if (/\b(woman|female|menopaus|perimenopaus|period|pregnan|my cycle|hot flash|night sweat)\w*/i.test(text)) return { value: 'female', confidence: /\b(woman|female)\b/i.test(text) ? 0.9 : 0.6 };
  if (/\b(man|male)\b/i.test(text)) return { value: 'male', confidence: 0.9 };
  return { confidence: 0 };
}

function measures(text: string) {
  const out: { heightCm?: number; weightKg?: number; hc: number; wc: number } = { hc: 0, wc: 0 };
  const cm = /(\d{3})\s*cm/i.exec(text);
  const ftin = /(\d)\s*(?:ft|foot|feet|')\s*(\d{1,2})?\s*(?:in|inches|")?/i.exec(text);
  if (cm) [out.heightCm, out.hc] = [Number(cm[1]), 0.95];
  else if (ftin) [out.heightCm, out.hc] = [Math.round(Number(ftin[1]) * 30.48 + Number(ftin[2] ?? 0) * 2.54), 0.9];
  const kg = /(\d{2,3})\s*kg/i.exec(text);
  const lb = /(\d{2,3})\s*(?:lb|lbs|pounds)/i.exec(text);
  if (kg) [out.weightKg, out.wc] = [Number(kg[1]), 0.95];
  else if (lb) [out.weightKg, out.wc] = [Math.round(Number(lb[1]) * 0.4536), 0.9];
  return out;
}

/** Dose/frequency right after a name: "vitamin D 1000 IU daily". */
function withDose(text: string, name: string): Medication {
  const m = new RegExp(`${name}\\w*\\s*(\\d+(?:\\.\\d+)?\\s*(?:mg|mcg|iu|g))?\\s*(daily|twice a day|once a day|at night|weekly)?`, 'i').exec(text);
  return { name: cap(name), ...(m?.[1] ? { dose: m[1].toLowerCase().replace('iu', 'IU') } : {}), ...(m?.[2] ? { frequency: m[2].toLowerCase() } : {}) };
}

export function extractProfile(text: string, now: Date): Extraction {
  const by = birthYear(text, now);
  const sx = sex(text);
  const ms = measures(text);
  const none = (topic: string) => new RegExp(`\\bno (?:${topic})|\\bnot (?:on|taking) any|\\bdon'?t take any`, 'i').test(text);

  const medications = intakeSuggestionData.medications.filter((n) => has(text, n)).map((n) => withDose(text, n));
  const supplements = intakeSuggestionData.supplements.filter((n) => has(text, n)).map((n) => withDose(text, n));
  // "allergic to X" names anything after it, not only the suggestion list.
  const allergyHit = /allergic to ([a-z ,]+?)(?:[.;]|$| and | but )/i.exec(text);
  const allergies: Allergy[] = allergyHit ? allergyHit[1].split(/,| and /).map((a) => ({ substance: cap(a.trim()) })).filter((a) => a.substance) : [];
  const conditions: Condition[] = intakeSuggestionData.conditions.filter((n) => has(text, n)).map((n) => ({ name: n }));

  const confidence: Extraction['confidence'] = {};
  if (by.value) confidence.birthYear = by.confidence;
  if (sx.value) confidence.sexAtBirth = sx.confidence;
  if (ms.heightCm) confidence.heightCm = ms.hc;
  if (ms.weightKg) confidence.weightKg = ms.wc;
  if (medications.length || supplements.length || none('medications|meds|supplements')) confidence.medications = medications.length + supplements.length ? 0.9 : 0.85;
  if (allergies.length || none('allergies|known allergies')) confidence.allergies = allergies.length ? 0.9 : 0.85;
  if (conditions.length || none('conditions|health conditions')) confidence.conditions = conditions.length ? 0.85 : 0.8;
  return { birthYear: by.value, sexAtBirth: sx.value, heightCm: ms.heightCm, weightKg: ms.weightKg, medications, supplements, allergies, conditions, confidence };
}

const field = <T>(value: T, source: HealthField<T>['source'], now: string, confidence?: number): HealthField<T> => ({ value, source, updatedAt: now, ...(confidence !== undefined ? { confidence } : {}) });

/** Extraction → profile patch: only fields the text actually answered. */
export function extractionPatch(x: Extraction, now: string, source: 'inferred' | 'scan' = 'inferred'): Partial<HealthProfile> {
  const p: Partial<HealthProfile> = {};
  const c = x.confidence;
  if (x.birthYear && c.birthYear) p.birthYear = field(x.birthYear, source, now, c.birthYear);
  if (x.sexAtBirth && c.sexAtBirth) p.sexAtBirth = field(x.sexAtBirth, source, now, c.sexAtBirth);
  if (x.heightCm && c.heightCm) p.heightCm = field(x.heightCm, source, now, c.heightCm);
  if (x.weightKg && c.weightKg) p.weightKg = field(x.weightKg, source, now, c.weightKg);
  if (c.medications !== undefined) p.medications = field([...x.medications, ...x.supplements], source, now, c.medications);
  if (c.allergies !== undefined) p.allergies = field(x.allergies, source, now, c.allergies);
  if (c.conditions !== undefined) p.conditions = field(x.conditions, source, now, c.conditions);
  return p;
}

/** Simulated Apple Health / Health Connect read. */
export function healthKitPatch(now: string): Partial<HealthProfile> {
  const h = healthKitMock;
  return {
    birthYear: field(new Date(h.dob).getUTCFullYear(), 'healthkit', now),
    sexAtBirth: field(h.sexAtBirth as SexAtBirth, 'healthkit', now),
    heightCm: field(h.heightCm, 'healthkit', now),
    weightKg: field(h.weightKg, 'healthkit', now),
    medications: field(h.clinicalRecords.medications as Medication[], 'healthkit', now),
    allergies: field(h.clinicalRecords.allergies as Allergy[], 'healthkit', now),
    conditions: field(h.clinicalRecords.conditions as Condition[], 'healthkit', now),
    fullDob: field(h.dob, 'healthkit', now),
  };
}

/** Required rows answered (a list answered "None" counts), 0–1. */
export function profileCompletion(h: HealthProfile | undefined): number {
  if (!h) return 0;
  return REQUIRED_FIELDS.filter((f) => h[f] !== undefined).length / REQUIRED_FIELDS.length;
}

/** Step F: three starting points drawn from what she shared (placeholder copy). */
export function handOffSuggestions(h: HealthProfile | undefined): string[] {
  const meds = h?.medications?.value ?? [];
  const conditions = h?.conditions?.value ?? [];
  const out: string[] = [];
  if (meds.length) out.push('Review my supplements');
  if (conditions.some((c) => /thyroid/i.test(c.name))) out.push('Thyroid and energy');
  out.push('Better sleep', 'More energy', 'Hot flashes');
  return [...new Set(out)].slice(0, 3);
}

/**
 * Progressive intake: what her own message already answers, as legacy profile/intake patches, so
 * those questions are never asked. Only fills fields that are still unknown; vague hints
 * (confidence < 0.6) are ignored.
 */
export function inferFromMessage(profile: Profile, text: string, now: Date): { intake: Partial<Intake>; profile: Partial<Profile> } {
  const x = extractProfile(text, now);
  const c = x.confidence;
  const intake: Partial<Intake> = {};
  const patch: Partial<Profile> = {};
  const known = (v: unknown) => (Array.isArray(v) ? v.length > 0 : Boolean(v));
  if (x.birthYear && (c.birthYear ?? 0) >= 0.6 && !profile.dob && !profile.health?.birthYear) {
    intake.ageBand = ageBandFor(now.getFullYear() - x.birthYear);
    patch.health = { ...profile.health, birthYear: { value: x.birthYear, source: 'inferred', updatedAt: now.toISOString(), confidence: c.birthYear } };
  }
  if (x.sexAtBirth && (c.sexAtBirth ?? 0) >= 0.6 && !profile.sexAtBirth) patch.sexAtBirth = x.sexAtBirth;
  const meds = [...x.medications, ...x.supplements].map((m) => m.name);
  if (c.medications !== undefined && !known(profile.intake.medications)) intake.medications = meds.length ? meds : ['none'];
  if (c.allergies !== undefined && !known(profile.intake.allergies)) intake.allergies = x.allergies.length ? x.allergies.map((a) => a.substance) : ['none'];
  if (c.conditions !== undefined && !known(profile.intake.conditions)) intake.conditions = x.conditions.length ? x.conditions.map((k) => k.name) : ['none'];
  return { intake, profile: patch };
}
