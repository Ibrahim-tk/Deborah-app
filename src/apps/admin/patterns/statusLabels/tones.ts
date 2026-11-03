import type { SubscriptionStatus } from '@shared/admin';

export const SUB: Record<SubscriptionStatus, [string, 'success' | 'accent' | 'neutral' | 'warning' | 'danger']> = {
  active: ['Active', 'success'],
  free: ['Free', 'neutral'],
  past_due: ['Payment failed', 'warning'],
  cancelled: ['Cancelled', 'danger'],
};
