/**
 * Saves the onboarding profile (plan P-04). Basics from the form — who it's for, date of birth,
 * sex at birth, gender identity, and age×sex intake answers — go straight onto the profile (D-4).
 */
import { ageBandFor, ageGroupFor } from '@shared/engine';
import { SELF_PROFILE_ID, useAppStore } from '@shared/store';
import type { Cycle, Profile } from '@shared/types/domain';
import type { SexAtBirth } from '@shared/types/health';
import { nowFrom, uid } from '@shared/utils';
import { ageFromAnswers, effectiveGender, forSomeoneElse, list, pronounsForSave, type Answers } from './steps';

const CONSENT_PATH = { child: 'guardian-child', teen: 'guardian-teen', adult: 'adult-agreement' } as const;

type ConsentPath = NonNullable<Profile['consent']>['path'];

/** Map medical-advocate radio (or legacy `yes`) to the stored consent path. */
function consentPathFor(option: string | undefined, group: keyof typeof CONSENT_PATH): ConsentPath {
  if (option === 'guardian') return group === 'adult' ? 'adult-agreement' : CONSENT_PATH[group];
  if (option === 'agreed' || option === 'proxy') return 'adult-agreement';
  // Legacy single-checkbox attestation, or missing → age-group default.
  return CONSENT_PATH[group];
}

const SEX_AT_BIRTH = new Set<SexAtBirth>(['female', 'male', 'intersex']);

const CYCLE_FROM_REPRODUCTIVE: Record<string, Cycle> = {
  menstruation: 'regular',
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
  if (!value || value === none) return [];
  // Pregnant/Postpartum name+reason rows are stored as JSON.
  try {
    const parsed = JSON.parse(value) as { name?: string; reason?: string }[];
    if (Array.isArray(parsed)) {
      return parsed
        .filter((x) => x?.name?.trim())
        .map((x) => ({
          name: x.reason?.trim() ? `${x.name!.trim()} — ${x.reason.trim()}` : x.name!.trim(),
        }));
    }
  } catch {
    /* comma list */
  }
  return list(value, none).map((name) => ({ name }));
}

