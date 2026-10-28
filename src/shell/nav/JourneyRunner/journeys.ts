/**
 * @shell journeys — the core-experience paths the Journeys menu can play (plan C-21, nodes DN-01 to DN-14).
 * Each run loads a scenario, types the opening message, answers each question with the first option that
 * matches `answers` (else the first option), then resolves the Review and Confirm card with `review`.
 * Demo-only values: nothing leaves the browser.
 */
export type ReviewAction = 'save' | 'edit' | 'discard';

/** After Guidance given: keep playing Whats next (default `none` = stop at answer like today). */
export type AfterAnswer = 'none' | 'whatsNext-book' | 'whatsNext-followUp' | 'whatsNext-labs';

/** Onboarding profile answers for a run that starts at M-1.8 (S03) or continues after sign-up on S01. */
export interface ProfileAnswers {
  /** Tile, relationship, gender and branch options to tap, matched in order. */
  picks: RegExp[];
  name?: string;
  age: number;
  /** Values typed into required Health Basics text steps (e.g. pubertyStart). */
  textDefaults?: Record<string, string>;
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
  /**
   * Early exit for PDF matrix runs: stop at the under-13 gate or once Ask Deborah (M-2.1) is open.
   * When unset, the run continues through chat answers and Review and Confirm.
   */
  stopAt?: 'gate' | 'deborah';
  message: string;
  /** Preferred answers, matched against option labels in order. */
  answers: RegExp[];
  review: ReviewAction;
  /**
   * Free-text session answers keyed by role (e.g. `goal` for session-goal).
   * Used when the composer placeholder asks for typed input mid-intake.
   */
  textAnswers?: { goal?: string; answer?: string };
  /**
   * Miro Step 4: type “Tell me what you think” while intake choices are still on screen
   * (AnswerCTA only appears at ready). Then finish intake and request full guidance.
   */
  earlyAnswer?: boolean;
  /** Miro Step 4: continue past the answer into Whats next (default stop at answer). */
  afterAnswer?: AfterAnswer;
}

const NONE = [/^None$/, /^None of these$/];
/** Session confirm + completeness gates (F02d) — must match before falling back to first option. */
const SESSION_YES = [/^Yes, that'?s it$/, /^Yes, that'?s everything$/];
/** Prefer None on Yes/None gates so expand lists are skipped; plain Yes last. */
const SESSION_GATES = [...SESSION_YES, ...NONE, /^Yes$/];
const HEADACHE_ANSWERS = [
  ...SESSION_GATES,
  /^Regular cycles$/,
  /^Headaches$/,
  /^A few times a week$/,
  /^The week before my period$/,
];

/** Guardrails uncovered test phrase (docs/ux/F02e-guidance.md). */
export const UNCOVERED_PHRASE = 'I need advice about my cataract surgery recovery.';

