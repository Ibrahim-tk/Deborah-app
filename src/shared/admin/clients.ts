/** Client status as the listing shows it (story 3.1): account and consent states win over the subscription. */
import type { Client, DeletionRequest } from './types';

export type ClientStatus = 'trial' | 'active' | 'payment_issue' | 'cancelled' | 'consent_revoked' | 'deactivated' | 'deletion_requested';

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  trial: 'Trial',
  active: 'Active',
  payment_issue: 'Payment issue',
  cancelled: 'Cancelled',
  consent_revoked: 'Consent revoked',
  deactivated: 'Deactivated',
  deletion_requested: 'Deletion requested',
};

export function clientStatus(c: Client, deletions: DeletionRequest[]): ClientStatus {
  if (c.account === 'deactivated') return 'deactivated';
  if (deletions.some((d) => d.clientId === c.id && d.status !== 'completed')) return 'deletion_requested';
  if (c.consentRevoked) return 'consent_revoked';
  return c.subscription;
}

/** The simple status the Clients list, its filter and the client drawer all show. Active covers trial and payment
 *  issues (they can still sign in); Inactive covers deactivated, consent revoked and deletion requested. */
export type SimpleClientStatus = 'active' | 'cancelled' | 'inactive';
export const SIMPLE_CLIENT_STATUS_LABEL: Record<SimpleClientStatus, string> = { active: 'Active', cancelled: 'Cancelled', inactive: 'Inactive' };
export const simpleClientStatus = (st: ClientStatus): SimpleClientStatus =>
  st === 'active' || st === 'trial' || st === 'payment_issue' ? 'active' : st === 'cancelled' ? 'cancelled' : 'inactive';

/** Teens with their own account linked to this parent. */
export const teensOf = (parentId: string, clients: Client[]) => clients.filter((c) => c.parentId === parentId);

export const TEEN_STATUS_LABEL = { joined: 'Joined', invite_sent: 'Invite sent', paused: 'Access paused', turned_off: 'Turned off' } as const;
