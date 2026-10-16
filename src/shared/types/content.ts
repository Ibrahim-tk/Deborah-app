/** Content types for JSON in src/shared/data (docs/06-data-model.md §3). */
import type { AnswerSection, ContentStatus, ID, Option, ProductRef } from './domain';

export interface Persona {
  name: string;
  credentials: string;
  title: string;
  brand: { appName: string; tagline: string; byline: string };
  yearsPractice: number;
  shortBio: string;
  welcomeNote: string;
  /** M-7.6 About Deborah. OPEN: approved bio. */
  credentialsLine: string;
  philosophy: string[];
  books: { title: string; year: number; note: string }[];
  portrait: string;
  voice: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    openingQuestion: string;
    welcomeBack: string;
    /** Empty state when asking for another profile (M-6.2 → M-2.1). */
    greetingOther: string;
    welcomeBackOther: string;
    answerLead: string;
    reviewing: string[];
  };
  status: ContentStatus;
}

export interface LegalDoc {
  title: string;
  body: string[];
}

export interface Consent {
  version: string;
  summaryBullets: string[];
  aiDisclosure: string;
  aiDisclosureShort: string;
  /** One line above the first chat, shown once (F01). */
  careLine: string;
  terms: LegalDoc;
  privacy: LegalDoc;
  /** Consent for a profile set up for someone else, by age group (plan P-01). `{name}` is theirs. */
  profileConsent: {
    status: ContentStatus;
    open: string;
    title: string;
  } & Record<'child' | 'teen' | 'adult', { body: string; check: string }>;
  status: ContentStatus;
}

export interface Suggestion {
  id: string;
  text: string;
  scriptId: string;
}

export interface SuggestionsData {
  default: Suggestion[];
  teen: Suggestion[];
  status: ContentStatus;
}

export interface IntakeQuestion {
  id: string;
  prompt: string;
  options: Option[];
  multi: boolean;
  /** Dot path into Profile, e.g. "intake.ageBand". */
  profileField: string;
  skipIfKnown: boolean;
  /** 2-column grid for short answers (DESIGN.md › Option rows). */
  layout?: 'list' | 'grid2';
  /**
   * Field-style answer: date / year / height / weight wheels, or `text` = composer-only
   * (F02d — no inline type-invite pills).
   */
  input?: 'date' | 'measure' | 'year' | 'height' | 'weight' | 'text';
  noSkip?: boolean;
  hideStep?: boolean;
  /**
   * How the answer looks inline in the chat (progressive intake, design direction 2026-10-12):
   * pills = yes/no and short single answers · quiz = numbered card for lists with "Other".
   */
  presentation?: 'pills' | 'quiz';
  /**
   * F02d: after tapping `yes` on the gate options, show these pills (multi) instead of an
   * inline type form. Include `{ id: "other" }` to route typing to the bottom composer.
   */
  expandOptions?: Option[];
  /** Core experience bank: asked only when the profile matches. */
  showIf?: ShowIf;
  /** DN-11: the red-flag screen; any option except "none" stops the hormone-only answer. */
  redFlags?: boolean;
  /** Unresolved product question quoted from the spec (kept next to the content). */
  open?: string;
}

/** Core experience question bank (data/conversation/chatIntake.json). */
export interface ChatJourney {
  id: import('./domain').JourneyId;
  /** Symptom group (or `general`) → clarifier ids in priority order. */
  clarifiers?: Partial<Record<import('./domain').SymptomGroupId | 'general', string[]>>;
  /** Reuse another journey's clarifiers. */
  extends?: import('./domain').JourneyId;
  /** Age-specific question that replaces the lowest-priority clarifier (F02b 4d). */
  extra?: string;
  /** Re-plan once the stage this journey asks for is known (F02b 3e). */
  reroute?: boolean;
  noProduct?: boolean;
  redFlags: string;
  note?: string;
}

