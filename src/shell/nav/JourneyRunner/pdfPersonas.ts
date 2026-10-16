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

function isTransGender(gender: PdfGender): boolean {
  return gender === 'trans-man' || gender === 'trans-woman';
}

/** First-step sex pick: male/female skip identity; others open “How do you identify?”. */
function sexPickFor(gender: PdfGender): string {
  if (gender === 'prefer-not') return 'non-binary';
  return gender;
}

function needsIdentityFollowUp(gender: PdfGender): boolean {
  return gender !== 'male' && gender !== 'female';
}

const SEX_STEP_LABEL: Record<string, RegExp> = {
  female: /^Female$/,
  male: /^Male$/,
  'non-binary': /^Non-binary$/,
  'trans-man': /^Trans man$/,
  'trans-woman': /^Trans woman$/,
  intersex: /^Intersex$/,
};

/** Route key for banks = sex at birth (prefer-not personas use Non-binary sex, then identity last). */
function routeSex(gender: PdfGender): string {
  return sexPickFor(gender);
}

/** Preferred choice labels tapped in order after Myself (sex → banks → optional identity last). */
function picksFor(gender: PdfGender, band: PdfAgeBand): RegExp[] {
  if (band === 'lt13') return [/^Myself$/];
  const sex = routeSex(gender);
  const out: RegExp[] = [/^Myself$/, SEX_STEP_LABEL[sex] ?? /^Female$/];
  const repro = /^Pre-menopausal$/;
  // 60+: skip deep banks — only meds / supplements / Genesis Gold after demography.
  if (band === 'senior') {
    out.push(/^No$/);
  } else if (isTransGender(gender)) {
    out.push(gender === 'trans-man' ? /^Trans-man$/ : /^Trans-woman$/);
    out.push(/^No$/); // Genesis Gold
  } else if (sex === 'female' || sex === 'intersex' || sex === 'non-binary') {
    out.push(/^Yes$/);
    if (band === 'teen') out.push(/^No$/);
    out.push(repro);
    out.push(/^No$/); // Genesis Gold
  } else {
    out.push(/^No$/); // Genesis Gold (e.g. male)
  }
  if (needsIdentityFollowUp(gender)) out.push(PDF_GENDER_LABEL[gender]);
  return out;
}

/** Steps that should appear for this persona (mirrors healthBasics.json showIf). */
export function expectedStepsFor(gender: PdfGender, band: PdfAgeBand): string[] {
  if (band === 'lt13') return ['profileFor', 'birthDate'];
  const sex = routeSex(gender);
  const keys = ['profileFor', 'birthDate', 'sex'];
  const teen = band === 'teen';
  if (band === 'senior') {
    keys.push('medications', 'supplements', 'genesisGold');
    if (needsIdentityFollowUp(gender)) keys.push('gender');
    return keys;
  }
  if (teen && (sex === 'female' || sex === 'intersex' || sex === 'non-binary')) {
    keys.push('periodsStarted', 'pubertyBlockers', 'reproductiveTeen');
  }
  if (band === 'adult' && (sex === 'female' || sex === 'intersex' || sex === 'non-binary')) {
    keys.push('periodsStarted', 'reproductive');
  }
  if (isTransGender(gender)) keys.push('transPuberty');
  if (teen && (sex === 'male' || sex === 'non-binary' || sex === 'intersex')) {
    keys.push('pubertyStart', 'pubertyNotes');
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
    // No deep banks.
  } else if (teen && (sex === 'female' || sex === 'intersex' || sex === 'non-binary')) {
    a.periodsStarted = 'yes';
    a.pubertyBlockers = 'no';
    a.reproductiveTeen = 'pre-menopausal';
  } else if (band === 'adult' && (sex === 'female' || sex === 'intersex' || sex === 'non-binary')) {
    a.periodsStarted = 'yes';
    a.reproductive = 'pre-menopausal';
  }
  if (band !== 'senior' && isTransGender(gender)) a.transPuberty = gender;
  if (teen && (sex === 'male' || sex === 'non-binary' || sex === 'intersex')) {
    a.pubertyStart = '14';
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
    textDefaults: { pubertyStart: '14' },
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
      ? 'Myself → birth date under 13 → Ask adult to add you as a family member (M-1.10).'
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
