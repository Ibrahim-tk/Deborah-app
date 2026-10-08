/** Safety plans (docs/ux/F03-safety.md). None of these count, gate or show products. */
import { guardrailsData as g } from '../data';
import type { Message } from '../types/domain';
import type { EngineContext, Step } from '../types/engine';
import { uid } from '../utils/ids';
import { deborahText } from './plans';

const card = (ctx: EngineContext, kind: Message['kind'], text: string, status = 'placeholder' as const): Step => ({
  type: 'message',
  message: { id: uid('m'), role: 'deborah', kind, text, createdAt: ctx.now, meta: { status } },
});

/** Emergency appears before any other Deborah content and locks the composer until "I'm safe". */
export function emergencySteps(ctx: EngineContext): Step[] {
  const conv = ctx.conversation;
  return [
    { type: 'thinking', on: false },
    card(ctx, 'emergency', g.emergency.body),
    {
      type: 'store',
      action: { type: 'setConversation', conversationId: conv.id, patch: { status: 'safety', statusBeforeSafety: conv.status === 'safety' ? conv.statusBeforeSafety : conv.status } },
    },
  ];
}

export function acknowledgeEmergencySteps(ctx: EngineContext, messageId: string): Step[] {
  const conv = ctx.conversation;
  const restore = conv.statusBeforeSafety && conv.statusBeforeSafety !== 'generating' ? conv.statusBeforeSafety : conv.messages.some((m) => m.kind === 'answer') ? 'answered' : 'empty';
  return [
    { type: 'patch', messageId, patch: { meta: { acknowledged: true } } },
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { status: restore === 'empty' ? 'ready' : restore, statusBeforeSafety: undefined } } },
    ...deborahText(ctx, g.emergency.acknowledgedReply),
  ];
}

/** Crisis: calm card; the conversation continues, products are suppressed, next reply is gentle. */
export function crisisSteps(ctx: EngineContext): Step[] {
  return [
    card(ctx, 'crisis', g.crisis.body),
    { type: 'store', action: { type: 'setConversation', conversationId: ctx.conversation.id, patch: { noProduct: true, gentleNext: true } } },
  ];
}

export function gentleReplySteps(ctx: EngineContext): Step[] {
  return [
    { type: 'store', action: { type: 'setConversation', conversationId: ctx.conversation.id, patch: { gentleNext: false } } },
    ...deborahText(ctx, g.crisis.gentleReply),
  ];
}

/** Medication is additive: the card, then the normal pipeline continues. */
export function medicationSteps(ctx: EngineContext, matched: string[]): Step[] {
  return [
    card(ctx, 'medicationSafety', g.medication.body),
    {
      type: 'store',
      action: { type: 'setConversation', conversationId: ctx.conversation.id, patch: { medsWarned: [...(ctx.conversation.medsWarned ?? []), ...matched] } },
    },
  ];
}

export function outOfScopeSteps(ctx: EngineContext): Step[] {
  return [...deborahText(ctx, g.outOfScope.body, { kind: 'outOfScope' })];
}

export function escalationSteps(ctx: EngineContext): Step[] {
  return [{ type: 'delay', ms: 400 }, card(ctx, 'escalation', g.escalation.body)];
}
