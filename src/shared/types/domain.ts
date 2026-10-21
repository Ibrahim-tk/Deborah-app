/** Domain types (docs/06-data-model.md §2). */
import type { HealthProfile, IntakeProgress } from './health';

export type ID = string;
export type ISODate = string;

export type ContentStatus = 'placeholder' | 'handbook' | 'approved';

export type PlanTier = 'trial' | 'individual' | 'family' | 'premium';
export type Billing = 'monthly' | 'annual';
/** `daughter` / `son` are legacy aliases; new intake saves `child`. */
export type Relationship = 'self' | 'child' | 'daughter' | 'son' | 'partner' | 'parent' | 'other';
export type NotificationPermission = 'unknown' | 'granted' | 'denied';

/** Core experience age groups (DN-03): sign-up and chat behave differently for each. */
export type AgeGroup = 'child' | 'teen' | 'adult';

/** DN-07: journey symptom groups (chatIntake.json); the Symptoms sheet may list more. */
export type SymptomGroupId = 'sleep' | 'temperature' | 'mood' | 'cycle' | 'weight' | 'body';

/** DN-08: which question bank a consultation uses (docs/ux/F02b-profile-aware-chat-intake.md). */
export type JourneyId =
  | 'female-cycling'
  | 'female-peri'
  | 'female-post'
  | 'female-pregnant'
  | 'female-unsure'
  | 'male-under-40'
  | 'male-40-54'
  | 'male-55-plus'
  | 'teen'
  | 'child';

/** A fact Deborah noted in a conversation, waiting for the user's Confirm (DN-13). */
export interface PendingFact {
  id: ID;
  /** Profile field it fills (`medications`, `reproductive`…); one pending fact per key. */
  key: string;
  /** The question that asked for it, so Edit can offer the same options. */
  questionId?: string;
  label: string;
  /** What the user sees, e.g. "Levothyroxine". */
  value: string;
  /** Applied to the profile only when confirmed. */
  patch: { intake?: Partial<Intake>; profile?: Partial<Profile> };
  /** `answer` = she answered Deborah's question · `message` = picked up from what she typed. */
  source: 'answer' | 'message';
  status: 'pending' | 'confirmed' | 'discarded';
}

export interface ConfirmedFact {
  key: string;
  label: string;
  value: string;
  conversationId: ID;
  confirmedAt: ISODate;
}

export type AgeBand = 'under-40' | '40-45' | '46-50' | '51-55' | '56+' | 'teen';
export type Cycle = 'regular' | 'irregular' | 'stopped' | 'unknown';

export interface Intake {
  ageBand?: AgeBand;
  conditions: string[];
  medications: string[];
  cycle?: Cycle;
  /** Teen bank: how long periods have been happening (docs/ux/F06-family-profiles.md › 6.4). */
  onset?: string;
  notes?: string;
  /** Safety gate (F01 health profile): allergy groups, or ['none']. */
  allergies?: string[];
  /** Onboarding (in chat): who the profile is for. */
  profileFor?: 'self' | 'dependent';
  /** Onboarding (in chat): hormonal / reproductive status. */
  reproductive?: string;
  /** Onboarding form (M-1.8 V2): gender identity when distinct from sex at birth. */
  genderIdentity?: string;
  /** Onboarding form: preferred pronouns (e.g. she/her, he/him, they/them, or custom). */
  pronouns?: string;
  /** Trans teen branch: trans-woman | trans-man. */
  transIdentity?: string;
  /** Optional puberty notes from the teen development free-text step. */
  pubertyNotes?: string;
  /** When puberty started (free text: age or year). */
  pubertyStart?: string;
  /** Male adult bank: fertility or reproductive concerns (yes | no). */
  fertilityConcerns?: string;
  /** Genesis Gold product question from the meds block. */
  genesisGold?: 'yes' | 'no';
  /** Female hormonal nest: Have your periods started? (yes | no | describe). */
  periodsStarted?: string;
  /** Optional free text when periodsStarted is describe. */
  periodsNotes?: string;
  /** Peri-menopausal nest: Currently on HRT? (yes | yes-previously | no). */
  hrtStatus?: string;
  /** HRT type when on or previously on HRT (placeholder labels). */
  hrtType?: string;
  /** Parent / guardian names collected on a child (under-13 dependent) profile. */
  guardianNames?: string;
  /** Free-text when relationship is `other` (“Someone else” → describe). */
  relationshipOther?: string;
  /** ISO 3166 region confirmed in chat; inferred from the device locale. */
  country?: string;
  /** Asked only when relevant to the topic (e.g. thyroid): free text with units. */
  height?: string;
  weight?: string;
  /** Core experience facts (confirmed through Review and Confirm). Symptoms are labels, merged. */
  symptoms?: string[];
  birthControl?: string;
  menopauseSince?: string;
  boneScan?: string;
  testosteroneChecked?: string;
  psaCheck?: string;
  /** Ask Dibora session answers (pending until Review and Confirm). */
  mainConcern?: string;
  /** How long the main concern has been going on — printed as the Chief Complaint duration line. */
  concernDuration?: string;
  otherIssues?: string;
  healthGoal?: string;
  newMeds?: string;
  /** Complete Intake shell (M-2.14) — placeholder sections until Dropbox questionnaires arrive. */
  familyHistory?: string;
  lifestyleSleep?: string;
  lifestyleStress?: string;
  lifestyleActivity?: string;
  lifestyleDiet?: string;
  otherMedical?: string;
  /** Resume key for Complete Intake sections. */
  completeIntakeSection?: string;
}

