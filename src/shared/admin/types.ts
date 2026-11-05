/** Super Admin domain types (docs/admin/README.md). Non-visual; seeded from ./data JSON. */
import type { AuditCategory, AuditRole } from './audit';

export type AdminRole = 'super' | 'admin';
export type AccountStatus = 'active' | 'deactivated';
export type SubscriptionStatus = 'trial' | 'active' | 'payment_issue' | 'cancelled';
/** Escalation level (story 4.1). */
export type EscalationType = 'emergency' | 'crisis' | 'urgent';
/** Escalations are recorded for review only: no follow-up, overdue or close/reopen (story 4.1). */
export type EscalationStatus = 'not_reviewed' | 'reviewed';
export type InviteStatus = 'pending' | 'accepted' | 'expired';
export type DocumentKind = 'provider_summary' | 'visit_note' | 'lab' | 'other';

export interface Dependent {
  id: string;
  name: string;
  relationship: string;
  age: number;
  conditions: string[];
  /** Clinical copy is placeholder until Deborah approves it. */
  status: 'placeholder';
}

export interface ClientDocument {
  id: string;
  kind: DocumentKind;
  title: string;
  date: string;
}

/** Everything onboarding and intake can ask (docs: data/intake/healthBasics.json). Placeholder clinical copy. */
export interface HealthDetails {
  status: 'placeholder';
  dob: string;
  sexAtBirth: string;
  gender: string;
  pronouns: string;
  heightCm: number;
  weightKg: number;
  reproductiveStage: string;
  ageAtLastPeriod: string | null;
  hysterectomy: string;
  ovariesRemoved: string;
  hrt: string;
  hrtType: string | null;
  fertilityConcerns: string;
  supplements: string[];
  genesisGold: string;
  allergies: string[];
  conditions: string[];
  lifestyle: { sleep: string; exercise: string; diet: string; stress: string; alcohol: string; smoking: string };
}

/** Teen with their own account (Client story 1.5): their access is covered by the parent's Family plan. */
/** turned_off: the parent turned the teen's profile off (story 3.1). */
export type TeenStatus = 'joined' | 'invite_sent' | 'paused' | 'turned_off';

export interface ConsentAcceptance {
  policy: 'Terms of Service' | 'Privacy Policy' | 'Health Consent';
  version: string;
  acceptedAt: string;
}

export interface Client {
  id: string;
  /** First name only: no last name or phone number is collected (Session 9). */
  name: string;
  email: string;
  /** US state, e.g. "TX". */
  state: string;
  accountType: 'adult' | 'teen';
  /** Teens only: the parent account they're linked to, and their access. */
  parentId?: string;
  teenStatus?: TeenStatus;
  consentRevoked: boolean;
  consents: ConsentAcceptance[];
  nextBilling?: string;
  joined: string;
  lastActive: string;
  planId: string;
  subscription: SubscriptionStatus;
  account: AccountStatus;
  conversations: number;
  health: { age: number; stage: string; concerns: string[]; medications: string[]; status: 'placeholder'; details: HealthDetails };
  dependents: Dependent[];
  documents: ClientDocument[];
}

export interface EscalationMessage {
  from: 'client' | 'oracle';
  text: string;
  at: string;
  trigger: boolean;
}

export interface Escalation {
  id: string;
  clientId: string;
  type: EscalationType;
  status: EscalationStatus;
  reason: string;
  /** What happened, what the Oracle did, what the team should do. Placeholder clinical copy. */
  summary: string[];
  /** The exchange around the flag; `trigger` marks the client message that raised it. */
  messages: EscalationMessage[];
  status_copy: 'placeholder';
  opened: string;
  /** Who the escalation is about: the Client, a managed family member (with the advocate), or a teen with their own account. */
  profile: { kind: 'client' | 'family' | 'teen'; name?: string; advocate?: string };
  /** What the Oracle showed, e.g. the 911 or 988 instructions. */
  oracleShowed: string;
  /** The Client's choice after the safety screen, or "No response". */
  clientChose: string;
  /** Teen accounts only: when the parent was told. */
  parentToldAt?: string;
  reviewNotes: string;
  reviewedBy?: string;
  reviewedAt?: string;
  /** Where the flagged conversation happened. */
  device: 'iPhone app' | 'Android app' | 'Web browser';
}

/** Story 5.1. Export and deletion requests are managed separately (5.2). */
export type SupportType = 'talk_to_support' | 'consultation' | 'knowledge_gap' | 'email_change';

