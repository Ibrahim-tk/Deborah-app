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
import { answerPatch, CONSENT_ID, optionLabels, planConsultation, question } from './intake';
import { inferFromMessage } from './extract';
import { ANSWER_REQUEST_LABEL, answerSteps, deborahText, nextIntakeOrReady, pause, scriptOf, userBubble } from './plans';
export { CONSENT_ID } from './intake';

export { ANSWER_REQUEST_LABEL } from './plans';
export { greeting } from './memory';
export { ageBandFor, ageOn, isMinor } from './profile';
export { extractionPatch, extractProfile, handOffSuggestions, healthKitPatch, profileCompletion } from './extract';
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
    case 'startProfile':
      return startProfileSteps(ctx);
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

/**
 * Home "Complete your profile" (design direction 2026-10-12): an onboarding-only chat. Deborah asks
 * the first onboarding question straight away; when the basics are in she says so and the chat
 * waits for the user's first topic, which then starts a consultation in the same conversation.
 */
function startProfileSteps(ctx: EngineContext): EnginePlan {
  const conv = ctx.conversation;
  const plan = planConsultation(ctx, [], false);
  const next: Conversation = { ...conv, status: 'intake', profileOnly: true, intakePlan: plan, intakeDone: [] };
  return [
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { status: 'intake', profileOnly: true, intakePlan: plan, intakeDone: [], startedAt: ctx.now } } },
    ...pause('Getting ready', 400, 700),
    ...nextIntakeOrReady(ctx, next, ctx.profile),
  ];
}

function startConsultation(rawCtx: EngineContext, text: string, scriptId: string): EnginePlan {
  // Progressive intake: anything her message already answers (age, medicines, allergies…) is
  // filled first, so planning skips those questions.
  const inferred = inferFromMessage(rawCtx.profile, text, new Date(rawCtx.now));
  const profile = { ...rawCtx.profile, ...inferred.profile, intake: { ...rawCtx.profile.intake, ...inferred.intake } };
  const ctx = { ...rawCtx, profile };
  const inferSteps: EnginePlan = [
    ...(Object.keys(inferred.intake).length ? [{ type: 'store' as const, action: { type: 'updateIntake' as const, profileId: profile.id, patch: inferred.intake } }] : []),
    ...(Object.keys(inferred.profile).length ? [{ type: 'store' as const, action: { type: 'updateProfile' as const, profileId: profile.id, patch: inferred.profile } }] : []),
  ];
  const script = scripts[scriptId] ?? scripts[FALLBACK_SCRIPT_ID];
  const prev = ctx.conversation;
  // The onboarding chat carries on into her first consultation (its messages stay).
  const reuse = prev.messages.length === 0 || Boolean(prev.profileOnly);
  const conv: Conversation = {
    id: reuse ? prev.id : uid('c'),
    profileId: ctx.profile.id,
    scriptId: script.id,
    topic: script.topic,
    status: 'intake',
    messages: [],
    startedAt: ctx.now,
    intakePlan: planConsultation(ctx, script.intake, Boolean(script.answer.product)),
    intakeDone: [],
  };
  return [
    reuse
      ? { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: prev.profileOnly ? { ...conv, messages: prev.messages, profileOnly: false } : conv } }
      : { type: 'store', action: { type: 'startConversation', conversation: conv } },
    ...inferSteps,
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
  const markAnswered: EnginePlan = qMsg ? [{ type: 'patch', messageId: qMsg.id, patch: { intake: { ...qMsg.intake!, answered: optionIds } } }] : [];
  const bubble = userBubble(ctx, optionLabels(q, optionIds, otherText, qMsg?.intake?.options));

  if (questionId === CONSENT_ID) return [...markAnswered, bubble, ...consentSteps(ctx, conv, optionIds[0] === 'agree')];

  const patch = answerPatch(q, optionIds, otherText, new Date(ctx.now), ctx.profile);
  const profile = { ...ctx.profile, ...patch.profile, intake: { ...ctx.profile.intake, ...patch.intake } };
  const next: Conversation = { ...conv, intakeDone: [...(conv.intakeDone ?? []), questionId] };
  return [
    ...markAnswered,
    bubble,
    { type: 'store', action: { type: 'updateIntake', profileId: ctx.profile.id, patch: patch.intake } },
    ...(Object.keys(patch.profile).length ? [{ type: 'store' as const, action: { type: 'updateProfile' as const, profileId: ctx.profile.id, patch: patch.profile } }] : []),
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { intakeDone: next.intakeDone } } },
    ...pause('Reading your answer', 600, 1000),
    ...nextIntakeOrReady({ ...ctx, profile }, next, profile),
  ];
}

/**
 * Health-data consent (F01): agreeing continues the questions; "Not now" drops every health
 * question in this consultation and the answer stays general (no supplement card).
 * OPEN: "ask again next consultation, or only from Account › Privacy?" — documented default: ask again.
 */
function consentSteps(ctx: EngineContext, conv: Conversation, agreed: boolean): EnginePlan {
  const done = [...(conv.intakeDone ?? []), CONSENT_ID];
  if (agreed) {
    const next: Conversation = { ...conv, intakeDone: done };
    return [
      { type: 'store', action: { type: 'acceptHealthConsent' } },
      { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { intakeDone: done } } },
      ...pause('Reading your answer', 400, 700),
      ...nextIntakeOrReady({ ...ctx, healthConsent: true }, next, ctx.profile),
    ];
  }
  const all = [...new Set([...done, ...(conv.intakePlan ?? []).filter((id) => id !== 'country')])];
  const next: Conversation = { ...conv, intakeDone: all, noProduct: true };
  return [
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { intakeDone: all, noProduct: true } } },
    ...pause('Reading your answer', 400, 700),
    ...deborahText(ctx, "That's completely fine. I won't ask about your health details, and I'll keep my thoughts general."),
    ...nextIntakeOrReady(ctx, next, ctx.profile),
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
