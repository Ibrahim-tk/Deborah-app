/**
 * Sign-up health basics (M-1.8) waiting for consent. Health data is stored only after explicit consent
 * (store › setHealth), so the form's answers are held here until the first chat message asks for it.
 */
import { ageBandFor } from '@shared/engine';
import { useAppStore } from '@shared/store';
import type { Cycle } from '@shared/types/domain';
import type { SexAtBirth } from '@shared/types/health';
import { nowFrom } from '@shared/utils';

/** Form answers; list fields are comma-separated, empty when the answer was "None". */
export type HealthBasicsAnswers = Partial<Record<'birthYear' | 'heightCm' | 'weightKg' | 'sex' | 'gender' | 'reproductive' | 'hrt' | 'medications' | 'supplements' | 'allergies' | 'conditions' | 'providers', string>>;

let pending: HealthBasicsAnswers | undefined;

export const holdHealthBasics = (a: HealthBasicsAnswers) => { pending = a; };
export const hasPendingHealthBasics = () => Boolean(pending);

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
  const meds = list(a.medications);
  const supplements = list(a.supplements);
  const allergies = list(a.allergies);
  const conditions = list(a.conditions);
  const sex = a.sex as SexAtBirth | undefined;
  const year = a.birthYear ? Number(a.birthYear) : undefined;
  const care: Record<string, string> = {};
  if (supplements.length) care.supplements = supplements.join(', ');
  if (a.providers) care.providers = a.providers;
  if (a.hrt) care.hrt = a.hrt;

  s.setHealth(id, {
    ...(year && { birthYear: f(year) }),
    ...(a.heightCm && { heightCm: f(Number(a.heightCm)) }),
    ...(a.weightKg && { weightKg: f(Number(a.weightKg)) }),
    ...(sex && { sexAtBirth: f(sex) }),
    ...(a.gender && { genderIdentity: f(a.gender) }),
    medications: f(meds.map((name) => ({ name }))),
    allergies: f(allergies.map((substance) => ({ substance }))),
    conditions: f(conditions.map((name) => ({ name }))),
    ...(Object.keys(care).length && { careContext: f(care) }),
  });
  if (sex) s.updateProfile(id, { sexAtBirth: sex });
  // Mirror into the chat intake fields so Deborah answers without asking any of these again.
  const medIds = [...(meds.length ? ['other'] : []), ...(supplements.length ? ['supplements'] : []), ...(a.hrt === 'yes' ? ['hrt'] : [])];
  s.updateIntake(id, {
    ...(year && { ageBand: ageBandFor(now.getFullYear() - year) }),
    reproductive: a.reproductive,
    cycle: CYCLE[a.reproductive ?? ''] ?? 'unknown',
    conditions: conditions.length ? conditions : ['none'],
    medications: medIds.length ? medIds : ['none'],
    allergies: allergies.length ? ['medication'] : ['none'],
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