export interface SupportRequest {
  id: string;
  clientId: string;
  type: SupportType;
  subject: string;
  /** The Client's full message. */
  message: string;
  /** Family member the request is about, e.g. "Sent by Sarah about Azka". */
  aboutProfile?: string;
  received: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  /** Internal team notes. */
  notes: string;
  /** Email change requests: the new address asked for. */
  newEmail?: string;
  /** Knowledge gap requests: the question the Oracle couldn't answer. */
  question?: string;
  /** Consultation requests: what the Client would like help with. */
  helpWith?: string;
}

export type DependentDecision = { dependentId: string; action: 'delete' } | { dependentId: string; action: 'transfer'; email: string; transfer: 'invited' | 'accepted' };

/** Story 5.2. Exports are done by the Client in the app and never come to the team. */
export type DeletionType = 'account' | 'family_member' | 'teen';
export type DeletionStatus = 'pending_review' | 'in_progress' | 'legal_hold' | 'waiting_transfer' | 'completed';

export interface DeletionRequest {
  id: string;
  /** The account holder (or the teen, for teen deletions). */
  clientId: string;
  type: DeletionType;
  /** In app, or By email (created by the support team for a teen who can't sign in). */
  source: 'in_app' | 'email';
  /** Account deletions: delete everything, advocate only, or transfer profiles then delete. */
  option?: 'everything' | 'advocate_only' | 'transfer';
  /** Family member deletions: the managed family member's id. */
  aboutProfile?: string;
  /** Date received (or the date the teen's email arrived); the 10-business-day deadline starts here. */
  received: string;
  status: DeletionStatus;
  decisions: DependentDecision[];
  checklist: { identity: boolean; legalHold: boolean };
  notes: string;
  createdBy?: string;
  completedBy?: string;
  completedAt?: string;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  /** Who invited them; the Super Admin account is set up once at launch. */
  addedBy?: string;
  lastActive?: string;
  email: string;
  role: AdminRole;
  account: AccountStatus;
  invite: InviteStatus;
  invitedAt: string;
}

export interface PlanPrice {
  price: string;
  at: string;
  by: string;
}

/** Story 8.1/8.2: one Free trial, plus Individual and Family plans. Plans are never deleted, only made inactive. */
export interface Plan {
  id: string;
  name: string;
  kind: 'trial' | 'individual' | 'family';
  monthly: number;
  /** Free trial only. */
  trialDays?: number;
  /** Family only: family members included, and the price per add-on member. */
  familyIncluded?: number;
  addOnPrice?: number;
  /** What's included, shown to Clients on the plan screen, one per line. */
  features: string[];
  status: 'active' | 'draft' | 'inactive';
  priceHistory: PlanPrice[];
  /** Set once Stripe is connected and the plan's price is synced. */
  stripePriceId?: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  /** Email of who did it ("system" for automatic events). */
  actor: string;
  role: AuditRole;
  category: AuditCategory;
  text: string;
  /** What it affected, e.g. the Client account or content item. */
  target?: string;
  /** Device or IP address, for sign-in events. */
  device?: string;
}

export interface ConsentVersion {
  id: string;
  name: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ConsentRevocation {
  id: string;
  clientId: string;
  at: string;
  scope: string;
}

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface Metrics {
  registrationsWeekly: SeriesPoint[];
  registrationsMonthly: SeriesPoint[];
  conversationsWeekly: SeriesPoint[];
  conversationsMonthly: SeriesPoint[];
  topics: SeriesPoint[];
  subscriptionGrowth: { label: string; added: number; churned: number }[];
  activeUsers: number;
  totalConversations: number;
}

export interface StripeEvent {
  id: string;
  type: string;
  status: 'succeeded' | 'failed';
  at: string;
  summary: string;
}

/** Simulated Stripe Connect state (no real API: the redirect and webhooks are timers and seed data). */
export interface StripeConnection {
  status: 'disconnected' | 'connecting' | 'connected';
  mode: 'test' | 'live';
  account: { id: string; name: string; email: string; country: string; payoutsEnabled: boolean; detailsComplete: boolean } | null;
  webhook: { url: string; status: 'active' | 'failing'; lastEventAt: string } | null;
}

export type IntegrationId = 'dropbox' | 'shopify' | 'googleDocs';

/** Simulated OAuth-style connection to a third-party service (no real API). */
export interface IntegrationConnection {
  connected: boolean;
  account?: string;
  connectedAt?: string;
}

/** A privacy or security framework the service operates under. Legal summaries are placeholder until reviewed. */
export interface ComplianceFramework {
  id: string;
  region: string;
  code: string;
  name: string;
  fullName: string;
  state: 'applies' | 'in_progress';
  /** Region flag emoji; null for standards (SOC 2) that show a shield instead. */
  flag: string | null;
  deletionShort: string;
  deletionWindow: string;
  breachShort: string;
  breachNotice: string;
  obligations: string[];
  status: 'placeholder';
}
