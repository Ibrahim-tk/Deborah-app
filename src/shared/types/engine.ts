/** Engine contract (docs/07-ai-simulation.md §1). */
import type { ContentStatus, Conversation, HealthDocument, ID, Intake, LabReport, Message, Note, NotificationPermission, PendingFact, PlanTier, Profile, SectionKey, VisitOutcome } from './domain';

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
  /** Active concerns, open actions, resolved names, medicines, and visit specialties. */
  healingPlan?: string;
  /** Latest confirmed lab report for the profile; answers use a script's withLabs variant. */
  labs?: LabReport;
  /**
   * F01 health profile in chat. Off for scenario replays so seeded histories stay as they were.
   * `healthConsent` is the separate consent to process health data (not the T&C).
   */
  profileGates?: boolean;
  healthConsent?: boolean;
  /** Region from the device locale ("US"), confirmed in chat before it is stored. */
  region?: string;
  hasAccount?: boolean;
}

export type UserInput =
  | { kind: 'text'; text: string; scriptId?: string }
  | { kind: 'intakeAnswer'; questionId: string; optionIds: string[]; /** Free text typed into an "other" option. */ otherText?: string }
  | { kind: 'skip'; questionId: string }
  | { kind: 'requestAnswer'; retry?: boolean }
  | { kind: 'finishReview' }
  /** Emergency card: "I'm safe — this isn't happening now". */
  | { kind: 'acknowledgeEmergency'; messageId: string }
  /** Deep link `followup:<profileId>` opened the Conversation in check-in mode. */
  | { kind: 'startCheckIn' }
  /** Home "Complete your profile": Deborah asks the onboarding questions straight away. */
  | { kind: 'checkInReply'; messageId: string; optionId: string }
  /** F09c: open the visit debrief, optionally linked to a Step 5 provider-brief note. */
  | { kind: 'startDebrief'; brief?: Note }
  | { kind: 'debriefReply'; messageId: string; optionId: string }
  /** F09c: M-9.8 saved the visit opened from this debrief ("Review and save"). */
  | { kind: 'debriefSaved'; noteId: ID; outcome: VisitOutcome; /** Profile updates applied on Save. */ applied?: number }
  /** M-5.4 "Add Report". `direct` skips session-first (e.g. M-9.5). */
  | { kind: 'shareLabs'; report: LabReport; direct?: boolean }
  /** F11: a document from Documents and reports; `report` is its lab report when type is lab. */
  | { kind: 'shareDocument'; document: HealthDocument; report?: LabReport }
  | { kind: 'offerDocument'; document: HealthDocument }
  /** Composer attachments (photos / files) sent with optional text. */
  | { kind: 'shareAttachments'; attachments: { name: string; src?: string }[]; text?: string }
  | { kind: 'documentOfferReply'; messageId: ID; optionId: string; document?: HealthDocument; report?: LabReport };

/** Store mutations the bridge applies (kept serialisable). */
export type StoreAction =
  | { type: 'updateIntake'; profileId: ID; patch: Partial<Intake> }
  | { type: 'setConversation'; conversationId: ID; patch: Partial<Conversation> }
  | { type: 'completeConsultation'; conversationId: ID }
  | { type: 'setSummary'; conversationId: ID; summary: string; topic: string }
  | { type: 'createPlanFromAnswer'; profileId: ID; goal: string; habits: string[]; productId?: ID; status?: ContentStatus; /** Concern title. The conversation topic, not a diagnosis. */ topic?: string }
  | { type: 'clearFailNext' }
  | { type: 'updateProfile'; profileId: ID; patch: Partial<Profile> }
  | { type: 'acceptHealthConsent' }
  /** DN-13: facts noted in a conversation, waiting for Review and Confirm. Never written to the profile here. */
  | { type: 'proposeFacts'; conversationId: ID; facts: PendingFact[] }
  /** Archive the current conversation and continue the plan in this new one. */
  | { type: 'startConversation'; conversation: Conversation }
  /** Auto-queue a guidance check-in (Miro ~14 days) when notifications are already allowed. */
  | { type: 'scheduleGuidanceFollowUp'; profileId: ID; days: number }
  /** F09c "Looks right, save": the bridge saves the debrief's outcome as an after-visit note. */
  | { type: 'saveDebriefOutcome'; conversationId: ID };

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