export interface Profile {
  id: ID;
  name: string;
  relationship: Relationship;
  dob?: ISODate;
  sexAtBirth?: 'female' | 'male' | 'intersex';
  intake: Intake;
  /** Intake V2: structured health profile with per-field source (types/health.ts). */
  health?: HealthProfile;
  intakeV2?: IntakeProgress;
  createdAt: ISODate;
  guardianConsentAt?: ISODate;
  /** Set up by someone else in onboarding or M-6.2: which consent they gave, by age group (plan P-01). */
  consent?: { path: 'adult-agreement' | 'guardian-teen' | 'guardian-child'; attestedAt: ISODate; attestedBy?: ID };
  /** DN-14: facts the user confirmed from a conversation (shown on the My Health Health profile card, M-7.2). */
  confirmedFacts?: ConfirmedFact[];
}

export type MessageRole = 'user' | 'deborah' | 'system';
export type MessageKind =
  | 'text'
  | 'intakeQuestion'
  | 'answer'
  | 'thinking'
  | 'error'
  | 'emergency'
  | 'medicationSafety'
  | 'crisis'
  | 'outOfScope'
  | 'escalation'
  | 'checkIn'
  | 'labRequest'
  | 'followUpPrompt'
  /** F11: Deborah offers an upload saved with "Not now" (once). */
  | 'documentOffer'
  /** Review and Confirm (meeting 2026-10-12 · B): facts noted in this conversation, saved only on Confirm. */
  | 'reviewFacts';

export interface Option {
  id: string;
  label: string;
}

export interface IntakeMeta {
  questionId: string;
  options: Option[];
  multi: boolean;
  step: number;
  of: number;
  answered?: string[];
  skipped?: boolean;
  /** Field-style answer: wheels, or `text` = composer-only (F02d). */
  input?: 'date' | 'measure' | 'year' | 'height' | 'weight' | 'text';
  /** Consent and confirmations can't be skipped and don't count as numbered steps. */
  noSkip?: boolean;
  hideStep?: boolean;
  /**
   * How the answer looks inline in the chat (progressive intake, design direction 2026-10-12):
   * pills = yes/no and short single answers · quiz = numbered card for lists with "Other".
   */
  presentation?: 'pills' | 'quiz';
  /** Shown after gate "Yes" (F02d expand → issue/med pills). */
  expandOptions?: Option[];
  widget?: import('./content').QuestionWidget;
  placeholder?: string;
}

export type SectionKey =
  | 'hearing'
  | 'hypothalamic'
  | 'mayMean'
  | 'providerQuestions'
  | 'tests'
  | 'doNow'
  | 'word';

export const SECTION_ORDER: SectionKey[] = [
  'hearing',
  'hypothalamic',
  'mayMean',
  'providerQuestions',
  'tests',
  'doNow',
  'word',
];

export interface AnswerSection {
  key: SectionKey;
  title: string;
  body: string;
  bullets?: string[];
  /** providerQuestions only: “why I’m asking” per bullet, same order (Visit Notes brief; not shown in chat). */
  bulletWhy?: string[];
  /** tests only: provider-brief tier per bullet, same order (Visit Notes brief; not shown in chat). */
  bulletTiers?: ('primary' | 'also')[];
}

