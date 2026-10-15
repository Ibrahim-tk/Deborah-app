/**
 * @shell journeys — the core-experience paths the Journeys menu can play (plan C-21, nodes DN-01 to DN-14).
 * Each run loads a scenario, types the opening message, answers each question with the first option that
 * matches `answers` (else the first option), then resolves the Review and Confirm card with `review`.
 * Demo-only values: nothing leaves the browser.
 */
export type ReviewAction = 'save' | 'edit' | 'discard';

/** Onboarding profile answers for a run that starts at M-1.8 (S03). */
export interface ProfileAnswers {
  /** Tile, relationship and sex options to tap, matched in order. */
  picks: RegExp[];
  name?: string;
  age: number;
}

export interface JourneyRun {
  id: string;
  label: string;
  description: string;
  scenario: string;
  /** Play the whole onboarding first (Welcome → sign-up → onboarding profile → Deborah) with the Auto demo autopilot. */
  onboarding?: boolean;
  /** Fill the onboarding profile (M-1.8) with these answers, then start the chat from M-1.9. */
  profile?: ProfileAnswers;
  message: string;
  /** Preferred answers, matched against option labels in order. */
  answers: RegExp[];
  review: ReviewAction;
}

const NONE = [/^None$/, /^None of these$/];

export const JOURNEYS: JourneyRun[] = [
  {
    id: 'new-user',
    label: 'New user · full onboarding',
    description: 'Welcome, sign-up (email, password, code), Myself, birth year, sex, Start chatting, then “headaches”: stage asked in chat, body questions, Review and Confirm → Save.',
    scenario: 'S01',
    onboarding: true,
    message: 'I’ve been having headaches lately',
    answers: [/^Regular cycles$/, /^Headaches$/, /^A few times a week$/, /^The week before my period$/, ...NONE],
    review: 'save',
  },
  {
    id: 'for-teen',
    label: 'For my daughter, 15 · periods',
    description: 'Signed up. Someone I care for → Daughter, Maya → 15 → teen consent → Female. Chat about Maya: third person, teen questions, no product.',
    scenario: 'S20',
    profile: { picks: [/^Family member/, /^Daughter$/, /^Female$/], name: 'Maya', age: 15 },
    message: 'Her periods have been really irregular',
    answers: [/^1–2 years$/, /^Irregular$/, ...NONE],
    review: 'save',
  },
  {
    id: 'for-child',
    label: 'For my son, 9 · sleep',
    description: 'Someone I care for → Son, Leo → 9 → guardian consent → Male. Minor rules: no product.',
    scenario: 'S03',
    profile: { picks: [/^Family member/, /^Son$/, /^Male$/], name: 'Leo', age: 9 },
    message: 'He has trouble falling asleep',
    answers: [...NONE],
    review: 'save',
  },
  {
    id: 'for-partner',
    label: 'For my partner, 52 · energy',
    description: 'Someone I care for → Partner, James → 52 → they agree → Male. Male 40–54 questions in third person.',
    scenario: 'S21',
    profile: { picks: [/^Family member/, /^Partner$/, /^Male$/], name: 'James', age: 52 },
    message: 'He has no energy by the afternoon',
    answers: [/^Tired by mid-afternoon$/, /^No$/, /^7–8$/, /^Months$/, /^Never$/, ...NONE],
    review: 'save',
  },
  {
    id: 'self-teen',
    label: 'Myself, 16 · age gate',
    description: 'Signed up. Myself → born 16 years ago → Ask a parent (M-1.10). No chat.',
    scenario: 'S03',
    profile: { picks: [/^Myself/], age: 16 },
    message: '',
    answers: [],
    review: 'save',
  },
  {
    id: 'sarah',
    label: 'Sarah, 28 · headaches',
    description: 'Cycling × skin, hair and body. Stage asked first, medications gate, red flags clear → answer → Save.',
    scenario: 'S14',
    message: 'I’ve been having headaches lately',
    answers: [/^Regular cycles$/, /^Headaches$/, /^A few times a week$/, /^The week before my period$/, ...NONE],
    review: 'save',
  },
  {
    id: 'peri',
    label: 'Perimenopause · sleep',
    description: 'Peri × sleep clarifiers, then medications and allergies before the product → Edit, then Save.',
    scenario: 'S15',
    message: 'I can’t sleep through the night, I keep waking at 3am',
    answers: [/^Closer together$/, /^Night sweats$/, /^1–6 months$/, ...NONE],
    review: 'edit',
  },
  {
    id: 'pregnant',
    label: 'Pregnant · tiredness',
    description: 'Shared pregnancy questions, no medication gate, no product card.',
    scenario: 'S16',
    message: 'I feel exhausted all the time',
    answers: [/^Pregnant$/, /^Not yet$/, ...NONE],
    review: 'save',
  },
  {
    id: 'unsure',
    label: 'Stage not sure · hot flashes',
    description: 'Last-period question re-routes to perimenopause, the stage is noted for Review and Confirm.',
    scenario: 'S17',
    message: 'Hot flashes are driving me crazy',
    answers: [/^1–12 months ago$/, /^Closer together$/, /^Hot flashes$/, /^A few weeks$/, ...NONE],
    review: 'save',
  },
  {
    id: 'male',
    label: 'Male, 52 · energy',
    description: 'Male questions with the 40–54 extra and male red flags.',
    scenario: 'S18',
    message: 'I have no energy by the afternoon',
    answers: [/^Tired by mid-afternoon$/, /^No$/, /^7–8$/, /^Months$/, /^Never$/, ...NONE],
    review: 'save',
  },
  {
    id: 'red-flag',
    label: 'Red flag · night sweats',
    description: 'A red flag on the safety screen: provider-directed framework after review; no product or trial charge → Don’t save.',
    scenario: 'S15',
    message: 'I wake up drenched in night sweats',
    answers: [/^Weight loss I can’t explain$/, /^Closer together$/, /^Night sweats$/, /^1–6 months$/, /^None$/],
    review: 'discard',
  },
];
