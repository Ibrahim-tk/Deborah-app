/** Scenario types (docs/05-state-and-scenarios.md §3–4). */
import type { Conversation, ID } from './domain';

export type ScenarioGroup =
  | 'Onboarding'
  | 'Trial'
  | 'Conversion'
  | 'Return'
  | 'Family'
  | 'Subscriber'
  | 'Booking'
  /** Core experience paths (plan C-21): one per journey and decision node. */
  | 'Journeys'
  | 'QA';

export type TabId = 'ask' | 'health' | 'account';

/** Where the navigator lands after a scenario loads. */
export type ScenarioStart =
  | {
      kind: 'screen';
      root: 'preauth' | 'main';
      tab?: TabId;
      stack: string[];
      sheet?: string;
      modal?: string;
      /** Route params by screen id (the internal Screens menu opens screens that need an id). */
      params?: Record<string, Record<string, string | number | boolean | undefined>>;
    }
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
  /** Fields merged onto the replayed conversation (S24c: urgent / provider-review). */
  patch?: Partial<Pick<Conversation, 'redFlag' | 'noProduct' | 'providerReview'>>;
}

export interface ScenarioSeed {
  id: string;
  now: string;
  start: ScenarioStart;
  /** Deep-merged onto store defaults. */
  state: Record<string, unknown>;
  conversations?: Record<ID, ScenarioConversationSeed>;
}