export interface ProductRef {
  productId: ID;
  why: string;
  frame90: string;
}

export interface Answer {
  /** ALWAYS 7, fixed order. */
  sections: AnswerSection[];
  /** Rendered only inside section 6. */
  product?: ProductRef;
  /** Mandatory, always last. */
  closingLine: string;
  labsReferenced?: ID[];
  status: ContentStatus;
}

export interface MessageMeta {
  scriptId?: string;
  streaming?: boolean;
  counted?: boolean;
  /** Section currently streaming inside an answer. */
  activeSection?: SectionKey;
  /** Answer cancelled with Stop: not counted, offers "Continue". */
  stopped?: boolean;
  /** Emergency: the user tapped "I'm safe"; the card collapses to a compact line. */
  acknowledged?: boolean;
  /** Escalation card dismissed with "Not now". */
  dismissed?: boolean;
  /** Demo toast already shown for care-team notify (emergency / crisis). */
  teamNotified?: boolean;
  status?: ContentStatus;
  /** F11: the document a user bubble shares or a documentOffer is about. */
  documentId?: ID;
}

export interface Message {
  id: ID;
  role: MessageRole;
  kind: MessageKind;
  createdAt: ISODate;
  /** Streamed text lands here. */
  text?: string;
  intake?: IntakeMeta;
  answer?: Answer;
  /** Follow-up questions shown under a message. */
  suggestions?: string[];
  /** Option rows under a Deborah message (check-in Yes / Partly / Not yet, lab request). */
  quickReplies?: QuickReplies;
  /** F09c debrief summary card: one line per filled bucket. */
  visitSummary?: { label: string; text: string }[];
  /** User photos / files sent from the composer (design 2026-10-21); `src` previews images. */
  attachments?: { name: string; src?: string }[];
  meta?: MessageMeta;
}

export interface QuickReplies {
  options: Option[];
  /** Option the user picked; the rows then stop being interactive. */
  answered?: string;
}

export type ConversationStatus =
  | 'empty'
  | 'intake'
  | 'ready'
  | 'generating'
  | 'answered'
  | 'error'
  | 'safety'
  /** F05 check-in conversation opened from a follow-up notification. */
  | 'checkin'
  /** F09c visit debrief: Deborah helps log what happened at a provider visit. */
  | 'debrief';

export interface Conversation {
  id: ID;
  profileId: ID;
  scriptId?: string;
  topic?: string;
  status: ConversationStatus;
  messages: Message[];
  startedAt: ISODate;
  countedAt?: ISODate;
  summary?: string;
  /** Transient status line while Deborah works (ProgressStatus). */
  thinking?: string;
  /** Intake questions planned for this consultation (max 3, known fields removed). */
  intakePlan?: string[];
  /** Intake question ids already handled in this consultation (answered or skipped). */
  intakeDone?: string[];
  /** Scripted consultations (F02f): answers so far, by question id (typed text as one entry). */
  intakeAnswers?: Record<string, string[]>;
  archived?: boolean;
  /** Safety state (docs/ux/F03-safety.md). */
  statusBeforeSafety?: ConversationStatus;
  /** Crisis shown: no product cards for the rest of this conversation. */
  noProduct?: boolean;
  /** Crisis shown: the next Deborah reply is gentle and short. */
  gentleNext?: boolean;
  /** Medication patterns already answered with the safety card. */
  medsWarned?: string[];
  /** Onboarding chat that only fills the health profile (Home "Complete your profile"); no topic yet. */
  profileOnly?: boolean;
  /** Check-in progress (docs/ux/F05-followup-labs.md › M-2.1 state · Check-in). */
  checkInStage?: CheckInStage;
  /** Visit debrief progress (docs/ux/F09c-log-visit.md › M-2.1 state · Visit debrief). */
  debrief?: DebriefState;
  /** F09c Step 3: "Discuss this with Deborah" — the consultation that follows carries the logged visit. */
  afterVisit?: { noteId?: ID; memory: string; summary: string };
  /** Core experience (DN-07 · DN-08): symptom group and journey this consultation was planned for. */
  symptomGroup?: SymptomGroupId;
  journey?: JourneyId;
  /** DN-11: a red flag was reported; no product and provider-directed framework or urgent safety intervention. */
  redFlag?: boolean;
  /** Uncounted provider-directed framework, generated only after pending facts are resolved. */
  providerReview?: { state: 'waiting' | 'generating' | 'done'; concerns: string[] };
  /** DN-13: facts Deborah noted here. Used in this conversation; saved to the profile only on Confirm. */
  facts?: PendingFact[];
  /** M-2.8 is due but waits until the Review and Confirm card is resolved. */
  followUpAfterReview?: boolean;
  /** First user turn / suggestion text — prefills session main-concern confirm. */
  openingText?: string;
  /** Times the user chose “I have more to add” on session-complete (capped at 2). */
  sessionMoreCount?: number;
  /** After “I have more to add”: next free-text is extra context, then re-ask completeness. */
  awaitingSessionMore?: boolean;
  /** Simulated care-team alert after emergency, crisis, or out-of-coverage guidance (prototype only). */
  teamAlert?: { level: 'emergency' | 'crisis' | 'uncovered'; at: ISODate; phrase?: string };
  /** Miro Step 4: ISO time when a full 7-section guidance finished (not early first look / uncovered). */
  guidanceGivenAt?: ISODate;
  /** Same-topic lab reassess: next answer replaces guidance without counting another free consult. */
  labRefresh?: boolean;
}

