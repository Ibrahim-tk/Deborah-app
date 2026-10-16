/**
 * @shell PDF persona runs — every gender × age path from Genesis Health (2).pdf
 * (“Health Intake Logic wrt Age & Gender Clinician”). Auto-run goes through Health Basics
 * to Ask Deborah, or stops at the under-13 family-member gate. Demo-only values.
 */
import type { JourneyRun, ProfileAnswers } from './journeys';

export type PdfAgeBand = 'lt13' | 'teen' | 'adult' | 'senior';
export type PdfGender =
  | 'female'
  | 'male'
  | 'non-binary'
  | 'trans-man'
  | 'trans-woman'
  | 'intersex'
  | 'prefer-not';

/** Canonical ages for simulated year ≈ 2026 (birth year = thisYear − age). */
export const PDF_AGES: Record<PdfAgeBand, number> = {
  lt13: 8,
  teen: 15,
  adult: 28,
  senior: 66,
};

export const PDF_GENDER_LABEL: Record<PdfGender, RegExp> = {
  female: /^Female$/,
  male: /^Male$/,
  'non-binary': /^Non-binary$/,
  'trans-man': /^Trans man$/,
  'trans-woman': /^Trans woman$/,
  intersex: /^Intersex$/,
  'prefer-not': /^Prefer not to say$/,
};

export interface PdfPersonaRun extends JourneyRun {
  gender: PdfGender;
  ageBand: PdfAgeBand;
  /** Where a successful auto-run should land. */
  stopAt: 'gate' | 'deborah';
  /** Expected Health Basics step keys after a full answer set (lt13 self: only through birthDate). */
  expectedSteps: string[];
}

const GENDERS: PdfGender[] = [
  'female',
  'male',
  'non-binary',
  'trans-man',
  'trans-woman',
  'intersex',
  'prefer-not',
];
const BANDS: PdfAgeBand[] = ['lt13', 'teen', 'adult', 'senior'];

const BAND_LABEL: Record<PdfAgeBand, string> = {
  lt13: 'under 13',
  teen: '13–17',
  adult: '18+',
  senior: '60+',
};

/** Sex at birth pick that routes the bank (prefer-not is a first-class sex option). */
function sexPickFor(gender: PdfGender): string {
  return gender;
}

/** Identity last — skipped for Male / Female / Prefer not to say. */
function needsIdentityFollowUp(gender: PdfGender): boolean {
  return gender !== 'male' && gender !== 'female' && gender !== 'prefer-not';
}

const SEX_STEP_LABEL: Record<string, RegExp> = {
  female: /^Female$/,
  male: /^Male$/,
  'non-binary': /^Non-binary$/,
  'trans-man': /^Trans man$/,
  'trans-woman': /^Trans woman$/,
  intersex: /^Intersex$/,
  'prefer-not': /^Prefer not to say$/,
};

/** Free-text puberty bank (trans / prefer-not / non-binary / intersex), ages 13–59. */
function usesOtherPuberty(sex: string): boolean {
  return ['trans-man', 'trans-woman', 'prefer-not', 'non-binary', 'intersex'].includes(sex);
}

/** Preferred choice labels tapped in order after Myself (sex → banks → optional identity last). */
function picksFor(gender: PdfGender, band: PdfAgeBand): RegExp[] {
  if (band === 'lt13') return [/^Myself$/];
  const sex = sexPickFor(gender);
  const out: RegExp[] = [/^Myself$/, SEX_STEP_LABEL[sex] ?? /^Female$/];
  if (band === 'senior') {
    out.push(/^No$/); // Genesis Gold
  } else if (sex === 'female') {
    out.push(/^Yes$/);
    if (band === 'teen') out.push(/^No$/); // puberty blockers
    out.push(/^Pre-menopausal$/);
    out.push(/^No$/); // Genesis Gold
  } else if (sex === 'male') {
    if (band === 'adult') out.push(/^No$/); // fertility
    out.push(/^No$/); // Genesis Gold
  } else if (usesOtherPuberty(sex)) {
    out.push(/^No$/); // Genesis Gold (free-text puberty filled via textDefaults)
  }
  if (needsIdentityFollowUp(gender)) out.push(PDF_GENDER_LABEL[gender]);
  return out;
}

