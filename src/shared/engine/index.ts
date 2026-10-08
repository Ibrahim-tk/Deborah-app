/**
 * createConversationEngine() — pure and UI-agnostic (docs/07-ai-simulation.md §1).
 * handleUserInput(ctx, input) returns an ordered plan; the app's bridge executes it with timers.
 */
import { FALLBACK_SCRIPT_ID, scripts, TEEN_SCRIPT_ID } from '../data';
import { isMinor } from './profile';
import type { Conversation } from '../types/domain';
import type { EngineContext, EnginePlan, UserInput } from '../types/engine';
import { uid } from '../utils/ids';
import { asksForAnswer, detectScript, followUpReply } from './classifier';
import { classify } from './guardrails';
import {
  acknowledgeEmergencySteps,
  crisisSteps,
  emergencySteps,
  escalationSteps,
  gentleReplySteps,
  medicationSteps,
  outOfScopeSteps,
} from './safety';
import { isGated } from './counting';
import { checkInDetailSteps, checkInReplySteps, isAwaitingCheckInDetail, startCheckInSteps } from './checkin';
import { shareLabsSteps } from './labs';
import { intakePatch, optionLabels, planIntake, question } from './intake';
import { ANSWER_REQUEST_LABEL, answerSteps, deborahText, nextIntakeOrReady, pause, scriptOf, userBubble } from './plans';

export { ANSWER_REQUEST_LABEL } from './plans';
export { greeting } from './memory';
export { ageBandFor, ageOn, isMinor } from './profile';
export { chunkText, CPS } from './streamer';
export { FREE_LIMIT, isGated } from './counting';
export { replayScript, streamInto } from './replay';

export function createConversationEngine() {
  return { handleUserInput };
}

function handleUserInput(ctx: EngineContext, input: UserInput): EnginePlan {
  switch (input.kind) {
    case 'text':
      return handleText(ctx, input.text, input.scriptId);
    case 'intakeAnswer':
      return handleIntakeAnswer(ctx, input.questionId, input.optionIds, input.otherText);
    case 'skip':
      return handleSkip(ctx, input.questionId);
    case 'acknowledgeEmergency':
      return acknowledgeEmergencySteps(ctx, input.messageId);
    case 'startCheckIn':
      return startCheckInSteps(ctx);
    case 'checkInReply':
      return checkInReplySteps(ctx, input.messageId, input.optionId);
    case 'shareLabs':
      return shareLabsSteps(ctx, input.report);
    case 'requestAnswer':
      return [
        ...(input.retry ? [] : [userBubble(ctx, ANSWER_REQUEST_LABEL)]),
        ...answerSteps(ctx, ctx.conversation, ctx.profile, { retry: input.retry }),
      ];
  }
}

function handleText(ctx: EngineContext, text: string, suggestionScript?: string): EnginePlan {
  const conv = ctx.conversation;
  // 1 · Guardrails run first, in any phase, and are never gated (docs/07-ai-simulation.md §2).
  const guard = classify(text, ctx);
  if (guard.replace) {
    const safety =
      guard.replace === 'emergency' ? emergencySteps(ctx) : guard.replace === 'crisis' ? crisisSteps(ctx) : [...pause('Reading your message', 500, 800), ...outOfScopeSteps(ctx)];
    return [userBubble(ctx, text), ...safety];
  }
  if (conv.gentleNext) return [userBubble(ctx, text), ...pause('Reading your message', 600, 900), ...gentleReplySteps(ctx)];

  const plan = isAwaitingCheckInDetail(conv) ? checkInDetailSteps(ctx, text) : normalText(ctx, text, suggestionScript);
  if (plan[0]?.type === 'gate') {
    // Additive safety is never gated: show the card(s), then the free-limit sheet.
    // Without any, nothing is appended and the text stays in the composer.
    if (!guard.medication.length && !guard.escalation) return plan;
    return [
      userBubble(ctx, text),
      ...(guard.medication.length ? medicationSteps(ctx, guard.medication) : []),
      ...(guard.escalation ? escalationSteps(ctx) : []),
      { type: 'gate', reason: 'freeLimit' },
    ];
  }
  const withMeds = guard.medication.length ? insertAfterUser(plan, medicationSteps(ctx, guard.medication)) : plan;
  return guard.escalation ? [...withMeds, ...escalationSteps(ctx)] : withMeds;
}

/** Medication card goes right after the user's bubble, before Deborah's normal reply. */
function insertAfterUser(plan: EnginePlan, steps: EnginePlan): EnginePlan {
  const i = plan.findIndex((s) => s.type === 'message' && s.message.role === 'user');
  return i < 0 ? [...steps, ...plan] : [...plan.slice(0, i + 1), ...steps, ...plan.slice(i + 1)];
}

