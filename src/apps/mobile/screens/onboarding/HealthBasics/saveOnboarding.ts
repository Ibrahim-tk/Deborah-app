/**
 * Saves the onboarding profile (plan P-04). Basics from the form — who it's for, birth year, gender,
 * and age×gender intake answers — go straight onto the profile (decision D-4).
 */
import { ageBandFor, ageGroupFor } from '@shared/engine';
import { SELF_PROFILE_ID, useAppStore } from '@shared/store';
import type { Cycle, Profile } from '@shared/types/domain';
import type { SexAtBirth } from '@shared/types/health';
import { nowFrom, uid } from '@shared/utils';
import { forSomeoneElse, list, type Answers } from './steps';

const CONSENT_PATH = { child: 'guardian-child', teen: 'guardian-teen', adult: 'adult-agreement' } as const;

const SEX_FROM_GENDER: Partial<Record<string, SexAtBirth>> = {
  female: 'female',
  male: 'male',
  intersex: 'intersex',
};

const CYCLE_FROM_REPRODUCTIVE: Record<string, Cycle> = {
  'pre-menopausal': 'regular',
  'periods-started': 'regular',
  'peri-menopausal': 'irregular',
  irregular: 'irregular',
  'post-menopausal': 'stopped',
  'surgically-menopausal': 'stopped',
  'periods-not-started': 'unknown',
  'pregnant-postpartum': 'unknown',
};

function parseNamed(value: string | undefined, none?: string): { name: string }[] {
  return list(value, none).map((name) => ({ name }));
}

/** Writes the onboarding profile; returns the profile the first chat should open as. */
export function saveOnboarding(a: Answers): string {
  const s = useAppStore.getState();
  const now = nowFrom(s);
  const at = now.toISOString();
  const year = Number(a.birthYear);
  const age = now.getFullYear() - year;
  const sex = SEX_FROM_GENDER[a.gender ?? ''] ?? (a.sex as SexAtBirth | undefined);
  const birthYear = { value: year, source: 'manual' as const, updatedAt: at };
  const reproductive = a.reproductive ?? a.reproductiveTeen;
  /** PDF transgender intake: single puberty question (Trans-woman / Trans-man / None yet). */
  const transPuberty = a.transPuberty && a.transPuberty !== 'none-yet' ? a.transPuberty : undefined;
  const meds = a.medications !== undefined ? parseNamed(a.medications, 'None')
    : a.childMedications !== undefined ? parseNamed(a.childMedications, 'None') : undefined;
  const supplements = a.supplements !== undefined ? parseNamed(a.supplements, 'None') : undefined;
  const allergies = a.allergies !== undefined
    ? list(a.allergies, 'None').map((substance) => ({ substance }))
    : undefined;
  const care: Record<string, string> = {};
  if (supplements?.length) care.supplements = supplements.map((x) => x.name).join(', ');
  if (a.genesisGold) care.genesisGold = a.genesisGold;
  if (a.pubertyStart) care.pubertyStart = a.pubertyStart;
  if (a.pubertyNotes?.trim()) care.pubertyNotes = a.pubertyNotes.trim();
  if (transPuberty) care.transIdentity = transPuberty;
  if (a.transPuberty === 'none-yet') care.transPuberty = 'none-yet';
  if (a.guardianNames?.trim()) care.guardianNames = a.guardianNames.trim();

  const healthPatch = {
    birthYear,
    ...(sex && { sexAtBirth: { value: sex, source: 'manual' as const, updatedAt: at } }),
    ...(a.gender && { genderIdentity: { value: a.gender, source: 'manual' as const, updatedAt: at } }),
    ...(meds && { medications: { value: meds, source: 'manual' as const, updatedAt: at } }),
    ...(allergies && { allergies: { value: allergies, source: 'manual' as const, updatedAt: at } }),
    ...(Object.keys(care).length && { careContext: { value: care, source: 'manual' as const, updatedAt: at } }),
  };

  const intakePatch = {
    ageBand: ageBandFor(age),
    ...(a.gender && { genderIdentity: a.gender }),
    ...(reproductive && {
      reproductive,
      cycle: CYCLE_FROM_REPRODUCTIVE[reproductive] ?? ('unknown' as Cycle),
    }),
    ...(transPuberty && { transIdentity: transPuberty }),
    ...(a.transPuberty === 'none-yet' && { pubertyNotes: 'None yet' }),
    ...(a.pubertyStart && { pubertyStart: a.pubertyStart }),
    ...(a.pubertyNotes?.trim() && { pubertyNotes: a.pubertyNotes.trim() }),
    ...(a.genesisGold === 'yes' || a.genesisGold === 'no' ? { genesisGold: a.genesisGold as 'yes' | 'no' } : {}),
    ...(a.guardianNames?.trim() && { guardianNames: a.guardianNames.trim() }),
    ...(meds && { medications: meds.length ? meds.map((m) => m.name) : ['none'] }),
    ...(allergies && { allergies: allergies.length ? allergies.map((x) => x.substance) : ['none'] }),
    ...(supplements && {
      // Keep supplements discoverable for chat without inventing a separate intake list field.
      notes: supplements.length
        ? `Supplements: ${supplements.map((x) => x.name).join(', ')}`
        : undefined,
    }),
  };

  if (!forSomeoneElse(a)) {
    const self = s.profiles.byId[SELF_PROFILE_ID];
    s.updateProfile(SELF_PROFILE_ID, {
      ...(sex && { sexAtBirth: sex }),
      health: { ...self?.health, ...healthPatch },
    });
    s.updateIntake(SELF_PROFILE_ID, { profileFor: 'self', ...intakePatch });
    s.setIntakeProgress(SELF_PROFILE_ID, { step: 'done', completedAt: at, closedAt: at });
    return SELF_PROFILE_ID;
  }

  // Someone else: their own profile with the consent the account holder gave (age-group path).
  const group = ageGroupFor(age);
  const minor = group !== 'adult';
  const member: Profile = {
    id: uid('p'),
    name: a.memberName?.trim() || 'Them',
    relationship: (a.relationship ?? 'other') as Profile['relationship'],
    ...(sex && { sexAtBirth: sex }),
    health: healthPatch,
    intake: { conditions: [], ...intakePatch, medications: intakePatch.medications ?? [] },
    createdAt: at,
    consent: { path: CONSENT_PATH[group], attestedAt: at, attestedBy: s.accountId ?? SELF_PROFILE_ID },
    ...(minor && { guardianConsentAt: at }),
    intakeV2: { step: 'done', completedAt: at, closedAt: at },
  };
  s.addProfile(member);
  s.updateIntake(SELF_PROFILE_ID, { profileFor: 'dependent' });
  s.setIntakeProgress(SELF_PROFILE_ID, { step: 'done', completedAt: at, closedAt: at });
  return member.id;
}