export type DebriefStage = 'opening' | 'listening' | 'probe' | 'summary' | 'saved';

export interface DebriefState {
  stage: DebriefStage;
  outcome: VisitOutcome;
  /** Extraction confidence per field path (`provider.specialty`…); < 0.7 shows "Check this". */
  confidence: Record<string, number>;
  /** Probes already asked or skipped (max 3). */
  asked: VisitProbeId[];
  /** The probe whose answer the composer is waiting for. */
  awaiting?: VisitProbeId;
  /** Saved note, once saved. */
  noteId?: ID;
}

export type CheckInStage = 'opening' | 'awaitingDetail' | 'labs' | 'done';

export interface LabValue {
  id: ID;
  marker: string;
  value: string;
  unit: string;
  edited?: boolean;
  /** Prototype display-only status (plain text — not a clinical engine). */
  statusLabel?: string;
  /** Visual tone for status / highlighted value. */
  statusTone?: 'normal' | 'excellent' | 'attention';
}

export interface LabReportInsight {
  headline: string;
  body: string;
  /** Clinical copy gate — always placeholder unless Deborah-approved. */
  status: 'placeholder' | 'approved';
}

export interface LabReport {
  id: ID;
  profileId: ID;
  source: 'photo' | 'pdf' | 'manual';
  labName?: string;
  /** Optional panel title for M-9.5 (e.g. Immunity and Inflammation). */
  panelTitle?: string;
  collectedAt?: ISODate;
  values: LabValue[];
  confirmed: boolean;
  insight?: LabReportInsight;
}

export interface Habit {
  id: ID;
  text: string;
  doneDates: ISODate[];
}

export interface Plan90 {
  profileId: ID;
  /** Status of the script the goal and habits came from; absent = treat as placeholder. */
  status?: ContentStatus;
  startDate: ISODate;
  goal: string;
  habits: Habit[];
  productId?: ID;
  productStartDate?: ISODate;
}

export type NoteKind = 'questions' | 'saved-answer' | 'after-visit' | 'free' | 'provider-brief';

/** Structured “My Visit Notes / For My Provider” payload (Miro Step 5 · M-9.7). */
export interface VisitBriefLab {
  name: string;
  tier: 'primary' | 'also';
  reason: string;
}

export interface VisitBriefQuestion {
  text: string;
  why: string;
}

export interface VisitBriefMed {
  name: string;
  dose?: string;
  current?: boolean;
  /** Extra line when the client takes Genesis Gold. */
  genesisGoldNote?: string;
}

export interface VisitBriefContent {
  header: {
    name: string;
    dob?: string;
    priority?: boolean;
    whatThisIs: string;
  };
  /** Scheduling metadata only — not printed on the brief (Miro: appointment date “will not be there”). */
  appointmentDate?: ISODate;
  /** Heading for M-9.7, about this conversation (seeded per chat; falls back to the conversation topic). */
  title?: string;
  /** Who she is seeing; typed on M-9.7 (design 2026-10-20) and printed in the header. */
  providerName?: string;
  chiefComplaint: string;
  clinicalContext: string;
  labs: VisitBriefLab[];
  questions: VisitBriefQuestion[];
  medications: VisitBriefMed[];
  redFlagsSummary: string;
  recommendation: string;
  disclaimer: string[];
  status: ContentStatus;
}

