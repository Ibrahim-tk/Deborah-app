/** @pattern statusLabels — one wording + tone per status, used by every table and detail page. */
import { ESCALATION_LEVEL } from './labels';
import type { AccountStatus, EscalationStatus, EscalationType, InviteStatus, SubscriptionStatus } from '@shared/admin';
import { StatusText } from '@admin/ui';
import { SUB } from './tones';


export const SubscriptionStatusText = ({ status }: { status: SubscriptionStatus }) => (
  <StatusText tone={SUB[status][1]}>{SUB[status][0]}</StatusText>
);

export const AccountStatusText = ({ status }: { status: AccountStatus }) => (
  <StatusText tone={status === 'active' ? 'success' : 'neutral'}>{status === 'active' ? 'Active' : 'Deactivated'}</StatusText>
);

export const EscalationStatusText = ({ status }: { status: EscalationStatus }) => (
  <StatusText tone={status === 'not_reviewed' ? 'warning' : 'success'} icon={status === 'not_reviewed' ? 'clock' : 'check'}>{status === 'not_reviewed' ? 'Review pending' : 'Reviewed'}</StatusText>
);

export const EscalationTypeText = ({ type }: { type: EscalationType }) => (
  <StatusText tone={type === 'emergency' ? 'danger' : type === 'crisis' ? 'warning' : 'info'}>{ESCALATION_LEVEL[type]}</StatusText>
);

export const InviteStatusText = ({ status }: { status: InviteStatus }) => (
  <StatusText tone={status === 'accepted' ? 'success' : status === 'pending' ? 'info' : 'warning'}>
    {status === 'accepted' ? 'Accepted' : status === 'pending' ? 'Invite sent' : 'Invite expired'}
  </StatusText>
);
