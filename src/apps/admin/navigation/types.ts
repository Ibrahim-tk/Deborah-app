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
  /** Knowledge Base content (read view; upload and edit are the A-13.3 page). */
  | { kind: 'content'; id: string | null }
  | { kind: 'gap'; id: string };

export type SectionId = 'dashboard' | 'clients' | 'escalations' | 'support' | 'deletion' | 'subscriptions' | 'regulations' | 'admins' | 'audit' | 'compliance' | 'settings' | 'notifications' | 'knowledge';

/** `param` carries a record for detail pages, e.g. the Knowledge Base editor: 'new', 'new:<gapId>' or a content id. */
export type AdminRoute = { id: SectionId; param?: string };

export type AuthStep = 'signIn' | 'forgot' | 'twoFactor';
