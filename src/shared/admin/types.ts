/** Super Admin domain types (docs/admin/README.md). Non-visual; seeded from ./data JSON. */

export type AdminRole = 'super' | 'admin';
export type AccountStatus = 'active' | 'deactivated';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'free';
export type EscalationType = 'critical' | 'emergency';
export type EscalationStatus = 'open' | 'in_review' | 'resolved';
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

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
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
  closed?: string;
}

export type SupportType = 'billing' | 'account' | 'technical' | 'escalate_to_deborah';

export interface SupportRequest {
  id: string;
  clientId: string;
  type: SupportType;
  subject: string;
  received: string;
  resolved: boolean;
}

export type DependentDecision = { dependentId: string; action: 'delete' } | { dependentId: string; action: 'transfer'; email: string; transfer: 'invited' | 'accepted' };

export interface DeletionRequest {
  id: string;
  clientId: string;
  received: string;
  regulation: 'GDPR' | 'CCPA';
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  decisions: DependentDecision[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  account: AccountStatus;
  invite: InviteStatus;
  invitedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  kind: 'individual' | 'family';
  monthly: number;
  yearly: number;
  freeQuestions: number;
  maxProfiles: number;
  features: Record<string, boolean>;
  rules: string;
  active: boolean;
  /** Set once Stripe is connected and the plan's price is synced. */
  stripePriceId?: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  text: string;
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
