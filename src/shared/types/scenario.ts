/** Scenario types (docs/05-state-and-scenarios.md §3–4). */
import type { ID } from './domain';

export type ScenarioGroup =
  | 'Onboarding'
  | 'Trial'
  | 'Conversion'
  | 'Return'
  | 'Family'
  | 'Subscriber'
  | 'Booking'
  | 'QA';

export type TabId = 'ask' | 'health' | 'account';

/** Where the navigator lands after a scenario loads. */
export type ScenarioStart =
  | { kind: 'screen'; root: 'preauth' | 'main'; tab?: TabId; stack: string[]; sheet?: string; modal?: string }
  | { kind: 'lockScreen' };

export interface ScenarioMeta {
  id: string;
  /** User-facing label shown in the State menu. */
  label: string;
  group: ScenarioGroup;
  /** One-line world description shown under the label. */
  description: string;
  /** Human-readable start point, e.g. "M-1.1 Splash". */
  startsAt: string;
  /** Build phase in which the seed becomes loadable (docs/11-build-plan.md). */
  phase: number;
}

/** `"@script:<id>#<checkpoint>"` expands a topic script to a checkpoint. */
export type ScriptRef = `@script:${string}#${'intake-1' | 'ready' | 'answered'}`;

export interface ScenarioConversationSeed {
  profileId: ID;
  scriptId: string;
  messages: ScriptRef;
  active?: boolean;
  /** Days before `now` the consultation took place. */
  daysAgo?: number;
}

export interface ScenarioSeed {
  id: string;
  now: string;
  start: ScenarioStart;
  /** Deep-merged onto store defaults. */
  state: Record<string, unknown>;
  conversations?: Record<ID, ScenarioConversationSeed>;
}