/** F09c · Miro Step 6: what happened at a provider visit (M-9.8). */
export type VisitSpecialty = 'primary-care' | 'gynecology' | 'endocrinology' | 'cardiology' | 'functional' | 'other';
export type VisitTestStatus = 'ordered' | 'done' | 'results';
export type VisitMedChange = 'started' | 'stopped' | 'dose' | 'continue';
export type VisitProbeId = 'specialty' | 'said' | 'tests' | 'meds';

export interface VisitOutcome {
  visitDate: ISODate;
  /** Linked Step 5 provider-brief note. */
  briefNoteId?: ID;
  reason?: string;
  provider: { specialty?: VisitSpecialty; specialtyOther?: string; name?: string; practice?: string; followUp?: string };
  takeaway: { said?: string; understanding?: string; unanswered?: string };
  tests: { name: string; status: VisitTestStatus }[];
  medChanges: { name: string; change: VisitMedChange; note?: string }[];
  nextSteps: { text: string; book?: boolean }[];
  ownNotes?: string;
  status: ContentStatus;
}

export interface Note {
  id: ID;
  profileId: ID;
  kind: NoteKind;
  title: string;
  body: string;
  updatedAt: ISODate;
  sourceMessageId?: ID;
  conversationId?: ID;
  /** Set when kind === 'provider-brief'. */
  brief?: VisitBriefContent;
  /** Set when kind === 'after-visit' and logged through F09c. */
  visit?: VisitOutcome;
  /** Provider visit summary logged from the Visit Notes tile (M-9.9, design 2026-10-20). */
  visitLog?: VisitLog;
}

export interface VisitLog {
  visitDate?: string;
  chiefComplaint?: string;
  duration?: string;
  providerName?: string;
  specialty?: string;
  clinic?: string;
  followUp?: string;
  diagnosis?: string;
  understanding?: string;
  unaddressed?: string;
  labs: { test: string; orderedBy: string; status: string }[];
  labNotes?: string;
  changes: { name: string; change: string; dose: string }[];
  nextSteps: { priority: string; text: string }[];
  ownNotes?: string;
  loggedAt: ISODate;
}

/** F11 Documents and reports (docs/ux/F11-documents.md). */
export type DocumentType = 'lab' | 'imaging' | 'prescription' | 'visit-note' | 'other';
export type DocumentFormat = 'pdf' | 'jpg' | 'png' | 'txt';

/** Simulated "System reads key details" output — never read from the file. */
export interface DocumentExtraction {
  fields: { label: string; value: string }[];
  status: ContentStatus;
}

export interface HealthDocument {
  id: ID;
  profileId: ID;
  type: DocumentType;
  format: DocumentFormat;
  fileName: string;
  sizeBytes: number;
  /** Defaults to "{Type label} · {date}". */
  title: string;
  description?: string;
  /** User-entered date on the document (not in the future). */
  documentDate?: ISODate;
  /** Stamped automatically at upload. */
  uploadedAt: ISODate;
  source: 'camera' | 'file' | 'seed';
  extraction?: DocumentExtraction;
  /** Set when type === 'lab' and the M-5.4 confirm path created a report. */
  labReportId?: ID;
  /** Display only (delete alert line). */
  sharedWith?: string[];
  /** OPEN: soft delete ("we may need it again", Miro). Hidden everywhere once set. */
  deletedAt?: ISODate;
}

export interface Booking {
  id: ID;
  profileId: ID;
  slot: ISODate;
  durationMin: number;
  price: number;
  state: string;
  shareHistory: boolean;
  status: 'booked' | 'cancelled';
}

/** Notification types (Miro "Notification & Reminders", 2026-10-20); each can be turned off in settings except the required ones. */
export type NotificationType = 'followup' | 'inactivity' | 'plan' | 'critical' | 'reconsent' | 'booking';

export interface AppNotification {
  id: ID;
  type?: NotificationType;
  title: string;
  body: string;
  deepLink: string;
  deliverAt: ISODate;
  delivered: boolean;
  read: boolean;
}