/** Steps that should appear for this persona (mirrors healthBasics.json showIf). */
export function expectedStepsFor(gender: PdfGender, band: PdfAgeBand): string[] {
  if (band === 'lt13') return ['profileFor', 'birthDate'];
  const sex = sexPickFor(gender);
  const keys = ['profileFor', 'birthDate', 'sex'];
  const teen = band === 'teen';
  if (band === 'senior') {
    keys.push('medications', 'supplements', 'genesisGold');
    if (needsIdentityFollowUp(gender)) keys.push('gender');
    return keys;
  }
  if (sex === 'female') {
    if (teen) keys.push('periodsStarted', 'pubertyBlockers', 'reproductiveTeen');
    else keys.push('periodsStarted', 'reproductive');
  } else if (sex === 'male') {
    if (teen) keys.push('pubertyStart', 'pubertyNotes');
    else keys.push('pubertyAge', 'fertilityConcerns');
  } else if (usesOtherPuberty(sex)) {
    keys.push('otherPuberty');
  }
  keys.push('medications', 'supplements', 'genesisGold');
  if (needsIdentityFollowUp(gender)) keys.push('gender');
  return keys;
}

/** Complete Health Basics answers for contract tests (self profile). */
export function seedAnswersFor(gender: PdfGender, band: PdfAgeBand, thisYear = new Date().getFullYear()): Record<string, string> {
  const age = PDF_AGES[band];
  const a: Record<string, string> = {
    profileFor: 'self',
    birthDate: `${thisYear - age}-06-15`,
  };
  if (band === 'lt13') return a;
  const sex = sexPickFor(gender);
  a.sex = sex;
  const teen = band === 'teen';
  if (band === 'senior') {
    // Meds block only.
  } else if (sex === 'female') {
    a.periodsStarted = 'yes';
    if (teen) {
      a.pubertyBlockers = 'no';
      a.reproductiveTeen = 'pre-menopausal';
    } else {
      a.reproductive = 'pre-menopausal';
    }
  } else if (sex === 'male') {
    if (teen) a.pubertyStart = '14';
    else {
      a.pubertyAge = '14';
      a.fertilityConcerns = 'no';
    }
  } else if (usesOtherPuberty(sex)) {
    a.otherPuberty = 'Some puberty changes noted';
  }
  a.medications = 'None';
  a.supplements = 'None';
  a.genesisGold = 'no';
  if (needsIdentityFollowUp(gender)) a.gender = gender;
  return a;
}

function buildProfile(gender: PdfGender, band: PdfAgeBand): ProfileAnswers {
  return {
    picks: picksFor(gender, band),
    age: PDF_AGES[band],
    textDefaults: {
      pubertyStart: '14',
      pubertyAge: '14',
      otherPuberty: 'Some puberty changes noted',
    },
  };
}

function buildRun(gender: PdfGender, band: PdfAgeBand): PdfPersonaRun {
  const id = `${gender}-${band}`;
  const gate = band === 'lt13';
  return {
    id,
    gender,
    ageBand: band,
    label: `${gender} · ${BAND_LABEL[band]}`,
    description: gate
      ? 'Myself → birth date under 13 → Ask adult sheet (M-1.10).'
      : `Myself → ${BAND_LABEL[band]} → sex → intake${needsIdentityFollowUp(gender) ? ' → identity' : ''} → Deborah → Ask Deborah.`,
    scenario: 'S01',
    onboarding: true,
    profile: buildProfile(gender, band),
    stopAt: gate ? 'gate' : 'deborah',
    expectedSteps: expectedStepsFor(gender, band),
    message: '',
    answers: [],
    review: 'save',
  };
}

/** All PDF personas (7 genders × 4 age bands), in a stable menu / Run-all order. */
export const PDF_PERSONA_RUNS: PdfPersonaRun[] = GENDERS.flatMap((g) => BANDS.map((b) => buildRun(g, b)));
