/** Free-consultation rules (docs/07-ai-simulation.md §4). */
import type { EngineContext } from '../types/engine';

export const FREE_LIMIT = 3;

/** The gate fires only when the user tries to START a new consultation with none left. */
export function isGated(ctx: EngineContext): boolean {
  return ctx.subscription.plan === 'trial' && ctx.subscription.freeConsultationsUsed >= FREE_LIMIT;
}

/** M-2.8 is offered when the answered count reaches the snooze mark (first answer by default). */
export function shouldOfferFollowUp(ctx: EngineContext, answeredAfter: number): boolean {
  return ctx.notificationPermission === 'unknown' && answeredAfter === ctx.followUpSnoozeUntil;
}
