/**
 * Sign-up health basics (M-1.8) waiting for consent. Health data is stored only after explicit consent
 * (store › setHealth), so the form's answers are held here until the first chat message asks for it.
 */
import { ageBandFor, ageOn } from '@shared/engine';
import { useAppStore } from '@shared/store';
import type { Cycle } from '@shared/types/domain';
import type { SexAtBirth } from '@shared/types/health';
import { nowFrom } from '@shared/utils';

/** Form answers; list fields are comma-separated, empty when the answer was "None". */
export type HealthBasicsAnswers = Partial<Record<'birthDate' | 'birthYear' | 'heightCm' | 'weightKg' | 'sex' | 'gender' | 'reproductive' | 'hrt' | 'medications' | 'supplements' | 'allergies' | 'conditions' | 'providers', string>>;

let pending: HealthBasicsAnswers | undefined;

export const holdHealthBasics = (a: HealthBasicsAnswers) => { pending = a; };
export const hasPendingHealthBasics = () => Boolean(pending);
/** The held answers, read-only: the first chat reads them as context before consent saves them. */
export const peekHealthBasics = (): HealthBasicsAnswers | undefined => pending;

const list = (v?: string) => (v ?? '').split(',').map((x) => x.trim()).filter(Boolean);
const CYCLE: Record<string, Cycle> = { cycling: 'regular', perimenopausal: 'irregular', postmenopausal: 'stopped' };

/** Saves the held answers to the active profile. Call only after health consent is given. */
export function saveHealthBasics() {
  const a = pending;
  if (!a) return;
  pending = undefined;
  const s = useAppStore.getState();
  const id = s.activeProfileId;
  const now = nowFrom(s);
  const updatedAt = now.toISOString();
  const f = <T,>(value: T) => ({ value, source: 'manual' as const, updatedAt });
  // Basic details (meeting 2026-10-12 · A) carry only date of birth, sex and identity. Anything not asked
  // stays unknown, so Deborah asks it in the conversation when it matters — never defaulted to "none".
  const has = (k: keyof HealthBasicsAnswers) => a[k] !== undefined;
  const meds = list(a.medications);
  const supplements = list(a.supplements);
  const allergies = list(a.allergies);
  const conditions = list(a.conditions);
  const sex = a.sex as SexAtBirth | undefined;
  const year = a.birthDate ? Number(a.birthDate.slice(0, 4)) : a.birthYear ? Number(a.birthYear) : undefined;
  const care: Record<string, string> = {};
  if (supplements.length) care.supplements = supplements.join(', ');
  if (a.providers) care.providers = a.providers;
  if (a.hrt) care.hrt = a.hrt;

  s.setHealth(id, {
    ...(year && { birthYear: f(year) }),
    ...(a.birthDate && { fullDob: f(a.birthDate) }),
    ...(a.heightCm && { heightCm: f(Number(a.heightCm)) }),
    ...(a.weightKg && { weightKg: f(Number(a.weightKg)) }),
    ...(sex && { sexAtBirth: f(sex) }),
    ...(a.gender && { genderIdentity: f(a.gender) }),
    ...(has('medications') && { medications: f(meds.map((name) => ({ name }))) }),
    ...(has('allergies') && { allergies: f(allergies.map((substance) => ({ substance }))) }),
    ...(has('conditions') && { conditions: f(conditions.map((name) => ({ name }))) }),
    ...(Object.keys(care).length && { careContext: f(care) }),
  });
  if (sex || a.birthDate) s.updateProfile(id, { ...(sex && { sexAtBirth: sex }), ...(a.birthDate && { dob: a.birthDate }) });
  // Mirror into the chat intake fields so Deborah doesn't ask any of these again.
  const medIds = [...(meds.length ? ['other'] : []), ...(supplements.length ? ['supplements'] : []), ...(a.hrt === 'yes' ? ['hrt'] : [])];
  s.updateIntake(id, {
    ...(year && { ageBand: ageBandFor(a.birthDate ? ageOn(a.birthDate, now) : now.getFullYear() - year) }),
    ...(a.reproductive && { reproductive: a.reproductive, cycle: CYCLE[a.reproductive] ?? 'unknown' }),
    ...(has('conditions') && { conditions: conditions.length ? conditions : ['none'] }),
    ...(has('medications') && { medications: medIds.length ? medIds : ['none'] }),
    ...(has('allergies') && { allergies: allergies.length ? ['medication'] : ['none'] }),
    country: localeRegion(),
  });
}

function localeRegion(): string | undefined {
  try {
    return new Intl.Locale(navigator.language).maximize().region;
  } catch {
    return undefined;
  }
}