/** Writes the onboarding profile; returns the profile the first chat should open as. */
export function saveOnboarding(a: Answers): string {
  const s = useAppStore.getState();
  const now = nowFrom(s);
  const at = now.toISOString();
  const dob = a.birthDate;
  const year = dob ? Number(dob.slice(0, 4)) : NaN;
  const age = ageFromAnswers(a, now) ?? (Number.isFinite(year) ? now.getFullYear() - year : 0);
  // Clinical sex at birth is only M/F/I; other first-step picks are identity (with optional follow-up).
  const sex = SEX_AT_BIRTH.has(a.sex as SexAtBirth) ? (a.sex as SexAtBirth) : undefined;
  const gender = effectiveGender(a);
  const pronouns = pronounsForSave(a);
  const birthYear = Number.isFinite(year) ? { value: year, source: 'manual' as const, updatedAt: at } : undefined;
  const reproductive = a.reproductive ?? a.reproductiveTeen;
  const pubertyStart = a.pubertyStart || a.pubertyAge;
  const meds = a.medications !== undefined ? parseNamed(a.medications, 'None')
    : a.childMedications !== undefined ? parseNamed(a.childMedications, 'None') : undefined;
  const supplements = a.supplements !== undefined ? parseNamed(a.supplements, 'None') : undefined;
  const allergies = a.allergies !== undefined
    ? list(a.allergies, 'None').map((substance) => ({ substance }))
    : undefined;
  const care: Record<string, string> = {};
  if (supplements?.length) care.supplements = supplements.map((x) => x.name).join(', ');
  if (a.genesisGold) care.genesisGold = a.genesisGold;
  if (pubertyStart) care.pubertyStart = pubertyStart;
  if (a.pubertyNotes?.trim()) care.pubertyNotes = a.pubertyNotes.trim();
  if (a.otherPuberty?.trim()) care.otherPuberty = a.otherPuberty.trim();
  if (a.fertilityConcerns) care.fertilityConcerns = a.fertilityConcerns;
  if (a.guardianNames?.trim()) care.guardianNames = a.guardianNames.trim();
  if (a.periodsStarted) care.periodsStarted = a.periodsStarted;
  if (a.periodsNotes?.trim()) care.periodsNotes = a.periodsNotes.trim();
  // Yes → free-text details (or "Yes"); No / legacy None → "None".
  if (a.pubertyBlockers === 'yes') care.pubertyBlockers = a.pubertyBlockersDetails?.trim() || 'Yes';
  else if (a.pubertyBlockers === 'no' || a.pubertyBlockers === 'None') care.pubertyBlockers = 'None';
  else if (a.pubertyBlockers?.trim()) care.pubertyBlockers = a.pubertyBlockers.trim();
  if (a.ageAtLastPeriod?.trim()) care.ageAtLastPeriod = a.ageAtLastPeriod.trim();
  if (a.hysterectomy) care.hysterectomy = a.hysterectomy;
  if (a.ovariesRemoved) care.ovariesRemoved = a.ovariesRemoved;
  if (a.hrtStatus) care.hrtStatus = a.hrtStatus;
  if (a.hrtType) care.hrtType = a.hrtType;
  if (a.hrtTaken) care.hrtTaken = a.hrtTaken;

  if (a.sex) care.sexSelection = a.sex;
  if (pronouns) care.pronouns = pronouns;

  const healthPatch = {
    ...(birthYear && { birthYear }),
    ...(sex && { sexAtBirth: { value: sex, source: 'manual' as const, updatedAt: at } }),
    ...(gender && { genderIdentity: { value: gender, source: 'manual' as const, updatedAt: at } }),
    ...(meds && { medications: { value: meds, source: 'manual' as const, updatedAt: at } }),
    ...(allergies && { allergies: { value: allergies, source: 'manual' as const, updatedAt: at } }),
    ...(Object.keys(care).length && { careContext: { value: care, source: 'manual' as const, updatedAt: at } }),
  };

  const intakePatch = {
    ageBand: ageBandFor(age),
    ...(gender && { genderIdentity: gender }),
    ...(pronouns && { pronouns }),
    ...(reproductive && {
      reproductive,
      cycle: CYCLE_FROM_REPRODUCTIVE[reproductive] ?? ('unknown' as Cycle),
    }),
    ...(a.otherPuberty?.trim() && { pubertyNotes: a.otherPuberty.trim() }),
    ...(pubertyStart && { pubertyStart }),
    ...(a.pubertyNotes?.trim() && { pubertyNotes: a.pubertyNotes.trim() }),
    ...(a.fertilityConcerns && { fertilityConcerns: a.fertilityConcerns }),
    ...(a.genesisGold === 'yes' || a.genesisGold === 'no' ? { genesisGold: a.genesisGold as 'yes' | 'no' } : {}),
    ...(a.guardianNames?.trim() && { guardianNames: a.guardianNames.trim() }),
    ...(a.periodsStarted && { periodsStarted: a.periodsStarted }),
    ...(a.periodsNotes?.trim() && { periodsNotes: a.periodsNotes.trim() }),
    ...(a.pubertyBlockers === 'yes'
      ? { pubertyBlockers: a.pubertyBlockersDetails?.trim() || 'Yes' }
      : a.pubertyBlockers === 'no' || a.pubertyBlockers === 'None'
        ? { pubertyBlockers: 'None' }
        : a.pubertyBlockers
          ? { pubertyBlockers: a.pubertyBlockers }
          : {}),
    ...(a.ageAtLastPeriod?.trim() && { ageAtLastPeriod: a.ageAtLastPeriod.trim() }),
    ...(a.hysterectomy && { hysterectomy: a.hysterectomy }),
    ...(a.ovariesRemoved && { ovariesRemoved: a.ovariesRemoved }),
    ...(a.hrtStatus && { hrtStatus: a.hrtStatus }),
    ...(a.hrtType && { hrtType: a.hrtType }),
    ...(a.hrtTaken && { hrtTaken: a.hrtTaken }),
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
      ...(dob && { dob }),
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
    ...(dob && { dob }),
    ...(sex && { sexAtBirth: sex }),
    health: healthPatch,
    intake: {
      conditions: [],
      ...intakePatch,
      medications: intakePatch.medications ?? [],
      ...(a.relationship === 'other' && a.relationshipOther?.trim()
        ? { relationshipOther: a.relationshipOther.trim() }
        : {}),
    },
    createdAt: at,
    consent: {
      path: consentPathFor(a.consent, group),
      attestedAt: at,
      attestedBy: s.accountId ?? SELF_PROFILE_ID,
    },
    ...(minor && { guardianConsentAt: at }),
    intakeV2: { step: 'done', completedAt: at, closedAt: at },
  };
  s.addProfile(member);
  s.updateIntake(SELF_PROFILE_ID, { profileFor: 'dependent' });
  s.setIntakeProgress(SELF_PROFILE_ID, { step: 'done', completedAt: at, closedAt: at });
  return member.id;
}
