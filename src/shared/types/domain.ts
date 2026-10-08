/** Domain types (docs/06-data-model.md §2). */

export type ID = string;
export type ISODate = string;

export type ContentStatus = 'placeholder' | 'handbook' | 'approved';

export type PlanTier = 'trial' | 'individual' | 'family' | 'premium';
export type Billing = 'monthly' | 'annual';
export type Relationship = 'self' | 'daughter' | 'son' | 'partner' | 'parent' | 'other';
export type NotificationPermission = 'unknown' | 'granted' | 'denied';

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
}

export interface Profile {
  id: ID;
  name: string;
  relationship: Relationship;
  dob?: ISODate;
  sexAtBirth?: 'female' | 'male';
  intake: Intake;
  createdAt: ISODate;
  guardianConsentAt?: ISODate;
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
  | 'followUpPrompt';

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
  status?: ContentStatus;
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
  | 'checkin';

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
  archived?: boolean;
  /** Safety state (docs/ux/F03-safety.md). */
  statusBeforeSafety?: ConversationStatus;
  /** Crisis shown: no product cards for the rest of this conversation. */
  noProduct?: boolean;
  /** Crisis shown: the next Deborah reply is gentle and short. */
  gentleNext?: boolean;
  /** Medication patterns already answered with the safety card. */
  medsWarned?: string[];
  /** Check-in progress (docs/ux/F05-followup-labs.md › M-2.1 state · Check-in). */
  checkInStage?: CheckInStage;
}

export type CheckInStage = 'opening' | 'awaitingDetail' | 'labs' | 'done';

export interface LabValue {
  id: ID;
  marker: string;
  value: string;
  unit: string;
  edited?: boolean;
}

export interface LabReport {
  id: ID;
  profileId: ID;
  source: 'photo' | 'pdf' | 'manual';
  labName?: string;
  collectedAt?: ISODate;
  values: LabValue[];
  confirmed: boolean;
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

export type NoteKind = 'questions' | 'saved-answer' | 'after-visit' | 'free';

export interface Note {
  id: ID;
  profileId: ID;
  kind: NoteKind;
  title: string;
  body: string;
  updatedAt: ISODate;
  sourceMessageId?: ID;
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

export interface AppNotification {
  id: ID;
  title: string;
  body: string;
  deepLink: string;
  deliverAt: ISODate;
  delivered: boolean;
  read: boolean;
}
