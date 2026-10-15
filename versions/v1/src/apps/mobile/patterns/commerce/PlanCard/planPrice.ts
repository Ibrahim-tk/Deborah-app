import type { PlanOption } from '@flow-v1/shared/types/content';
import type { Billing } from '@flow-v1/shared/types/domain';

/** "$39/month" · "$390/year" — used on the card and in the Continue label. */
export const planPrice = (plan: PlanOption, billing: Billing) =>
  billing === 'annual' ? `$${plan.annual}/year` : `$${plan.monthly}/month`;
