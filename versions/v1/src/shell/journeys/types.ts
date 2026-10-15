/** Shell-only manual QA definitions; product behavior remains in the application. */
export type Implementation = 'IMPLEMENTED' | 'PARTIALLY IMPLEMENTED' | 'NOT IMPLEMENTED';
export type Verdict = 'untested' | 'passed' | 'failed' | 'blocked';
export interface JourneyStep {
  title: string;
  action: string;
  expected: string;
  screen?: string;
  branches?: string[];
}
export interface ManualJourney {
  id: string;
  name: string;
  persona: string;
  goal: string;
  scenario?: string;
  status: Implementation;
  behavior: string;
  evidence: string[];
  gaps: string[];
  steps: JourneyStep[];
}
export const step = (title: string, action: string, expected: string, screen?: string, branches?: string[]): JourneyStep =>
  ({ title, action, expected, screen, branches });
