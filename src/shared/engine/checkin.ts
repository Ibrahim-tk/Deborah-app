/**
 * Check-in (docs/07-ai-simulation.md §5, docs/ux/F05-followup-labs.md › M-2.1 state · Check-in).
 * Deborah opens with a memory line + Yes / Partly / Not yet; replies are never counted.
 */
import { CHECKIN_SCRIPT_ID, checkInScript as c } from '../data';
import type { CheckInStage, Conversation } from '../types/domain';
import type { EngineContext, Step } from '../types/engine';
import { uid } from '../utils/ids';
import { interpolate } from '../utils/text';
import { deborahText, pause, userBubble } from './plans';

const stage = (conversationId: string, checkInStage: CheckInStage): Step => ({
  type: 'store',
  action: { type: 'setConversation', conversationId, patch: { checkInStage } },
});

export const isAwaitingCheckInDetail = (conv: Conversation) => conv.status === 'checkin' && conv.checkInStage === 'awaitingDetail';

export function startCheckInSteps(ctx: EngineContext): Step[] {
  const prev = ctx.conversation;
  // Re-opening the same notification while the opening question waits does nothing.
  if (prev.status === 'checkin' && prev.checkInStage === 'opening') return [];
  const conv: Conversation = {
    id: uid('c'),
    profileId: ctx.profile.id,
    scriptId: CHECKIN_SCRIPT_ID,
    status: 'checkin',
    checkInStage: 'opening',
    messages: [],
    startedAt: ctx.now,
  };
  const text = interpolate(ctx.lastTopic ? c.opening : c.openingNoTopic, { name: ctx.profile.name, topic: ctx.lastTopic });
  return [
    { type: 'store', action: { type: 'startConversation', conversation: conv } },
    ...pause('Opening our last conversation', 500, 800),
    ...deborahText(ctx, text, { kind: 'checkIn', quickReplies: { options: c.options } }),
  ];
}

/** "Did you get your labs done?" with Upload my labs + Not yet. */
export function labRequestSteps(ctx: EngineContext): Step[] {
  return [
    ...deborahText(ctx, c.labRequest, { kind: 'labRequest', quickReplies: { options: [c.labRequestNotYet] } }),
    stage(ctx.conversation.id, 'labs'),
  ];
}

export function checkInReplySteps(ctx: EngineContext, messageId: string, optionId: string): Step[] {
  const conv = ctx.conversation;
  const m = conv.messages.find((x) => x.id === messageId);
  const option = m?.quickReplies?.options.find((o) => o.id === optionId);
  if (!m?.quickReplies || m.quickReplies.answered || !option) return [];
  const name = { name: ctx.profile.name };
  const say = (text: string, extra = {}) => [...pause('Reading your answer', 500, 800), ...deborahText(ctx, interpolate(text, name), extra)];

  const steps: Step[] = [
    { type: 'patch', messageId, patch: { quickReplies: { ...m.quickReplies, answered: optionId } } },
    userBubble(ctx, option.label),
  ];
  switch (optionId) {
    case 'yes':
      return [...steps, ...say(c.replies.yes), ...labRequestSteps(ctx)];
    case 'partly':
      return [...steps, ...say(c.replies.partly), stage(conv.id, 'awaitingDetail')];
    case 'notYet':
      return [...steps, ...say(c.replies.notYet, { kind: 'checkIn', quickReplies: { options: c.notYetOptions } }), stage(conv.id, 'done')];
    case 'labsNotYet':
    case 'restartPlan':
    case 'talk':
      return [...steps, ...say(c.replies[optionId]), stage(conv.id, 'done')];
    default:
      return steps;
  }
}

/** "Partly → what got in the way?" — the free-text answer gets a short reply, then the lab request. */
export function checkInDetailSteps(ctx: EngineContext, text: string): Step[] {
  return [userBubble(ctx, text), ...pause('Reading your message', 600, 900), ...deborahText(ctx, interpolate(c.replies.partlyFollowUp, { name: ctx.profile.name })), ...labRequestSteps(ctx)];
}
