/**
 * Labs (docs/07-ai-simulation.md §6): a confirmed report is shared into the conversation and
 * answered with the lab-review script. The lab-informed answer counts as a consultation.
 */
import { LAB_REVIEW_SCRIPT_ID, scripts } from '../data';
import type { Conversation, LabReport } from '../types/domain';
import type { EngineContext, Step } from '../types/engine';
import { uid } from '../utils/ids';
import { isGated } from './counting';
import { answerSteps, userBubble } from './plans';

export function shareLabsSteps(ctx: EngineContext, report: LabReport): Step[] {
  if (isGated(ctx)) return [{ type: 'gate', reason: 'freeLimit' }];
  const script = scripts[LAB_REVIEW_SCRIPT_ID];
  const prev = ctx.conversation;
  // Continue an empty or check-in conversation; anything else gets a fresh consultation.
  const reuse = prev.messages.length === 0 || prev.status === 'empty' || prev.status === 'checkin';
  const conv: Conversation = reuse
    ? { ...prev, scriptId: script.id, topic: script.topic, checkInStage: prev.checkInStage && 'done' }
    : { id: uid('c'), profileId: ctx.profile.id, scriptId: script.id, topic: script.topic, status: 'empty', messages: [], startedAt: ctx.now };
  const request = [...prev.messages].reverse().find((m) => m.kind === 'labRequest' && !m.quickReplies?.answered);
  const n = report.values.length;

  return [
    reuse
      ? { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { scriptId: conv.scriptId, topic: conv.topic, checkInStage: conv.checkInStage } } }
      : { type: 'store', action: { type: 'startConversation', conversation: conv } },
    ...(reuse && request?.quickReplies ? [{ type: 'patch' as const, messageId: request.id, patch: { quickReplies: { ...request.quickReplies, answered: 'upload' } } }] : []),
    userBubble(ctx, `Shared lab results (${n} value${n === 1 ? '' : 's'})`),
    ...answerSteps(ctx, conv, ctx.profile, { labs: report }),
  ];
}