export interface ChatIntakeData {
  status: ContentStatus;
  maxClarifiers: number;
  groups: { id: import('./domain').SymptomGroupId; title: string; match: string[] }[];
  missingBasics: { questionId: string; showIf?: ShowIf }[];
  journeys: ChatJourney[];
  questions: IntakeQuestion[];
  redFlagReply: string;
  factLabels: Record<string, string>;
}

export interface IntakeData {
  questions: IntakeQuestion[];
  maxQuestions: number;
  /** Asked before any answer that recommends a supplement or medication (F01). */
  safetyGates: string[];
  /** Asked once, in order, at the start of the first consultation (onboarding through conversation). */
  onboarding?: string[];
  status: ContentStatus;
}

export interface ScriptAnswer {
  sections: AnswerSection[];
  product?: ProductRef;
  closingLine: string;
  habitsForPlan: string[];
  goal: string;
  summary: string;
}

export interface ScriptFollowUp {
  match: string[];
  reply: string;
}

/** Section overrides merged into the answer when the profile has confirmed labs. */
export interface ScriptVariant {
  sections: { key: AnswerSection['key']; body?: string; bullets?: string[] }[];
}

export interface Script {
  id: string;
  topic: string;
  match: string[];
  intake: string[];
  /** Canned dictation used by the simulated mic. */
  voiceSample: string;
  /** Used when a scenario replays the script from the start. */
  openingMessage: string;
  readyLine: string;
  suggestedQuestions: string[];
  answer: ScriptAnswer;
  /** The answer is about the shared lab report itself (lab-review). */
  usesLabs?: boolean;
  variants?: { withLabs?: ScriptVariant };
  followUps: ScriptFollowUp[];
  fallbackReply: string;
  status: ContentStatus;
}

export interface Product {
  id: ID;
  name: string;
  tagline: string;
  description: string;
  image: string;
  url: string;
  price: string;
  disclosure: string;
  status: ContentStatus;
}

export interface GuardrailsData {
  emergency: { patterns: string[]; title: string; body: string; acknowledgedReply: string; status: ContentStatus };
  crisis: {
    patterns: string[];
    body: string;
    lifeline: { label: string; tel: string };
    gentleReply: string;
    moreSupport: string[];
    status: ContentStatus;
  };
  medication: { patterns: string[]; body: string; interactionLink: { label: string; url: string }; status: ContentStatus };
  outOfScope: { patterns: string[]; body: string; status: ContentStatus };
  /** Miro Step 4: enough context but concern not in Deborah’s approved knowledge — team handoff (uncounted). */
  uncovered: { patterns: string[]; body: string; status: ContentStatus };
  escalation: { triggers: { unresolvedConsultations: number; phrases: string[] }; body: string; status: ContentStatus };
  /** Canonical phrases inserted by the S13 safety test bench. */
  testPhrases: Record<'emergency' | 'medication' | 'crisis' | 'outOfScope' | 'escalation' | 'uncovered', string>;
}

/** F05 check-in conversation copy (conversation/checkin.json). */
export interface CheckInScript {
  opening: string;
  openingNoTopic: string;
  options: Option[];
  replies: Record<'yes' | 'partly' | 'partlyFollowUp' | 'notYet' | 'labsNotYet' | 'restartPlan' | 'talk', string>;
  labRequest: string;
  labRequestNotYet: Option;
  notYetOptions: Option[];
  status: ContentStatus;
}

/** commerce/plans.json (docs/06-data-model.md §3). */
export interface PlanOption {
  id: 'individual' | 'family' | 'premium';
  name: string;
  monthly: number;
  annual: number;
  features: string[];
  profiles: number;
  recommended?: boolean;
}

/** labs/sample-reports.json: what the simulated extractor returns. */
export interface LabSample {
  labName: string;
  /** Days before "now" the sample was collected. */
  collectedDaysAgo: number;
  values: { marker: string; value: string; unit: string }[];
}

export interface LabMarker {
  marker: string;
  unit: string;
}

