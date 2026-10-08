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

export const SEEDS: Record<string, ScenarioSeed> = Object.fromEntries(
  ([s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13] as ScenarioSeed[]).map((s) => [s.id, s]),
);

export const SCENARIO_GROUPS: ScenarioGroup[] = [
  'Onboarding',
  'Trial',
  'Conversion',
  'Return',
  'Family',
  'Subscriber',
  'Booking',
  'QA',
];

export const SCENARIOS: ScenarioMeta[] = [
  { id: 'S01', label: 'New user — first launch', group: 'Onboarding', description: 'Empty store.', startsAt: 'M-1.1 Splash', phase: 2 },
  { id: 'S02', label: 'Onboarded — first home', group: 'Trial', description: 'Maria has accepted consent. No consultations yet. Lands on Home with the greeting sheet.', startsAt: 'M-2.0', phase: 2 },
  { id: 'S03', label: 'Mid-intake', group: 'Trial', description: 'First message about hot flashes and sleep; Deborah asked her first question.', startsAt: 'M-2.1 (intake)', phase: 3 },
  { id: 'S04', label: 'First answer delivered', group: 'Trial', description: 'One counted consultation with a full seven-section answer. Follow-up not set.', startsAt: 'M-2.1 (answered)', phase: 3 },
  { id: 'S05', label: 'Last free consultation', group: 'Trial', description: 'Two of three free consultations used.', startsAt: 'M-2.1 (empty), 1 left', phase: 3 },
  { id: 'S06', label: 'Trial exhausted', group: 'Conversion', description: 'All three free consultations used. The free-limit sheet shows; any new question is held until a plan is chosen.', startsAt: 'M-2.1 + M-4.1 sheet', phase: 5 },
  { id: 'S07', label: 'Subscriber — follow-up due', group: 'Return', description: 'Individual plan, one consultation two weeks ago. A follow-up reminder is waiting on the lock screen.', startsAt: 'M-5.1 Lock screen', phase: 5 },
  { id: 'S08', label: 'Labs reviewed', group: 'Return', description: 'Labs confirmed, lab-informed answer delivered, 90-day plan on day 18.', startsAt: 'M-7.2 My Health', phase: 6 },
  { id: 'S09', label: 'Family plan — daughter added', group: 'Family', description: 'Family plan with Maria and her teen daughter, whose conversation has started.', startsAt: 'M-2.1 as Daughter', phase: 6 },
  { id: 'S10', label: 'Individual plan — wants family', group: 'Family', description: 'Individual plan with one profile. The profile switcher is open.', startsAt: 'M-6.1 sheet', phase: 6 },
  { id: 'S11', label: 'My Health — empty', group: 'Subscriber', description: 'Signed in on a new device: plan active, no history.', startsAt: 'M-7.1 My Health', phase: 6 },
  { id: 'S12', label: 'Escalation ready', group: 'Booking', description: 'Three consultations on the same topic. The next message offers booking Deborah.', startsAt: 'M-2.1', phase: 6 },
  { id: 'S13', label: 'Safety test bench', group: 'QA', description: 'Trial 1/3 with quick inserts for emergency, medication, crisis and out-of-scope phrases.', startsAt: 'M-2.1', phase: 4 },
];

export const DEFAULT_SCENARIO_ID = 'S01';

export function isLoadable(id: string): boolean {
  return id in SEEDS;
}

export function findScenario(id: string | null | undefined): ScenarioMeta | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
