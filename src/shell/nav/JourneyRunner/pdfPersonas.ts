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
  | 'transgender'
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
  transgender: /^Transgender$/,
  intersex: /^Intersex$/,
  'prefer-not': /^Prefer not to say$/,
};

export interface PdfPersonaRun extends JourneyRun {
  gender: PdfGender;
  ageBand: PdfAgeBand;
  /** Where a successful auto-run should land. */
  stopAt: 'gate' | 'deborah';
  /** Expected Health Basics step keys after a full answer set (lt13 self: only through birthYear). */
  expectedSteps: string[];
}

const GENDERS: PdfGender[] = ['female', 'male', 'non-binary', 'transgender', 'intersex', 'prefer-not'];
const BANDS: PdfAgeBand[] = ['lt13', 'teen', 'adult', 'senior'];

const BAND_LABEL: Record<PdfAgeBand, string> = {
  lt13: 'under 13',
  teen: '13–17',
  adult: '18+',
  senior: '60+',
};

/** Preferred choice labels tapped in order after Myself (gender + branch answers). */
function picksFor(gender: PdfGender, band: PdfAgeBand): RegExp[] {
  if (band === 'lt13') return [/^Myself$/];
  const out: RegExp[] = [/^Myself$/, PDF_GENDER_LABEL[gender]];
  const reproAdult = /^Pre-menopausal$/;
  const reproTeen = /^Periods have started$/;
  if (band === 'teen') {
    if (gender === 'female' || gender === 'intersex' || gender === 'non-binary' || gender === 'transgender') {
      out.push(reproTeen);
    }
    if (gender === 'transgender') out.push(/^Trans woman$/);
  } else if (gender === 'female' || gender === 'intersex' || gender === 'non-binary' || gender === 'transgender') {
    out.push(reproAdult);
  }
  out.push(/^No$/); // Genesis Gold
  return out;
}

/** Steps that should appear for this persona (mirrors healthBasics.json showIf). */
export function expectedStepsFor(gender: PdfGender, band: PdfAgeBand): string[] {
  if (band === 'lt13') return ['profileFor', 'birthYear'];
  const keys = ['profileFor', 'birthYear', 'gender'];
  const teen = band === 'teen';
  const adultish = band === 'adult' || band === 'senior';
  if (teen && (gender === 'female' || gender === 'intersex' || gender === 'non-binary' || gender === 'transgender')) {
    keys.push('reproductiveTeen');
  }
  if (adultish && (gender === 'female' || gender === 'intersex' || gender === 'non-binary' || gender === 'transgender')) {
    keys.push('reproductive');
  }
  if (teen && (gender === 'male' || gender === 'non-binary' || gender === 'transgender' || gender === 'intersex' || gender === 'prefer-not')) {
    keys.push('pubertyStart', 'pubertyNotes');
  }
  if (teen && gender === 'transgender') keys.push('transIdentity');
  keys.push('medications', 'supplements', 'genesisGold');
  return keys;
}

/** Complete Health Basics answers for contract tests (self profile). */
export function seedAnswersFor(gender: PdfGender, band: PdfAgeBand, thisYear = new Date().getFullYear()): Record<string, string> {
  const age = PDF_AGES[band];
  const a: Record<string, string> = {
    profileFor: 'self',
    birthYear: String(thisYear - age),
  };
  if (band === 'lt13') return a;
  a.gender = gender;
  const teen = band === 'teen';
  const adultish = band === 'adult' || band === 'senior';
  if (teen && (gender === 'female' || gender === 'intersex' || gender === 'non-binary' || gender === 'transgender')) {
    a.reproductiveTeen = 'periods-started';
  }
  if (adultish && (gender === 'female' || gender === 'intersex' || gender === 'non-binary' || gender === 'transgender')) {
    a.reproductive = 'pre-menopausal';
  }
  if (teen && (gender === 'male' || gender === 'non-binary' || gender === 'transgender' || gender === 'intersex' || gender === 'prefer-not')) {
    a.pubertyStart = '14';
  }
  if (teen && gender === 'transgender') a.transIdentity = 'trans-woman';
  a.medications = 'None';
  a.supplements = 'None';
  a.genesisGold = 'no';
  return a;
}

function buildProfile(gender: PdfGender, band: PdfAgeBand): ProfileAnswers {
  return {
    picks: picksFor(gender, band),
    age: PDF_AGES[band],
    /** Fill required puberty free-text when that step appears. */
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
      ? 'Myself → birth year under 13 → Ask adult to add you as a family member (M-1.10).'
      : `Myself → ${BAND_LABEL[band]} → ${gender} intake branches → Deborah welcome → Ask Deborah.`,
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

/** All 24 PDF personas (6 genders × 4 age bands), in a stable menu / Run-all order. */
export const PDF_PERSONA_RUNS: PdfPersonaRun[] = GENDERS.flatMap((g) => BANDS.map((b) => buildRun(g, b)));
