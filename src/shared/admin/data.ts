/** Admin seed data (JSON). Clinical text in clients/escalations is placeholder. */
import clients from './data/clients.json';
import escalations from './data/escalations.json';
import supportRequests from './data/support-requests.json';
import deletionRequests from './data/deletion-requests.json';
import admins from './data/admins.json';
import plans from './data/plans.json';
import auditLog from './data/audit-log.json';
import consentVersions from './data/consent-versions.json';
import consentRevocations from './data/consent-revocations.json';
import metrics from './data/metrics.json';
import type {
  AdminUser, AuditEntry, Client, ConsentRevocation, ConsentVersion, DeletionRequest, Escalation, Metrics, Plan, SupportRequest,
} from './types';

export const seed = {
  clients: clients as Client[],
  escalations: escalations as Escalation[],
  supportRequests: supportRequests as SupportRequest[],
  deletionRequests: deletionRequests as DeletionRequest[],
  admins: admins as AdminUser[],
  plans: plans as Plan[],
  auditLog: auditLog as AuditEntry[],
  consentVersions: consentVersions as ConsentVersion[],
  consentRevocations: consentRevocations as ConsentRevocation[],
};

export const adminMetrics = metrics as Metrics;
