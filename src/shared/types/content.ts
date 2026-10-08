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
  terms: LegalDoc;
  privacy: LegalDoc;
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
}

export interface IntakeData {
  questions: IntakeQuestion[];
  maxQuestions: number;
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
  escalation: { triggers: { unresolvedConsultations: number; phrases: string[] }; body: string; status: ContentStatus };
  /** Canonical phrases inserted by the S13 safety test bench. */
  testPhrases: Record<'emergency' | 'medication' | 'crisis' | 'outOfScope' | 'escalation', string>;
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
