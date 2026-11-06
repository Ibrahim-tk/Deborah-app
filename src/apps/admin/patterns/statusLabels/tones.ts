import type { SubscriptionStatus } from '@shared/admin';

export const SUB: Record<SubscriptionStatus, [string, 'success' | 'info' | 'neutral' | 'warning' | 'danger']> = {
  trial: ['Trial', 'neutral'],
  active: ['Active', 'success'],
  payment_issue: ['Payment issue', 'warning'],
  cancelled: ['Cancelled', 'danger'],
};
