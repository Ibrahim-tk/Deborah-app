/**
 * Scenario catalogue (docs/05-state-and-scenarios.md §3). Read by the shell State menu.
 * A scenario is loadable once its seed exists in SEEDS; `phase` says when the rest arrive.
 */
import type { ScenarioGroup, ScenarioMeta, ScenarioSeed } from '../types/scenario';
import s01 from './S01-new-user.json';
import s02 from './S02-onboarded-empty.json';
import s03 from './S03-mid-intake.json';
import s04 from './S04-first-answer.json';
import s05 from './S05-last-free.json';
import s06 from './S06-trial-exhausted.json';
import s07 from './S07-followup-due.json';
import s08 from './S08-labs-reviewed.json';
import s09 from './S09-family-daughter.json';
import s10 from './S10-individual-wants-family.json';
import s11 from './S11-myhealth-empty.json';
import s12 from './S12-escalation-ready.json';
import s13 from './S13-safety-bench.json';
import s14 from './S14-cycling-headaches.json';
import s15 from './S15-peri-meds-unknown.json';
import s16 from './S16-pregnant.json';
import s17 from './S17-stage-not-sure.json';
import s18 from './S18-male-52.json';
import s19 from './S19-facts-to-confirm.json';
// Also what "Sign in" (M-1.4) restores for a returning user.
import r01 from './R01-returning-signin.json';
import s20 from './S20-teen-onboarding.json';
import s21 from './S21-partner-onboarding.json';
import s22 from './S22-provider-review.json';
import s23 from './S23-guidance-early.json';
import s24 from './S24-visit-brief.json';
import s24b from './S24b-visit-brief-gate.json';
import s24c from './S24c-visit-brief-urgent.json';
import s25 from './S25-visit-debrief.json';
import s25b from './S25b-visit-log-anytime.json';
import s25c from './S25c-visit-logged.json';
import s25d from './S25d-visit-safety.json';
import s26c from './S26c-documents-chat-prompt.json';
import s27 from './S27-teen-invite-parent.json';
import s28 from './S28-teen-invite-received.json';

export const SEEDS: Record<string, ScenarioSeed> = Object.fromEntries(
  ([s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23, s24, s24b, s24c, s25, s25b, s25c, s25d, s26c, s27, s28, r01] as unknown as ScenarioSeed[]).map((s) => [s.id, s]),
);

export const SCENARIO_GROUPS: ScenarioGroup[] = [
  'Onboarding',
  'Trial',
  'Conversion',
  'Return',
  'Family',
  'Subscriber',
  'Booking',
  'Journeys',
  'QA',
];

