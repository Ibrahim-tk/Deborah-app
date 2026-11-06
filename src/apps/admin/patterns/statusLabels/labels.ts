/** Plain-text labels for admin record types (no JSX, so components can stay fast-refresh friendly). */
import type { ContentStatus, GapStatus, SimpleClientStatus } from '@shared/admin';
import type { StatusTone } from '@admin/ui';
import type { DeletionRequest, DeletionStatus, DeletionType, EscalationType, SupportType } from '@shared/admin';

export const ESCALATION_LEVEL: Record<EscalationType, string> = { emergency: 'Emergency', crisis: 'Crisis', urgent: 'Urgent' };

/** Support request types (story 5.1). */
export const SUPPORT_TYPE: Record<SupportType, string> = {
  talk_to_support: 'Talk to Support Team',
  consultation: 'Consultation Request',
  knowledge_gap: 'Knowledge Gap',
};

/** Deletion requests (story 5.2). */
export const DELETION_TYPE: Record<DeletionType, string> = { account: 'Account Deletion', family_member: 'Family Member Deletion', teen: 'Teen Deletion' };
export const DELETION_STATUS: Record<DeletionStatus, string> = {
  pending_review: 'Pending review',
  in_progress: 'In progress',
  legal_hold: 'On legal hold',
  waiting_transfer: 'Waiting for transfer',
  completed: 'Completed',
};
export const DELETION_OPTION: Record<NonNullable<DeletionRequest['option']>, string> = {
  everything: 'Delete everything, including managed family members',
  advocate_only: 'Advocate only: delete only their own health information',
  transfer: 'Transfer profiles to family members, then delete the account',
};

/** Knowledge Base pills: colour only for meaning (story 6.1, Dropbox-style "always show the state"). */
export const CONTENT_TONE: Record<ContentStatus, StatusTone> = { processing: 'processing', published: 'success', pending: 'warning', draft: 'neutral', rejected: 'danger', archived: 'neutral' };
export const GAP_TONE: Record<GapStatus, StatusTone> = { new: 'info', answered: 'success', dismissed: 'neutral' };

/** Simple client status pills (Clients list and client drawer): Active green, Cancelled red, Inactive grey. */
export const CLIENT_SIMPLE_TONE: Record<SimpleClientStatus, StatusTone> = { active: 'success', cancelled: 'danger', inactive: 'neutral' };

/** Support request type pills: talk to support blue, consultation green, knowledge gap red. */
export const SUPPORT_TONE: Record<SupportType, StatusTone> = { talk_to_support: 'info', consultation: 'success', knowledge_gap: 'danger' };