function normalText(ctx: EngineContext, text: string, suggestionScript?: string): EnginePlan {
  const conv = ctx.conversation;
  // Minor profiles always use the teen script (docs/ux/F06-family-profiles.md › 6.4).
  const detected = isMinor(ctx.profile, new Date(ctx.now)) ? TEEN_SCRIPT_ID : (suggestionScript ?? detectScript(text));

  // Asking "what do you think" during intake/ready jumps to the answer.
  if ((conv.status === 'intake' || conv.status === 'ready' || conv.status === 'error') && asksForAnswer(text)) {
    return [userBubble(ctx, text), ...answerSteps(ctx, conv, ctx.profile)];
  }

  const startsNew =
    conv.status === 'empty' ||
    conv.messages.length === 0 ||
    // A check-in behaves like an answered consultation: a new topic starts a new one.
    ((conv.status === 'answered' || conv.status === 'checkin') && detected !== null && detected !== conv.scriptId);

  if (startsNew) {
    // Safety guardrails (phase 4) run before this gate and are never gated.
    if (isGated(ctx)) return [{ type: 'gate', reason: 'freeLimit' }];
    return startConsultation(ctx, text, detected ?? FALLBACK_SCRIPT_ID);
  }

  if (conv.status === 'intake') {
    // Free text answers the current question; stored verbatim in intake.notes.
    const current = (conv.intakePlan ?? []).find((id) => !(conv.intakeDone ?? []).includes(id));
    const notes = [ctx.profile.intake.notes, text].filter(Boolean).join('\n');
    const next: Conversation = { ...conv, intakeDone: [...(conv.intakeDone ?? []), ...(current ? [current] : [])] };
    return [
      userBubble(ctx, text),
      { type: 'store', action: { type: 'updateIntake', profileId: ctx.profile.id, patch: { notes } } },
      { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { intakeDone: next.intakeDone } } },
      ...pause('Reading your answer'),
      ...nextIntakeOrReady(ctx, next, ctx.profile),
    ];
  }

  // ready / answered / checkin / error: a short follow-up reply, not a new answer.
  return [userBubble(ctx, text), ...pause('Thinking about your question'), ...deborahText(ctx, followUpReply(conv.scriptId, text))];
}

function startConsultation(ctx: EngineContext, text: string, scriptId: string): EnginePlan {
  const script = scripts[scriptId] ?? scripts[FALLBACK_SCRIPT_ID];
  const prev = ctx.conversation;
  const reuse = prev.messages.length === 0;
  const conv: Conversation = {
    id: reuse ? prev.id : uid('c'),
    profileId: ctx.profile.id,
    scriptId: script.id,
    topic: script.topic,
    status: 'intake',
    messages: [],
    startedAt: ctx.now,
    intakePlan: planIntake(script.intake, ctx.profile),
    intakeDone: [],
  };
  return [
    reuse
      ? { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: conv } }
      : { type: 'store', action: { type: 'startConversation', conversation: conv } },
    userBubble(ctx, text),
    ...pause('Reading your message'),
    ...nextIntakeOrReady(ctx, conv, ctx.profile),
  ];
}

function handleIntakeAnswer(ctx: EngineContext, questionId: string, optionIds: string[], otherText?: string): EnginePlan {
  const conv = ctx.conversation;
  const q = question(questionId);
  if (!q || optionIds.length === 0) return [];
  const qMsg = [...conv.messages].reverse().find((m) => m.intake?.questionId === questionId);
  const patch = intakePatch(q, optionIds);
  const next: Conversation = { ...conv, intakeDone: [...(conv.intakeDone ?? []), questionId] };
  return [
    ...(qMsg ? [{ type: 'patch' as const, messageId: qMsg.id, patch: { intake: { ...qMsg.intake!, answered: optionIds } } }] : []),
    userBubble(ctx, optionLabels(q, optionIds, otherText)),
    { type: 'store', action: { type: 'updateIntake', profileId: ctx.profile.id, patch } },
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { intakeDone: next.intakeDone } } },
    ...pause('Reading your answer', 600, 1000),
    ...nextIntakeOrReady(ctx, next, { ...ctx.profile, intake: { ...ctx.profile.intake, ...patch } }),
  ];
}

function handleSkip(ctx: EngineContext, questionId: string): EnginePlan {
  const conv = ctx.conversation;
  const qMsg = [...conv.messages].reverse().find((m) => m.intake?.questionId === questionId);
  const next: Conversation = { ...conv, intakeDone: [...(conv.intakeDone ?? []), questionId] };
  return [
    ...(qMsg ? [{ type: 'patch' as const, messageId: qMsg.id, patch: { intake: { ...qMsg.intake!, skipped: true } } }] : []),
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { intakeDone: next.intakeDone } } },
    ...pause('Moving on', 400, 700),
    ...nextIntakeOrReady(ctx, next, ctx.profile),
  ];
}

export { scriptOf };
