/** Admin routes: one section page at a time. Every record (client, case, request, plan, admin, log entry,
 *  consent version) opens in the side drawer over that page instead of a route. */

/** What the side drawer is showing. `plan` with a null id is a new plan. */
export type DrawerTarget =
  | { kind: 'client'; id: string }
  | { kind: 'escalation'; id: string }
  | { kind: 'support'; id: string }
  | { kind: 'deletion'; id: string }
  | { kind: 'admin'; id: string }
  | { kind: 'plan'; id: string | null }
  | { kind: 'audit'; id: string }
  | { kind: 'consent'; id: string }
  | { kind: 'stripeEvents'; id: null }
  /** Knowledge Base content; a null id is new content, `new:<gapId>` is an answer to that gap. */
  | { kind: 'content'; id: string | null }
  | { kind: 'gap'; id: string };

export type SectionId = 'dashboard' | 'clients' | 'escalations' | 'support' | 'subscriptions' | 'integrations' | 'regulations' | 'admins' | 'audit' | 'compliance' | 'settings' | 'notifications' | 'knowledge';

export type AdminRoute = { id: SectionId };

export type AuthStep = 'signIn' | 'forgot' | 'twoFactor';
