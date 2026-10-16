/**
 * Miro Step 4 — early first look + beginGuidance entry (docs/ux/F02e-guidance.md).
 */
import type { Conversation, LabReport, Profile } from '../types/domain';
import type { EngineContext, Step } from '../types/engine';
import { isUncoveredConcern, needsMoreDetails, remainingIntakeLabels } from './guidanceGates';
import { question } from './intake';
import { answerSteps, deborahText, nextIntakeOrReady, pause } from './plans';
import { uncoveredSteps } from './safety';

export { isUncoveredConcern, needsMoreDetails } from './guidanceGates';

/** Early first look: what is still missing, then continue intake. Uncounted. */
export function earlyFirstLookSteps(ctx: EngineContext, conv: Conversation, profile: Profile): Step[] {
  const items = remainingIntakeLabels(conv, profile, question);
  const list = items.length ? items.map((l) => `• ${l}`).join('\n') : '• A little more about what’s going on';
  const body =
    `Here’s an early first look — I don’t have enough yet for full guidance.\n\n` +
    `I’d still like to know:\n${list}\n\n` +
    `Answer those when you can, then ask me again (or tap “Tell me what you think”).`;
  return [...pause('Checking what I still need', 500, 800), ...deborahText(ctx, body), ...nextIntakeOrReady(ctx, conv, profile)];
}

/** Miro Step 4 entry: early first look → uncovered team handoff → full 7-section guidance. */
export function beginGuidance(
  ctx: EngineContext,
  conv: Conversation,
  profile: Profile,
  opts: { retry?: boolean; labs?: LabReport; refresh?: boolean } = {},
): Step[] {
  if (opts.refresh || conv.labRefresh || opts.labs) {
    return answerSteps(ctx, { ...conv, labRefresh: true }, profile, { ...opts, refresh: true });
  }
  if (needsMoreDetails(conv, profile)) return earlyFirstLookSteps(ctx, conv, profile);
  if (isUncoveredConcern(conv)) return uncoveredSteps(ctx);
  return answerSteps(ctx, conv, profile, opts);
}