export const JOURNEYS: JourneyRun[] = [
  {
    id: 'new-user',
    label: 'New user · full onboarding',
    description: 'Welcome, sign-up (email, password, code), Myself, birth year, sex, Start chatting, then “headaches”: stage asked in chat, body questions, Review and Confirm → Save.',
    scenario: 'S01',
    onboarding: true,
    message: 'I’ve been having headaches lately',
    answers: HEADACHE_ANSWERS,
    review: 'save',
  },
  {
    id: 'for-teen',
    label: 'For my child, 15 · periods',
    description: 'Signed up. Someone I care for → Child, Maya → 15 → teen consent → sex Female (identity skipped). Chat about Maya: third person, teen questions, no product.',
    scenario: 'S20',
    profile: { picks: [/^Family member/, /^Child$/, /^Female$/, /^She\/Her$/, /^Pre-menopausal$/, /^No$/, /^No$/, /^Female$/], name: 'Maya', age: 15 },
    message: 'Her periods have been really irregular',
    answers: [/^1–2 years$/, /^Irregular$/, ...NONE],
    review: 'save',
  },
  {
    id: 'for-child',
    label: 'For my child, 9 · sleep',
    description: 'Someone I care for → Child, Leo → 9 → guardian consent → sex Male (identity skipped). Minor rules: no product.',
    scenario: 'S03',
    profile: { picks: [/^Family member/, /^Child$/, /^Male$/, /^He\/Him$/, /^Male$/], name: 'Leo', age: 9 },
    message: 'He has trouble falling asleep',
    answers: [...NONE],
    review: 'save',
  },
  {
    id: 'for-partner',
    label: 'For my partner, 52 · energy',
    description: 'Someone I care for → Partner, James → 52 → they agree → sex Male (identity skipped). Male 40–54 questions in third person.',
    scenario: 'S21',
    profile: { picks: [/^Family member/, /^Partner$/, /^Male$/, /^He\/Him$/, /^No$/, /^Male$/], name: 'James', age: 52 },
    message: 'He has no energy by the afternoon',
    answers: [/^Tired by mid-afternoon$/, /^No$/, /^7–8$/, /^Months$/, /^Never$/, ...NONE],
    review: 'save',
  },
  {
    id: 'self-child',
    label: 'Myself, 8 · under-13 gate',
    description: 'Signed up. Myself → born 8 years ago → Ask adult to add you (M-1.10). No chat.',
    scenario: 'S03',
    profile: { picks: [/^Myself/], age: 8 },
    stopAt: 'gate',
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
    answers: HEADACHE_ANSWERS,
    review: 'save',
  },
  {
    id: 'peri',
    label: 'Perimenopause · sleep',
    description: 'Peri × sleep clarifiers, then medications and allergies before the product → Edit, then Save.',
    scenario: 'S15',
    message: 'I can’t sleep through the night, I keep waking at 3am',
    answers: [...SESSION_GATES, /^Closer together$/, /^Night sweats$/, /^1–6 months$/],
    review: 'edit',
  },
  {
    id: 'pregnant',
    label: 'Pregnant · tiredness',
    description: 'Shared pregnancy questions, no medication gate, no product card.',
    scenario: 'S16',
    message: 'I feel exhausted all the time',
    answers: [...SESSION_GATES, /^Pregnant$/, /^Not yet$/],
    review: 'save',
  },
  {
    id: 'unsure',
    label: 'Stage not sure · hot flashes',
    description: 'Last-period question re-routes to perimenopause, the stage is noted for Review and Confirm.',
    scenario: 'S17',
    message: 'Hot flashes are driving me crazy',
    answers: [...SESSION_GATES, /^1–12 months ago$/, /^Closer together$/, /^Hot flashes$/, /^A few weeks$/],
    review: 'save',
  },
  {
    id: 'male',
    label: 'Male, 52 · energy',
    description: 'Male questions with the 40–54 extra and male red flags.',
    scenario: 'S18',
    message: 'I have no energy by the afternoon',
    answers: [...SESSION_GATES, /^Tired by mid-afternoon$/, /^No$/, /^7–8$/, /^Months$/, /^Never$/],
    review: 'save',
  },
  {
    id: 'red-flag',
    label: 'Red flag · night sweats',
    description: 'A red flag on the safety screen: provider-directed framework after review; no product or trial charge → Don’t save.',
    scenario: 'S15',
    message: 'I wake up drenched in night sweats',
    answers: [...SESSION_GATES, /^Weight loss I can’t explain$/, /^Closer together$/, /^Night sweats$/, /^1–6 months$/],
    review: 'discard',
  },
];

/** Miro Step 4 Ask Deborah guidance — separate Journeys menu section. */
export const GUIDANCE_JOURNEYS: JourneyRun[] = [
  {
    id: 'guidance-happy',
    label: 'Guidance · happy path + Book',
    description:
      'Full E2E: Welcome → sign-up → Myself profile → Ask Oracle → intake → 7 sections → Review Save → What’s next → Consult with support team.',
    scenario: 'S01',
    onboarding: true,
    // Burst sign-up + explicit Health Basics (Myself / sex Female / age) so onboarding does not idle.
    profile: { picks: [/^Myself/, /^Female$/, /^She\/Her$/, /^Pre-menopausal$/, /^No$/, /^Female$/], age: 28 },
    message: 'I’ve been having headaches lately',
    answers: HEADACHE_ANSWERS,
    textAnswers: { goal: 'Sleep through the night without waking at 3am' },
    review: 'save',
    afterAnswer: 'whatsNext-book',
  },
  {
    id: 'guidance-early',
    label: 'Guidance · early first look',
    description: 'S23 mid-intake. Types Tell me what you think early, sees what’s missing, finishes questions, then full guidance.',
    scenario: 'S23',
    message: '',
    answers: [...SESSION_GATES, /^Closer together$/, /^Night sweats$/, /^Hot flashes$/, /^1–6 months$/, /^A few weeks$/],
    review: 'save',
    earlyAnswer: true,
  },
  {
    id: 'guidance-uncovered',
    label: 'Guidance · out of coverage',
    description: 'S05 empty chat. Cataract phrase → intake → Tell me what you think → team handoff (uncounted).',
    scenario: 'S05',
    message: UNCOVERED_PHRASE,
    answers: [...SESSION_GATES],
    review: 'save',
  },
];
