import { step as s, type ManualJourney } from './types';

const onboardingEvidence = ['src/apps/mobile/screens/onboarding/HealthBasics/', 'src/apps/mobile/screens/onboarding/DeborahWelcome/'];
const consentGap = 'Consent wording is placeholder pending legal review. Birth-year gates use calendar-year age, not an exact birthday.';
const ask = s('Ask Deborah', 'Send “I’ve been having headaches lately”. Agree to health-data processing if asked. Answer each relevant question; use None where appropriate.', 'Questions reflect the selected profile. Facts remain pending until confirmation.', 'M-2.1', ['Safety concern → safety response', 'Missing basic → question before answer']);
const review = s('Review and Confirm', 'When the answer finishes, inspect what Deborah noted. Choose Save to my profile.', 'The facts become confirmed. No guest sign-up card appears. A first-answer reminder offer may follow.', 'M-2.1', ['Edit → M-2.13 → Use this → Save', 'Don’t save → discard pending facts']);

export const CORE_JOURNEYS: ManualJourney[] = [
  {
    id: 'onboarding', name: 'First-time onboarding', persona: 'Sarah', scenario: 'S01', status: 'IMPLEMENTED',
    goal: 'Create a local demo account and reach a first conversation as an adult.',
    behavior: 'Account creation and email verification are simulated; any six digits work.', evidence: onboardingEvidence, gaps: [consentGap],
    steps: [
      s('Welcome', 'Wait for Splash, enter Sarah and choose Get Started.', 'The sign-up sheet opens; it does not skip to the questions.', 'M-1.4'),
      s('Create demo account', 'Enter sarah@example.com, demo-password-1 in both password fields, then Create account. Enter 444444.', 'You’re in appears, followed by Onboarding profile.', 'M-1.8', ['Invalid email or mismatched passwords → inline error', 'Sign in → returning-user path']),
      s('Choose profile basics', 'Choose Myself. Set birth year to 1998 and Continue. Choose Female.', 'Only basics are collected before chat; no health-history questionnaire.', 'M-1.9', ['Self under 18 → Ask a parent', 'Family member → relationship, name, consent']),
      s('Start chatting', 'Choose Start chatting.', 'Conversation opens with Sarah as the active profile.', 'M-2.1'), ask, review,
    ],
  },
  {
    id: 'self-age-gate', name: 'Self under 18 — age gate', persona: 'Sarah', scenario: 'S03', status: 'IMPLEMENTED',
    goal: 'Verify a 16-year-old cannot start their own consultation.', behavior: 'Local age gate; year-of-birth approximation.', evidence: onboardingEvidence, gaps: [consentGap],
    steps: [s('Choose Myself', 'Choose Myself.', 'Birth-year wheel appears.', 'M-1.8'), s('Under-18 birth year', 'Set birth year to 2010 and Continue.', 'Ask a parent replaces onboarding. No chat or self age/sex basics are saved.', 'M-1.10')],
  },
  ...([
    ['teen-onboarding', 'Teen dependent onboarding', 'Emily', 'S20', 'Daughter', 'Maya', '2011', 'Female', 'guardian-teen', 'Her periods have been really irregular'],
    ['child-onboarding', 'Child dependent onboarding', 'Emily', 'S20', 'Son', 'Leo', '2017', 'Male', 'guardian-child', 'He has trouble falling asleep'],
    ['adult-onboarding', 'Adult partner onboarding', 'Helen', 'S21', 'Partner', 'James', '1974', 'Male', 'adult-agreement', 'He has no energy by the afternoon'],
  ] as const).map(([id, name, persona, scenario, relationship, member, year, sex, path, message]): ManualJourney => ({
    id, name, persona, scenario, status: 'IMPLEMENTED', goal: `Create ${member}’s profile and open a conversation about them.`,
    behavior: 'One account holder manages the dependent. No invitation, separate login or sharing permissions.', evidence: onboardingEvidence, gaps: [consentGap, ...(path === 'guardian-child' ? ['Child questions use the existing minor fallback; there is no dedicated child question bank. Add Family Member still blocks under 13.'] : [])],
    steps: [
      s('Who is this for?', 'Choose Family member or dependent.', 'Relationship options appear.', 'M-1.8'),
      s('Relationship and name', `Choose ${relationship}, enter ${member}, then Continue.`, 'The next title refers to this person.', 'M-1.8'),
      s('Age and consent', `Set birth year to ${year}. Continue, read and check the agreement, then Continue.`, `Age-appropriate ${path} consent is required.`, 'M-1.8', ['Unchecked agreement → Continue disabled']),
      s('Sex at birth', `Choose ${sex}.`, `Start talking about ${member} appears.`, 'M-1.9'),
      s('Switch and chat', `Choose Start talking about ${member}; send “${message}”.`, `Profile banner identifies ${member}; questions use third person. ${path !== 'adult-agreement' ? 'No product recommendation is permitted.' : 'Male 40–54 journey applies.'}`, 'M-2.1'),
      s('Finish and inspect', 'Answer the questions, request the answer if prompted, and review any noted facts.', 'Only the dependent’s profile is updated on confirmation; the account holder remains name-only.', 'M-2.1'),
    ],
  })),
  {
    id: 'chat-profile', name: 'Health profile through conversation', persona: 'Sarah', scenario: 'S14', status: 'IMPLEMENTED',
    goal: 'Build a health profile gradually without silent saving.', behavior: 'Scripted questions and answers; local pending/confirmed facts.', evidence: ['src/shared/engine/facts.ts', 'src/shared/store/slices/conversations.ts'], gaps: [],
    steps: [ask, s('Answer relevant questions', 'Choose Regular cycles; answer the headache questions. Choose None for conditions, medicines or allergies when offered.', 'The female-cycling path is selected. Safety questions precede any product recommendation.', 'M-2.1'), review, s('Inspect health profile', 'Open the conversation’s Your health profile action/menu.', 'Confirmed information is shown with its conversation source.', 'M-2.10')],
  },
  {
    id: 'returning', name: 'Returning user consultation', persona: 'Maria', scenario: 'R01', status: 'IMPLEMENTED',
    goal: 'Return to Home with history and start or continue a conversation.', behavior: 'Seeded account and history; responses are scripted.', evidence: ['src/apps/mobile/screens/consultation/Home/', 'src/shared/scenarios/R01-returning-signin.json'], gaps: [],
    steps: [s('Returning Home', 'Inspect the Home summary and Continue option.', 'Past consultation and profile context are available; no onboarding form.', 'M-2.0'), s('Continue or ask', 'Open Continue, or Ask Deborah. If the scripted first consult opens, follow its options.', 'Existing history is preserved and the chosen conversation opens.', undefined, ['Continue → previous conversation', 'Ask → new/scripted consultation']), s('Finish consultation', 'Follow the displayed questions and review any facts before saving.', 'An answer or explicit safety outcome is delivered; previously known basics are reused.')],
  },
  {
    id: 'signin', name: 'Sign in and restore history', persona: 'Maria', scenario: 'S01', status: 'IMPLEMENTED',
    goal: 'Reach returning Home through the sign-in entry.', behavior: 'Any demo credentials and six digits restore R01; no real authentication.', evidence: ['src/apps/mobile/screens/onboarding/CreateProfile/'], gaps: [],
    steps: [s('Sign in', 'Wait for Welcome and choose Sign in. Enter maria@example.com and demo-password-1.', 'Sign-in mode has no confirm-password field.', 'M-1.4'), s('Verify demo code', 'Submit and enter 444444.', 'Returning Home and R01 history load; onboarding does not appear.', 'M-2.0')],
  },
  ...(['save', 'edit', 'discard'] as const).map((action): ManualJourney => ({
    id: `review-${action}`, name: `Review facts — ${action}`, persona: 'Elena', scenario: 'S19', status: 'IMPLEMENTED',
    goal: `Verify ${action} behavior for pending health facts.`, behavior: 'Seeded answer with three pending facts; writes remain local.',
    evidence: ['src/apps/mobile/screens/consultation/ReviewFacts/', 'src/shared/store/slices/conversations.ts'], gaps: [],
    steps: [s('Inspect pending facts', 'Read the Review and Confirm card.', 'Three facts are pending, not yet confirmed.', 'M-2.1'),
      ...(action === 'edit' ? [s('Edit a fact', 'Choose Edit, open a fact, select a different value, then Use this.', 'The revised value remains pending until Save.', 'M-2.13')] : []),
      s('Resolve review', action === 'discard' ? 'Choose Don’t save.' : 'Choose Save to my profile.', action === 'discard' ? 'Pending facts are discarded; existing profile fields are unchanged.' : 'Selected facts reach the correct profile and carry a confirmation source.'),
      s('Check resulting profile', 'Open Your health profile from the chat header/menu.', 'The profile agrees with the choice you made. Discarded facts do not appear as confirmed.', 'M-2.10')],
  })),
];
