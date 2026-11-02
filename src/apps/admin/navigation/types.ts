/** Admin routes: a section root plus at most one detail page on top. */
export type SectionId = 'dashboard' | 'clients' | 'escalations' | 'support' | 'subscriptions' | 'admins' | 'audit' | 'compliance';

export type AdminRoute =
  | { id: SectionId }
  | { id: 'client'; clientId: string }
  | { id: 'dependent'; clientId: string; dependentId: string }
  | { id: 'escalation'; escalationId: string }
  | { id: 'deletion'; requestId: string }
  | { id: 'plan'; planId: string | null };

export type AuthStep = 'signIn' | 'forgot' | 'twoFactor';
