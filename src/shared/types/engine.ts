/** Engine contract (docs/07-ai-simulation.md §1). */
import type { ContentStatus, Conversation, ID, Intake, LabReport, Message, NotificationPermission, PlanTier, Profile, SectionKey } from './domain';

export interface EngineContext {
  profile: Profile;
  conversation: Conversation;
  subscription: { plan: PlanTier; freeConsultationsUsed: number };
  /** Total answers ever completed for this profile (first-answer prompts). */
  answeredCount: number;
  /** Answered consultations for this profile on the conversation's topic (escalation trigger). */
  sameTopicCount: number;
  notificationPermission: NotificationPermission;
  /** Consultations to wait before offering M-2.8 again after "Not now". */
  followUpSnoozeUntil: number;
  flags: { failNext: boolean };
  now: string;
  /** Topic of the profile's most recent answered consultation (check-in memory line). */
  lastTopic?: string;
  /** Latest confirmed lab report for the profile; answers use a script's withLabs variant. */
  labs?: LabReport;
}

export type UserInput =
  | { kind: 'text'; text: string; scriptId?: string }
  | { kind: 'intakeAnswer'; questionId: string; optionIds: string[]; /** Free text typed into an "other" option. */ otherText?: string }
  | { kind: 'skip'; questionId: string }
  | { kind: 'requestAnswer'; retry?: boolean }
  /** Emergency card: "I'm safe — this isn't happening now". */
  | { kind: 'acknowledgeEmergency'; messageId: string }
  /** Deep link `followup:<profileId>` opened the Conversation in check-in mode. */
  | { kind: 'startCheckIn' }
  | { kind: 'checkInReply'; messageId: string; optionId: string }
  /** M-5.4 "Looks right — send to Deborah". */
  | { kind: 'shareLabs'; report: LabReport };

/** Store mutations the bridge applies (kept serialisable). */
export type StoreAction =
  | { type: 'updateIntake'; profileId: ID; patch: Partial<Intake> }
  | { type: 'setConversation'; conversationId: ID; patch: Partial<Conversation> }
  | { type: 'completeConsultation'; conversationId: ID }
  | { type: 'setSummary'; conversationId: ID; summary: string; topic: string }
  | { type: 'createPlanFromAnswer'; profileId: ID; goal: string; habits: string[]; productId?: ID; status?: ContentStatus }
  | { type: 'clearFailNext' }
  /** Archive the current conversation and continue the plan in this new one. */
  | { type: 'startConversation'; conversation: Conversation };

export type StreamField = 'text' | `section:${SectionKey}` | `bullet:${SectionKey}:${number}`;

export type Step =
  | { type: 'delay'; ms: number }
  | { type: 'thinking'; on: boolean; label?: string }
  | { type: 'message'; message: Message }
  | { type: 'patch'; messageId: ID; patch: Partial<Message> }
  | { type: 'stream'; messageId: ID; field: StreamField; text: string; cps: number }
  | { type: 'store'; action: StoreAction }
  /** The bridge presents M-4.1 instead; the user's text stays in the composer. */
  | { type: 'gate'; reason: 'freeLimit' }
  /** Bridge-level prompt after an answer (M-2.8). */
  | { type: 'prompt'; prompt: 'followUpOptIn' }
  | { type: 'error'; retryable: true };

export type EnginePlan = Step[];
