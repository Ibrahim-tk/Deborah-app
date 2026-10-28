/**
 * Health Profile (M-2.14) reads and scores the clinical steps that onboarding no longer asks.
 * Completion is the share of applicable, required steps that already have an answer.
 */
import type { Profile } from '@shared/types/domain';
import { encodeNamedReasons } from '@mobile/patterns/widgets/NamedReasonList/namedReasons';
import { ageFromAnswers, profileVisibleSteps, type Answers } from './steps';

import { SEX_CHARACTERISTIC_KEYS } from './saveOnboarding';
const GENDERS = new Set(['man', 'woman', 'non-binary', 'agender', 'other', 'prefer-not']);
const PRONOUNS: Record<string, string> = {
  'she/her': 'she-her',
  'he/him': 'he-him',
  'they/them': 'they-them',
};

/** Form answers reconstructed from a saved profile, so the Health Profile can resume. */
export function answersFromProfile(p: Profile): Answers {
  const a: Answers = {};
  if (p.relationship && p.relationship !== 'self') a.profileFor = 'dependent';
  else a.profileFor = 'self';
  if (p.dob) a.birthDate = p.dob.slice(0, 10);
  if (p.sexAtBirth) a.sex = p.sexAtBirth;
  else if (p.health?.careContext?.value?.sexSelection === 'prefer-not') a.sex = 'prefer-not';

  const gender = p.intake.genderIdentity ?? p.health?.genderIdentity?.value;
  if (gender && GENDERS.has(gender)) a.gender = gender;
  else if (gender) {
    a.gender = 'other';
    a.genderOther = gender;
  }

  const pronouns = p.intake.pronouns ?? p.health?.careContext?.value?.pronouns;
  if (pronouns) {
    const mapped = PRONOUNS[pronouns];
    if (mapped) a.pronouns = mapped;
    else if (pronouns === 'describe') a.pronouns = 'describe';
    else {
      a.pronouns = 'describe';
      a.pronounsOther = pronouns;
    }
  }

  const age = ageFromAnswers(a);
  const stage = p.intake.reproductive;
  if (stage) {
    if (age !== undefined && age >= 13 && age <= 17) a.reproductiveTeen = stage;
    else a.reproductive = stage;
  }

  const care = p.health?.careContext?.value ?? {};
  for (const k of SEX_CHARACTERISTIC_KEYS) if (care[k]) a[k] = care[k];
  if (p.intake.periodsStarted) a.periodsStarted = p.intake.periodsStarted;
  if (p.intake.periodsNotes) a.periodsNotes = p.intake.periodsNotes;
  if (p.intake.hrtStatus) a.hrtStatus = p.intake.hrtStatus;
  if (p.intake.hrtType) a.hrtType = p.intake.hrtType;
  if (p.intake.pubertyStart) a.pubertyStart = p.intake.pubertyStart;
  if (p.intake.pubertyNotes && !care.otherPuberty) a.pubertyNotes = p.intake.pubertyNotes;
  if (care.otherPuberty) a.otherPuberty = care.otherPuberty;
  if (p.intake.fertilityConcerns) a.fertilityConcerns = p.intake.fertilityConcerns;
  if (p.intake.guardianNames) a.guardianNames = p.intake.guardianNames;
  if (p.intake.genesisGold) a.genesisGold = p.intake.genesisGold;
  if (care.ageAtLastPeriod) a.ageAtLastPeriod = care.ageAtLastPeriod;
  if (care.hysterectomy) a.hysterectomy = care.hysterectomy;
  if (care.ovariesRemoved) a.ovariesRemoved = care.ovariesRemoved;
  if (care.pubertyBlockers === 'None') a.pubertyBlockers = 'no';
  else if (care.pubertyBlockers) {
    a.pubertyBlockers = 'yes';
    if (care.pubertyBlockers !== 'Yes') a.pubertyBlockersDetails = care.pubertyBlockers;
  }
  if (care.pubertyStart && !a.pubertyStart) a.pubertyStart = care.pubertyStart;
  if (care.pubertyAge) a.pubertyAge = care.pubertyAge;
  if (p.intake.pubertyStart && age !== undefined && age >= 18) a.pubertyAge = p.intake.pubertyStart;

  const medKey = age !== undefined && age < 13 ? 'childMedications' : 'medications';
  const meds = p.health?.medications?.value;
  const medIds = p.intake.medications;
  if (medIds?.length === 1 && medIds[0] === 'none') a[medKey] = 'None';
  else if (meds?.length) {
    a[medKey] = encodeNamedReasons(meds.map((m) => {
      const [name, reason] = m.name.split(' — ');
      return { name: name ?? m.name, reason: reason ?? '' };
    }));
  }

  if (p.intake.allergies?.length === 1 && p.intake.allergies[0] === 'none') a.allergies = 'None';
  else if (p.intake.allergies?.length) a.allergies = p.intake.allergies.join(', ');

  if (care.supplements) a.supplements = care.supplements;
  else if (p.intake.notes?.startsWith('Supplements: ')) a.supplements = p.intake.notes.slice('Supplements: '.length);

  return a;
}

/** 0–1. Optional steps are not required. No applicable questions counts as complete. */
export function healthProfileCompletion(p: Profile): number {
  const answers = answersFromProfile(p);
  const steps = profileVisibleSteps(answers).filter((s) => !s.optional);
  if (!steps.length) return 1;
  const filled = steps.filter((s) => Boolean(answers[s.key]?.trim()));
  return filled.length / steps.length;
}