/** content/library.json — Deborah's library (docs/06-data-model.md §3). */
export interface LibraryItem {
  id: string;
  type: 'video' | 'article' | 'lesson';
  title: string;
  summary: string;
  /** Article / lesson text column (M-7.4). */
  body?: string[];
  topics: string[];
  durationMin: number;
  publishedAt: string;
  /** Teen-appropriate content shown for minor profiles. */
  audience?: 'adult' | 'teen' | 'all';
  relatedProductId?: string;
  status: ContentStatus;
}

/** booking/slots.json (docs/ux/F08-book-deborah.md). Times are offered per weekday from the simulated clock. */
export interface BookingInfo {
  durationMin: number;
  /** OPEN: price — null shows "Price shown at checkout". */
  price: number | null;
  format: string;
  prepare: string[];
  /** Empty = accept every state (prototype). */
  statesLicensed: string[];
  states: string[];
  dailyTimes: string[];
  /** [weekday 0–6, "HH:MM"] pairs shown greyed out. */
  unavailable: [number, string][];
  status: ContentStatus;
}

/** Sign-up health basics (data/intake/healthBasics.json): conditional question map. */
/**
 * `in` / `notIn` match one value · `has` / `lacks` match a list value (any of) · `min` / `max` bound a
 * number (age) · `unknown: true` passes only while the key has no answer.
 */
export type ShowIf = Record<string, { in?: string[]; notIn?: string[]; has?: string[]; lacks?: string[]; min?: number; max?: number; unknown?: boolean }>;
export type HealthBasicsKind = 'date' | 'year' | 'measure' | 'choice' | 'text' | 'profileFor' | 'name' | 'consent';
/** How the step control is rendered; omitted steps fall back from `kind`. */
export type HealthBasicsPresentation = 'pills' | 'rows' | 'yesNo' | 'chips' | 'namedReasons';
export interface HealthBasicsStep {
  key: string;
  kind: HealthBasicsKind;
  title: string;
  /** Title when the profile is for someone else; `{name}` is their first name. */
  titleOther?: string;
  /** Quiz control shape: yesNo/rows → FullChoicePills; pills → QuestionChoices; chips → ChipPicker; namedReasons → add pill → Sheet (name+reason) → tiles. */
  presentation?: HealthBasicsPresentation;
  /** namedReasons: placeholder for the name field. */
  namePlaceholder?: string;
  /** namedReasons: placeholder for the reason field. */
  reasonPlaceholder?: string;
  choices?: { value: string; label: string }[];
  placeholder?: string;
  /** Text steps: the one-tap empty answer. */
  none?: string;
  /** Text steps: common answers, one tap to add or remove; each can be conditional too. */
  suggestions?: { label: string; showIf?: ShowIf }[];
  /** Text steps: one answer only — a tap (or Other) replaces the current pick. */
  single?: boolean;
  optional?: boolean;
  /**
   * Choice steps: selecting this value keeps the screen open and shows an inline describe field
   * (stored under `describeKey`) instead of advancing immediately.
   */
  describeValue?: string;
  /** Answer key for the optional free text when `describeValue` is selected. */
  describeKey?: string;
  /** Accessible label for the inline describe field. */
  describeLabel?: string;
  /** Placeholder for the inline describe field. */
  describePlaceholder?: string;
  /**
   * Choice steps: selecting any of these values stays on screen and reveals a second FullChoicePills
   * (choices from the step named by `expandKey`, or `expandChoices` inline). Used when more than one
   * option needs a follow-up box (e.g. HRT Yes / Yes Previously → type).
   */
  expandValues?: string[];
  /** Answer key (and usually the inline step key) for the follow-up choice. */
  expandKey?: string;
  /** Title for the follow-up pills when not reading from another step. */
  expandTitle?: string;
  /** Follow-up options when not reading from another step. */
  expandChoices?: { value: string; label: string }[];
  /**
   * When true, this step is never shown as its own screen — its choices are revealed inline under
   * another step via `expandKey` (e.g. hrtType under hrtStatus).
   */
  inline?: boolean;
  /** Hidden unless every listed answer matches. */
  showIf?: ShowIf;
}
export interface HealthBasicsData {
  status: string;
  steps: HealthBasicsStep[];
}
