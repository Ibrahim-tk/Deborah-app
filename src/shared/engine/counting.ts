/** Free-consultation rules (docs/07-ai-simulation.md §4). */
import type { EngineContext } from '../types/engine';

/** @deprecated 3-consultation limit, replaced by the 14-day trial (2026-10-29). */
export const FREE_LIMIT = 3;

/** The gate fires only when the user tries to START a new consultation after the 14-day trial ended. */
export function isGated(ctx: EngineContext): boolean {
  return ctx.subscription.plan === 'trial' && Boolean(ctx.subscription.trialEnded);
}

/** M-2.8 is offered when the answered count reaches the snooze mark (first answer by default). */
export function shouldOfferFollowUp(ctx: EngineContext, answeredAfter: number): boolean {
  return ctx.notificationPermission === 'unknown' && answeredAfter === ctx.followUpSnoozeUntil;
}
