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

/**
 * Sex at birth that routes the bank.
 * Non-binary is identity-only → Prefer not to say sex (same bank), then identity Non-binary.
 */
function sexPickFor(gender: PdfGender): string {
  if (gender === 'non-binary') return 'prefer-not';
  return gender;
}

const SEX_STEP_LABEL: Record<string, RegExp> = {
  female: /^Female$/,
  male: /^Male$/,
  'trans-man': /^Trans man$/,
  'trans-woman': /^Trans woman$/,
  intersex: /^Intersex$/,
  'prefer-not': /^Prefer not to say$/,
};

/** Demo pronoun tap after sex (does not route banks). */
function pronounPickFor(gender: PdfGender): RegExp {
  if (gender === 'female') return /^She\/Her$/;
  if (gender === 'male') return /^He\/Him$/;
  return /^They\/Them$/;
}

function pronounValueFor(gender: PdfGender): string {
  if (gender === 'female') return 'she-her';
  if (gender === 'male') return 'he-him';
  return 'they-them';
}

/** Choice-pill puberty bank, ages 13–59 (sex options only — no non-binary on sex). */
function usesOtherPuberty(sex: string): boolean {
  return ['trans-man', 'trans-woman', 'prefer-not', 'intersex'].includes(sex);
}

/** Preferred choice labels: sex → identity → pronouns → banks. */
function picksFor(gender: PdfGender, band: PdfAgeBand): RegExp[] {
  if (band === 'lt13') return [/^Myself$/];
  const sex = sexPickFor(gender);
  const out: RegExp[] = [
    /^Myself$/,
    SEX_STEP_LABEL[sex] ?? /^Female$/,
    PDF_GENDER_LABEL[gender],
    pronounPickFor(gender),
  ];
  if (band === 'senior') {
    out.push(/^No$/); // Genesis Gold
  } else if (sex === 'female') {
    out.push(/^Pre-menopausal$/);
    if (band === 'teen') out.push(/^No$/); // puberty blockers
    out.push(/^No$/); // Genesis Gold
  } else if (sex === 'male') {
    if (band === 'adult') out.push(/^No$/); // fertility
    out.push(/^No$/); // Genesis Gold
  } else if (usesOtherPuberty(sex)) {
    out.push(/^Yes$/); // otherPuberty
    out.push(/^Pre-menopausal$/); // reproductive after puberty
    out.push(/^No$/); // Genesis Gold
  }
  return out;
}

/** Steps that should appear for this persona (mirrors healthBasics.json showIf). */
export function expectedStepsFor(gender: PdfGender, band: PdfAgeBand): string[] {
  if (band === 'lt13') return ['profileFor', 'birthDate'];
  const sex = sexPickFor(gender);
  const keys = ['profileFor', 'birthDate', 'sex', 'gender', 'pronouns'];
  const teen = band === 'teen';
  if (band === 'senior') {
    keys.push('medications', 'supplements', 'genesisGold');
    return keys;
  }
  if (sex === 'female') {
    // Reproductive first; periods only when status is Menstruation.
    if (teen) keys.push('reproductiveTeen', 'pubertyBlockers');
    else keys.push('reproductive');
  } else if (sex === 'male') {
    if (teen) keys.push('pubertyStart', 'pubertyNotes');
    else keys.push('pubertyAge', 'fertilityConcerns');
  } else if (usesOtherPuberty(sex)) {
    keys.push('otherPuberty');
    if (teen) keys.push('reproductiveTeen');
    else keys.push('reproductive');
  }
  keys.push('medications', 'supplements', 'genesisGold');
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
  a.pronouns = pronounValueFor(gender);
  const teen = band === 'teen';
  if (band === 'senior') {
    // Meds block only.
  } else if (sex === 'female') {
    if (teen) {
      a.reproductiveTeen = 'pre-menopausal';
      a.pubertyBlockers = 'no';
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
    a.otherPuberty = 'yes';
    if (teen) a.reproductiveTeen = 'pre-menopausal';
    else a.reproductive = 'pre-menopausal';
  }
  a.medications = 'None';
  a.supplements = 'None';
  a.genesisGold = 'no';
  a.gender = gender;
  return a;
}

function buildProfile(gender: PdfGender, band: PdfAgeBand): ProfileAnswers {
  return {
    picks: picksFor(gender, band),
    age: PDF_AGES[band],
    textDefaults: {
      pubertyStart: '14',
      pubertyAge: '14',
    },
  };
}

function buildRun(gender: PdfGender, band: PdfAgeBand): PdfPersonaRun {
  const id = `${gender}-${band}`;
  const gate = band === 'lt13';
  const sexNote = gender === 'non-binary' ? 'sex Prefer not → ' : 'sex → ';
  return {
    id,
    gender,
    ageBand: band,
    label: `${gender} · ${BAND_LABEL[band]}`,
    description: gate
      ? 'Myself → birth date under 13 → Ask adult sheet (M-1.10).'
      : `Myself → ${BAND_LABEL[band]} → ${sexNote}identity → pronouns → intake → Deborah → Ask Deborah.`,
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