export const SCENARIOS: ScenarioMeta[] = [
  { id: 'S22', label: 'Provider review — facts to confirm', group: 'QA', description: 'A non-emergency concern reported. Save, Edit or Don’t save; then a provider-directed seven-section answer. No product or consultation charge.', startsAt: 'M-2.1 Review and Confirm', phase: 7 },
  { id: 'S20', label: 'Emily — teen onboarding', group: 'Family', description: 'Signed up as Emily. Add Maya, 15, through dependent onboarding; no separate teen login or invitation.', startsAt: 'M-1.8 Onboarding profile', phase: 7 },
  { id: 'S21', label: 'Helen — adult partner onboarding', group: 'Family', description: 'Signed up as Helen. Add James, 52, with adult agreement; no separate adult login or invitation.', startsAt: 'M-1.8 Onboarding profile', phase: 7 },
  { id: 'S27', label: 'Family plan — invite your teen', group: 'Family', description: 'Maria on a Family Plan. Family profiles › Invite your teen to their own account: privacy disclaimer, teen’s email, invitation sent.', startsAt: 'M-6.6 Family profiles', phase: 7 },
  { id: 'S28', label: 'Teen — invitation received', group: 'Family', description: 'Maya tapped Finish Sign Up in the invitation email (Email tab). Finish sign-up: name, age, password with the email locked, Your Oracle for teens, health basics. No subscription, products, Wellness Plan or consent revoke.', startsAt: 'M-1.2 Welcome (invite)', phase: 7 },
  { id: 'S01', label: 'New user — first launch', group: 'Onboarding', description: 'Someone opening the app for the very first time: Welcome, sign-up sheet, onboarding profile, the Oracle’s welcome, first conversation.', startsAt: 'M-1.1 Splash', phase: 2 },
  { id: 'S03', label: 'Signed up — onboarding profile', group: 'Onboarding', description: 'Account created. The onboarding profile is open: who it’s for (Myself, or someone you care for → relationship, name, consent by age), date of birth, sex at birth, gender identity, then age×gender intake.', startsAt: 'M-1.8 Onboarding profile', phase: 2 },
  { id: 'S02', label: 'Basic details done — the Oracle’s welcome', group: 'Onboarding', description: 'Profile already says perimenopausal. Home with the Oracle’s welcome sheet; Start chatting opens the first conversation.', startsAt: 'M-2.0 + M-1.9 sheet', phase: 2 },
  { id: 'S04', label: 'First answer delivered', group: 'Trial', description: 'Health profile on file; one counted consultation with a full seven-section answer and What’s next rows. Follow-up not set.', startsAt: 'M-2.1 (answered)', phase: 3 },
  { id: 'S23', label: 'Guidance — early first look', group: 'QA', description: 'Mid-intake on hot flashes. Tap Tell me what you think for an early first look (uncounted), then finish questions for full guidance.', startsAt: 'M-2.1 (intake)', phase: 7 },
  { id: 'S24', label: 'My Visit Notes — provider brief', group: 'QA', description: 'Full guidance on file. Opens My Visit Notes (M-9.7): review chief complaint, save a copy, download PDF, then appointment follow-up.', startsAt: 'M-9.7 My Visit Notes', phase: 7 },
  { id: 'S24b', label: 'My Visit Notes — not enough detail', group: 'QA', description: 'Mid-intake (no full guidance). Visit Notes / Save PDF shows “Let’s talk first — download turned off”.', startsAt: 'M-2.1 (intake)', phase: 7 },
  { id: 'S24c', label: 'My Visit Notes — urgent', group: 'QA', description: 'Provider-directed answer after a red flag (no What’s next, no product). Tap Visit Notes on the answer: My Visit Notes opens with the urgent priority flag.', startsAt: 'M-2.1 (answered, urgent)', phase: 7 },
  { id: 'S25', label: 'Log your visit — after the appointment', group: 'QA', description: 'Provider brief saved; appointment was yesterday. Lock screen with the day-after notification (visit:<brief>). Tap it: the visit debrief opens linked to that brief. Home also shows “How did your visit go?”.', startsAt: 'M-5.1 Lock screen', phase: 7 },
  { id: 'S25b', label: 'Log your visit — anytime', group: 'QA', description: 'No provider brief. Opens the visit debrief directly; Records › New note › Log a provider visit does the same.', startsAt: 'M-2.1 Visit debrief', phase: 7 },
  { id: 'S25c', label: 'Log your visit — already logged', group: 'QA', description: 'A gynecology visit is saved as an after-visit note. Records › Visit Notes reopens it in read mode (M-9.8).', startsAt: 'M-9.1 Records', phase: 7 },
  { id: 'S25d', label: 'Log your visit — safety', group: 'QA', description: 'Brief saved. During the debrief, ask “Should I stop taking my magnesium?” — the medication safety response appears and nothing is logged as a change.', startsAt: 'M-2.1 Visit debrief', phase: 7 },
  { id: 'S26c', label: 'Documents — the Oracle offers an upload', group: 'QA', description: 'A lab result was saved with Not now. The next chat opens with “You uploaded … Want to talk it through?” (documents phase 4).', startsAt: 'M-2.0 Home', phase: 7 },
  { id: 'S05', label: 'Last free consultation', group: 'Trial', description: 'Two of three free consultations used.', startsAt: 'M-2.1 (empty), 1 left', phase: 3 },
  { id: 'S06', label: 'Trial exhausted', group: 'Conversion', description: 'All three free consultations used. The free-limit sheet shows; any new question is held until a plan is chosen.', startsAt: 'M-2.1 + M-4.1 sheet', phase: 5 },
  { id: 'R01', label: 'Returning — signed in', group: 'Return', description: 'Signed back in: health profile on file, a consultation from 3 days ago. Home shows Continue; Ask Oracle plays the 2am heart-flutter demo.', startsAt: 'M-2.0 Home', phase: 2 },
  { id: 'S07', label: 'Subscriber — follow-up due', group: 'Return', description: 'Individual plan, one consultation two weeks ago. A follow-up reminder is waiting on the lock screen.', startsAt: 'M-5.1 Lock screen', phase: 5 },
  { id: 'S08', label: 'Labs reviewed', group: 'Return', description: 'Labs confirmed, lab-informed answer delivered, 90-day plan on day 18.', startsAt: 'M-7.2 My Health', phase: 6 },
  { id: 'S09', label: 'Family plan — child added', group: 'Family', description: 'Family plan with Maria and her teen child, whose conversation has started.', startsAt: 'M-2.1 as Child', phase: 6 },
  { id: 'S10', label: 'Individual plan — wants family', group: 'Family', description: 'Individual plan with one profile. The profile switcher is open.', startsAt: 'M-6.1 sheet', phase: 6 },
  { id: 'S11', label: 'My Health — empty', group: 'Subscriber', description: 'Signed in on a new device: plan active, no history.', startsAt: 'M-7.1 My Health', phase: 6 },
  { id: 'S12', label: 'Escalation ready', group: 'Booking', description: 'Three consultations on the same topic. The next message offers booking the Oracle.', startsAt: 'M-2.1', phase: 6 },
  { id: 'S14', label: 'Sarah, 28 — headaches', group: 'Journeys', description: 'Persona 1. Female, stage unknown. Type “I’ve been having headaches lately”: stage asked in chat, then cycling × body clarifiers, red flags, answer, Review and Confirm.', startsAt: 'M-2.1 (empty)', phase: 7 },
  { id: 'S15', label: 'Perimenopause — medicines unknown', group: 'Journeys', description: 'Maria, 48, perimenopausal; medications and allergies not on file. Ask about sleep: peri clarifiers, then the medication gate before the product.', startsAt: 'M-2.1 (empty)', phase: 7 },
  { id: 'S16', label: 'Pregnant', group: 'Journeys', description: 'Ana, 32, pregnant. Any topic: the shared pregnancy questions, no medication gate, no product card.', startsAt: 'M-2.1 (empty)', phase: 7 },
  { id: 'S17', label: 'Stage not sure', group: 'Journeys', description: 'Rosa, 45, said “not sure”. Ask about hot flashes: last-period question, the stage is noted, then the matching journey’s questions.', startsAt: 'M-2.1 (empty)', phase: 7 },
  { id: 'S18', label: 'Male, 52', group: 'Journeys', description: 'James, no medicines. Ask about energy or sleep: male questions plus the 40–54 extra, male red flags. OPEN: male journey scope.', startsAt: 'M-2.1 (empty)', phase: 7 },
  { id: 'S19', label: 'Facts to confirm', group: 'Journeys', description: 'An answered conversation with three facts waiting: Save, Edit (M-2.13) or Don’t save. Nothing is on the profile until you confirm.', startsAt: 'M-2.1 (answered)', phase: 7 },
  { id: 'S13', label: 'Safety test bench', group: 'QA', description: 'Trial 1/3 with quick inserts for emergency, medication, crisis, out-of-scope and uncovered (cataract) phrases.', startsAt: 'M-2.1', phase: 4 },
];

export const DEFAULT_SCENARIO_ID = 'S01';

export function isLoadable(id: string): boolean {
  return id in SEEDS;
}

export function findScenario(id: string | null | undefined): ScenarioMeta | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
