/**
 * Labs (docs/07-ai-simulation.md §6): a confirmed report is shared into the conversation.
 * Ask Dibora: composer attach on an empty/new chat attaches labs and lets the user write more /
 * run session questions before a full lab-review answer. Direct ask (M-9.5) or in-thread
 * labRequest still answers immediately with the lab-review script.
 */
import { LAB_REVIEW_SCRIPT_ID, scripts } from '../data';
import type { Conversation, LabReport } from '../types/domain';
import type { EngineContext, Step } from '../types/engine';
import { uid } from '../utils/ids';
import { isGated } from './counting';
import { answerSteps, deborahText, pause, userBubble } from './plans';

export function shareLabsSteps(ctx: EngineContext, report: LabReport, direct?: boolean): Step[] {
  if (isGated(ctx)) return [{ type: 'gate', reason: 'freeLimit' }];
  const script = scripts[LAB_REVIEW_SCRIPT_ID];
  const prev = ctx.conversation;
  const request = [...prev.messages].reverse().find((m) => m.kind === 'labRequest' && !m.quickReplies?.answered);
  const n = report.values.length;
  const bubble = userBubble(ctx, `Shared lab results (${n} value${n === 1 ? '' : 's'})`);

  // M-9.5 "Ask Oracle about these labs", in-thread upload request, check-in, or mid-consult → answer now.
  const answerNow =
    Boolean(direct) ||
    Boolean(request) ||
    prev.status === 'checkin' ||
    prev.status === 'ready' ||
    prev.status === 'answered';

  if (answerNow) {
    const reuse = prev.messages.length === 0 || prev.status === 'empty' || prev.status === 'checkin' || Boolean(request);
    const conv: Conversation = reuse
      ? { ...prev, scriptId: script.id, topic: script.topic, checkInStage: prev.checkInStage && 'done' }
      : {
          id: uid('c'),
          profileId: ctx.profile.id,
          scriptId: script.id,
          topic: script.topic,
          status: 'empty',
          messages: [],
          startedAt: ctx.now,
        };
    return [
      reuse
        ? {
            type: 'store',
            action: {
              type: 'setConversation',
              conversationId: conv.id,
              patch: { scriptId: conv.scriptId, topic: conv.topic, checkInStage: conv.checkInStage },
            },
          }
        : { type: 'store', action: { type: 'startConversation', conversation: conv } },
      ...(reuse && request?.quickReplies
        ? [{ type: 'patch' as const, messageId: request.id, patch: { quickReplies: { ...request.quickReplies, answered: 'upload' } } }]
        : []),
      bubble,
      // Same-topic lab share after an answer: uncounted guidance refresh (Miro update summary).
      ...answerSteps(ctx, { ...conv, labRefresh: prev.status === 'answered' }, ctx.profile, {
        labs: report,
        refresh: prev.status === 'answered',
      }),
    ];
  }

  // Empty / new chat from composer attach: store labs, invite more text; next send starts session.
  return [
    {
      type: 'store',
      action: {
        type: 'setConversation',
        conversationId: prev.id,
        patch: {
          status: 'empty',
          scriptId: script.id,
          topic: script.topic,
          openingText: prev.openingText || 'I shared my lab results',
        },
      },
    },
    bubble,
    ...pause('Looking at your labs', 500, 800),
    ...deborahText(
      ctx,
      "I've got your labs. Add anything else below if you like — symptoms, questions, or context — then send when you're ready.",
    ),
  ];
}
