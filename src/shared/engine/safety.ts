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
  const teamAlert = { level: 'emergency' as const, at: ctx.now };
  return [
    { type: 'thinking', on: false },
    card(ctx, 'emergency', g.emergency.body),
    {
      type: 'store',
      action: {
        type: 'setConversation',
        conversationId: conv.id,
        patch: {
          status: 'safety',
          statusBeforeSafety: conv.status === 'safety' ? conv.statusBeforeSafety : conv.status,
          teamAlert,
        },
      },
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

/** Crisis: calm card / sheet; the conversation continues, products are suppressed, next reply is gentle. */
export function crisisSteps(ctx: EngineContext): Step[] {
  const teamAlert = { level: 'crisis' as const, at: ctx.now };
  return [
    card(ctx, 'crisis', g.crisis.body),
    {
      type: 'store',
      action: {
        type: 'setConversation',
        conversationId: ctx.conversation.id,
        patch: { noProduct: true, gentleNext: true, teamAlert },
      },
    },
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

/** Miro Step 4: enough context but outside approved knowledge — team handoff. Uncounted. */
export function uncoveredSteps(ctx: EngineContext): Step[] {
  const conv = ctx.conversation;
  const teamAlert = { level: 'uncovered' as const, at: ctx.now, phrase: conv.openingText ?? conv.topic };
  return [
    ...deborahText(ctx, g.uncovered.body, { kind: 'outOfScope' }),
    {
      type: 'store',
      action: {
        type: 'setConversation',
        conversationId: conv.id,
        patch: { status: 'answered', teamAlert },
      },
    },
  ];
}

export function escalationSteps(ctx: EngineContext): Step[] {
  return [{ type: 'delay', ms: 400 }, card(ctx, 'escalation', g.escalation.body)];
}
