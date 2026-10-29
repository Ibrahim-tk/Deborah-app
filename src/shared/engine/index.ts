/**
 * createConversationEngine() — pure and UI-agnostic (docs/07-ai-simulation.md §1).
 * handleUserInput(ctx, input) returns an ordered plan; the app's bridge executes it with timers.
 */
import { FALLBACK_SCRIPT_ID, scripts, TEEN_SCRIPT_ID } from '../data';
import { isMinor } from './profile';
import type { Conversation, PendingFact } from '../types/domain';
import type { EngineContext, EnginePlan, UserInput } from '../types/engine';
import { uid } from '../utils/ids';
import { asksForAnswer, detectScript, followUpReply, symptomGroupOf } from './classifier';
import { factFromAnswer, factsFromMessage, mergeFacts, mergeSessionKnowledge, pendingFacts, withFacts } from './facts';
import { journeyFor } from './journey';
import { classify } from './guardrails';
import {
  acknowledgeEmergencySteps,
  crisisSteps,
  emergencySteps,
  escalationSteps,
  gentleReplySteps,
  medicationSteps,
  outOfScopeSteps,
  identitySteps,
  appHelpSteps,
} from './safety';
import { isGated } from './counting';
import { checkInDetailSteps, checkInReplySteps, isAwaitingCheckInDetail, startCheckInSteps } from './checkin';
import { shareLabsSteps } from './labs';
import { documentOfferReplySteps, offerDocumentSteps, shareAttachmentsSteps, shareDocumentSteps } from './documents';
import { debriefReplySteps, debriefSavedSteps, debriefTextSteps, isVisitReport, visitOfferSteps } from './debrief';
import { startDebriefSteps } from './visitOutcome';
import { answerPatch, CONSENT_ID, optionLabels, planConsultation, question } from './intake';
import { inferFromMessage } from './extract';
import { ANSWER_REQUEST_LABEL, answerSteps, deborahText, nextIntakeOrReady, pause, redFlagSteps, scriptOf, userBubble } from './plans';
import { beginGuidance } from './guidance';
import { matchesUncovered } from './guidanceGates';
export { CONSENT_ID } from './intake';

export { ANSWER_REQUEST_LABEL } from './plans';
export { greeting } from './memory';
export { forFamilyMember, pronounForms } from './perspective';
export { ageBandFor, ageGroupFor, ageOfMajority, ageOf, ageOn, isChildRelationship, isMinor } from './profile';
export { journeyFor, missingBasics, planClarifiers, CLARIFY } from './journey';
export { symptomGroupOf } from './classifier';
export { factFromAnswer, pendingFacts, withFacts } from './facts';
export { answerPatch, optionLabels, question } from './intake';
export { productAllowed } from './plans';
export { shows, type ShowIfValue } from './showIf';
export { firstConsultFor, nextNodeId, personalise, type FlowValue } from './flow';
export { extractionPatch, extractProfile, handOffSuggestions, healthKitPatch, profileCompletion } from './extract';
export { chunkText, CPS } from './streamer';
export { FREE_LIMIT, isGated } from './counting';
export { replayScript, streamInto } from './replay';
export { beginGuidance, needsMoreDetails, isUncoveredConcern } from './guidance';
export { matchesUncovered } from './guidanceGates';
export { asksForAnswer } from './classifier';
export {
  assembleVisitBrief,
  briefFromAnswer,
  hasEnoughDetailForVisitBrief,
  latestCompletedAnswer,
  visitBriefPreview,
  VISIT_BRIEF_DISCLAIMER,
  VISIT_BRIEF_WHAT_THIS_IS,
} from './visitBrief';
export {
  debriefToConsultSeed,
  emptyVisitOutcome,
  extractVisitOutcome,
  hasEnoughVisitContext,
  hasProviderSpecialty,
  isDebrief,
  isVisitOutcomeEmpty,
  MAX_VISIT_PROBES,
  nextVisitProbe,
  specialtyLabel,
  startDebriefSteps,
  VISIT_CHECK_THIS,
  visitProfileUpdates,
  type VisitProfileUpdate,
  visitOutcomeToText,
  visitSummaryLines,
  type VisitConfidence,
} from './visitOutcome';

export function createConversationEngine() {
  return { handleUserInput };
}

function handleUserInput(rawCtx: EngineContext, input: UserInput): EnginePlan {
  // DN-13: facts noted in this conversation count as known here, though they're not saved yet.
  const ctx = { ...rawCtx, profile: withFacts(rawCtx.profile, rawCtx.conversation.facts) };
  switch (input.kind) {
    case 'text':
      return handleText(ctx, input.text, input.scriptId);
    case 'intakeAnswer':
      // DN-05 Decline: the consultation goes on without anything she said in it.
      return handleIntakeAnswer(input.questionId === CONSENT_ID && input.optionIds[0] !== 'agree' ? rawCtx : ctx, input.questionId, input.optionIds, input.otherText);
    case 'skip':
      return handleSkip(ctx, input.questionId);
    case 'acknowledgeEmergency':
      return acknowledgeEmergencySteps(ctx, input.messageId);
    case 'startCheckIn':
      return startCheckInSteps(ctx);
    case 'checkInReply':
      return checkInReplySteps(ctx, input.messageId, input.optionId);
    case 'startDebrief':
      return startDebriefSteps(ctx, input.brief);
    case 'debriefReply':
      return debriefReplySteps(ctx, input.messageId, input.optionId);
    case 'debriefSaved':
      return debriefSavedSteps(ctx, input.noteId, input.outcome, input.applied);
    case 'shareLabs':
      return shareLabsSteps(ctx, input.report, input.direct);
    case 'shareDocument':
      return shareDocumentSteps(ctx, input.document, input.report);
    case 'offerDocument':
      return offerDocumentSteps(ctx, input.document);
    case 'shareAttachments':
      return shareAttachmentsSteps(ctx, input.attachments, input.text);
    case 'documentOfferReply':
      return documentOfferReplySteps(ctx, input.messageId, input.optionId, input.document, input.report);
    case 'finishReview':
      return ctx.conversation.providerReview?.state === 'waiting' && !pendingFacts(ctx.conversation).length
        ? answerSteps(ctx, ctx.conversation, ctx.profile) : [];
    case 'requestAnswer':
      return [
        ...(input.retry ? [] : [userBubble(ctx, ANSWER_REQUEST_LABEL)]),
        ...beginGuidance(ctx, ctx.conversation, ctx.profile, { retry: input.retry }),
      ];
  }
}

function handleText(ctx: EngineContext, text: string, suggestionScript?: string): EnginePlan {
  const conv = ctx.conversation;
  // 1 · Guardrails run first, in any phase, and are never gated (docs/07-ai-simulation.md §2).
  const guard = classify(text, ctx);
  if (guard.replace) {
    const safety =
      guard.replace === 'emergency' ? emergencySteps(ctx)
      : guard.replace === 'crisis' ? crisisSteps(ctx)
      : guard.replace === 'identity' ? [...pause('Reading your message', 400, 600), ...identitySteps(ctx)]
      : guard.replace === 'appHelp' ? [...pause('Reading your message', 400, 600), ...appHelpSteps(ctx)]
      : [...pause('Reading your message', 500, 800), ...outOfScopeSteps(ctx)];
    return [userBubble(ctx, text), ...safety];
  }
  if (conv.gentleNext) return [userBubble(ctx, text), ...pause('Reading your message', 600, 900), ...gentleReplySteps(ctx)];

  // F09c: a debrief is never gated or counted; safety above still applies.
  // F09c chat intent: "I just saw my doctor" offers to log the visit (never mid-intake or mid-answer).
  const offerVisit = (conv.status === 'empty' || conv.status === 'answered' || conv.status === 'checkin') && isVisitReport(text);
  const plan =
    offerVisit ? visitOfferSteps(ctx, text)
    : conv.status === 'debrief' ? debriefTextSteps(ctx, text)
    : isAwaitingCheckInDetail(conv) ? checkInDetailSteps(ctx, text)
    : normalText(ctx, text, suggestionScript);
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
  // Minor profiles use the teen script (docs/ux/F06-family-profiles.md › 6.4) — it's about periods, so only
  // for girls. OPEN: "child and male-teen question banks" — documented default: boys keep the topic's script.
  const minorGirl = isMinor(ctx.profile, new Date(ctx.now)) && (ctx.profile.sexAtBirth ?? ctx.profile.health?.sexAtBirth?.value) !== 'male';
  // A scripted (F02f) quick start keeps its own questions, even for a minor.
  const scripted = suggestionScript && scripts[suggestionScript]?.ownIntake ? suggestionScript : undefined;
  const detected = scripted ?? (minorGirl ? TEEN_SCRIPT_ID : (suggestionScript ?? detectScript(text)));

  // Asking "what do you think" during intake/ready jumps to guidance (early look / coverage / answer).
  if ((conv.status === 'intake' || conv.status === 'ready' || conv.status === 'error') && asksForAnswer(text)) {
    return [userBubble(ctx, text), ...beginGuidance(ctx, conv, ctx.profile)];
  }

  const startsNew =
    conv.status === 'empty' ||
    conv.messages.length === 0 ||
    // A check-in behaves like an answered consultation: a new topic starts a new one.
    ((conv.status === 'answered' || conv.status === 'checkin') && detected !== null && detected !== conv.scriptId) ||
    // Miro Step 4: uncovered concern from an answered chat still opens a new (uncounted) path.
    ((conv.status === 'answered' || conv.status === 'checkin') && matchesUncovered(text));

  if (startsNew) {
    // Safety guardrails (phase 4) run before this gate and are never gated.
    if (isGated(ctx)) return [{ type: 'gate', reason: 'freeLimit' }];
    return startConsultation(ctx, text, detected ?? FALLBACK_SCRIPT_ID);
  }

  if (conv.status === 'intake') {
    // Free text answers the current question. Anything it names (a medicine, an allergy) is noted for
    // Review and Confirm (DN-13); the words themselves stay in the conversation only.
    const inferred = inferFromMessage(ctx.profile, text, new Date(ctx.now));
    const facts = factsFromMessage(inferred);
    // Completeness “I have more”: this turn is extra context; re-ask session-complete afterward.
    if (conv.awaitingSessionMore) {
      const next: Conversation = {
        ...conv,
        awaitingSessionMore: false,
        facts: mergeFacts(conv.facts, facts),
        openingText: conv.openingText || text.trim(),
      };
      const profile = withFacts(ctx.profile, facts);
      return [
        userBubble(ctx, text),
        ...proposeSteps(conv.id, facts),
        { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { awaitingSessionMore: false, facts: next.facts } } },
        ...pause('Reading your answer'),
        ...nextIntakeOrReady({ ...ctx, profile }, next, profile),
      ];
    }
    const current = (conv.intakePlan ?? []).find((id) => !(conv.intakeDone ?? []).includes(id));
    const intakeAnswers = current ? { ...conv.intakeAnswers, [current]: [text.trim()] } : conv.intakeAnswers;
    const next: Conversation = { ...conv, intakeDone: [...(conv.intakeDone ?? []), ...(current ? [current] : [])], intakeAnswers, facts: mergeFacts(conv.facts, facts) };
    const profile = withFacts(ctx.profile, facts);
    return [
      userBubble(ctx, text),
      ...proposeSteps(conv.id, facts),
      { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { intakeDone: next.intakeDone, intakeAnswers } } },
      ...pause('Reading your answer'),
      ...nextIntakeOrReady({ ...ctx, profile }, next, profile),
    ];
  }

  // ready / answered / checkin / error: a short follow-up reply, not a new answer.
  return [userBubble(ctx, text), ...pause('Thinking about your question'), ...deborahText(ctx, followUpReply(conv.scriptId, text))];
}

function startConsultation(rawCtx: EngineContext, text: string, scriptId: string): EnginePlan {
  // Progressive intake: anything her message already answers (age, medicines, allergies…) is noted
  // first, so planning skips those questions. Noted, not saved: Review and Confirm comes after (DN-13).
  const facts = factsFromMessage(inferFromMessage(rawCtx.profile, text, new Date(rawCtx.now)));
  const profile = withFacts(rawCtx.profile, facts);
  const ctx = { ...rawCtx, profile };
  const script = scripts[scriptId] ?? scripts[FALLBACK_SCRIPT_ID];
  const prev = ctx.conversation;
  // The onboarding chat carries on into her first consultation (its messages stay).
  // Lab attach on empty also reuses so the "Shared lab results" bubble stays in-thread.
  const reuse = prev.messages.length === 0 || Boolean(prev.profileOnly) || prev.status === 'empty';
  const conv: Conversation = {
    id: reuse ? prev.id : uid('c'),
    profileId: ctx.profile.id,
    scriptId: script.id,
    topic: script.topic,
    status: 'intake',
    messages: [],
    startedAt: ctx.now,
    // DN-07 · DN-08: what she's asking about and which question bank fits her.
    symptomGroup: symptomGroupOf(text),
    journey: journeyFor(profile, new Date(ctx.now)) ?? undefined,
    intakePlan: planConsultation(
      ctx,
      script.intake,
      Boolean(script.answer.product),
      script.ownIntake,
      symptomGroupOf(text),
      Boolean(text.trim()),
    ),
    intakeDone: [],
    facts,
    openingText: text.trim(),
  };
  return [
    reuse
      ? {
          type: 'store',
          action: {
            type: 'setConversation',
            conversationId: conv.id,
            patch: { ...conv, messages: prev.messages, profileOnly: false },
          },
        }
      : { type: 'store', action: { type: 'startConversation', conversation: conv } },
    userBubble(ctx, text),
    ...pause('Reading your message'),
    ...nextIntakeOrReady(ctx, conv, ctx.profile),
  ];
}

/** Store step for newly noted facts (the bridge merges them into the conversation). */
function proposeSteps(conversationId: string, facts: PendingFact[]): EnginePlan {
  return facts.length ? [{ type: 'store', action: { type: 'proposeFacts', conversationId, facts } }] : [];
}

/**
 * F02f loop ("Anything else she takes?" → Yes): the loop's questions, then this question again, are
 * inserted right after it with a round suffix (`fam-med-name#2`), up to `repeat.max` rounds.
 */
function repeatPlan(conv: Conversation, questionId: string, optionIds: string[]): string[] | undefined {
  const plan = conv.intakePlan;
  const rule = question(questionId)?.repeat;
  if (!plan || !rule || !optionIds.includes(rule.when)) return plan;
  const round = Number(questionId.split('#')[1] ?? 1) + 1;
  if (round > rule.max) return plan;
  const i = plan.indexOf(questionId);
  const base = questionId.split('#')[0];
  const added = [...rule.ids, base].map((id) => `${id}#${round}`);
  return [...plan.slice(0, i + 1), ...added, ...plan.slice(i + 1)];
}

function handleIntakeAnswer(ctx: EngineContext, questionId: string, optionIds: string[], otherText?: string): EnginePlan {
  const conv = ctx.conversation;
  const q = question(questionId);
  if (!q || optionIds.length === 0) return [];
  const qMsg = [...conv.messages].reverse().find((m) => m.intake?.questionId === questionId);
  const markAnswered: EnginePlan = qMsg ? [{ type: 'patch', messageId: qMsg.id, patch: { intake: { ...qMsg.intake!, answered: optionIds } } }] : [];

  // Completeness gate: "I have more" invites the composer (max 2 loops), then re-asks.
  if (questionId === 'session-complete') {
    const bubble = userBubble(ctx, optionLabels(q, optionIds, otherText, qMsg?.intake?.options));
    if (optionIds[0] === 'more') {
      const count = (conv.sessionMoreCount ?? 0) + 1;
      if (count <= 2) {
        return [
          ...markAnswered,
          bubble,
          {
            type: 'store',
            action: {
              type: 'setConversation',
              conversationId: conv.id,
              patch: { sessionMoreCount: count, awaitingSessionMore: true },
            },
          },
          ...pause('Reading your answer', 400, 700),
          ...deborahText(ctx, 'Of course — add anything else in the box below, then I’ll check in again.'),
        ];
      }
      // Cap reached: treat as complete.
    }
    const done = [...(conv.intakeDone ?? []), questionId];
    const merged = mergeSessionKnowledge({ ...conv, intakeDone: done }, ctx.profile);
    const next: Conversation = { ...conv, intakeDone: done, facts: merged, awaitingSessionMore: false };
    return [
      ...markAnswered,
      bubble,
      ...proposeSteps(conv.id, pendingFacts({ facts: merged })),
      {
        type: 'store',
        action: {
          type: 'setConversation',
          conversationId: conv.id,
          patch: { intakeDone: done, facts: merged, awaitingSessionMore: false },
        },
      },
      ...pause('Reading your answer', 600, 1000),
      ...nextIntakeOrReady(ctx, next, withFacts(ctx.profile, merged)),
    ];
  }

  const resolvedOther =
    questionId === 'session-concern' && optionIds[0] === 'yes'
      ? otherText?.trim() || conv.openingText?.trim()
      : otherText;
  const bubbleLabel =
    questionId === 'session-concern' && optionIds[0] === 'yes' && resolvedOther
      ? resolvedOther
      : optionLabels(q, optionIds, resolvedOther, qMsg?.intake?.options);
  const bubble = userBubble(ctx, bubbleLabel);

  if (questionId === CONSENT_ID) return [...markAnswered, bubble, ...consentSteps(ctx, conv, optionIds[0] === 'agree')];

  const done = [...(conv.intakeDone ?? []), questionId];
  // DN-11: preserve urgent intervention; other concerns get an uncounted provider-review ending.
  if (q.redFlags && optionIds.some((id) => id !== 'none')) {
    const label = optionLabels(q, optionIds, resolvedOther, qMsg?.intake?.options);
    return [
      ...markAnswered,
      bubble,
      { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { intakeDone: done, redFlag: true, noProduct: true } } },
      ...pause('Reading your answer', 600, 1000),
      ...(classify(label, ctx).replace === 'emergency'
        ? emergencySteps({ ...ctx, conversation: { ...conv, redFlag: true, noProduct: true } })
        : redFlagSteps(ctx, {
            ...conv,
            intakeDone: done,
            redFlag: true,
            providerReview: {
              state: 'waiting',
              concerns: optionIds
                .filter((id) => id !== 'none')
                .map((id) => (id === 'other' ? resolvedOther?.trim() || 'Other concern' : q.options.find((o) => o.id === id)?.label ?? id)),
            },
          })),
    ];
  }

  // DN-13: the answer is noted for Review and Confirm, and used right away in this conversation.
  const patch = answerPatch(q, optionIds, resolvedOther, new Date(ctx.now), ctx.profile);
  // Confirming the opener as main concern still stores the opening text.
  if (questionId === 'session-concern' && optionIds[0] === 'yes' && resolvedOther) {
    patch.intake = { ...patch.intake, mainConcern: resolvedOther };
  }
  const fact = factFromAnswer(q, patch, bubbleLabel);
  const facts = fact ? [fact] : [];
  const profile = withFacts(ctx.profile, facts);
  // F02f: keep the answer for later showIf rules ("Other" keeps the typed words too).
  const intakeAnswers = { ...conv.intakeAnswers, [questionId]: resolvedOther?.trim() ? [...optionIds, resolvedOther.trim()] : optionIds };
  const intakePlan = repeatPlan(conv, questionId, optionIds);
  const next: Conversation = { ...conv, intakeDone: done, intakeAnswers, intakePlan, facts: mergeFacts(conv.facts, facts) };
  return [
    ...markAnswered,
    bubble,
    ...proposeSteps(conv.id, facts),
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { intakeDone: next.intakeDone, intakeAnswers, intakePlan } } },
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
  // DN-05 Decline: nothing she said is used or offered for saving.
  const facts = (conv.facts ?? []).map((f) => (f.status === 'pending' ? { ...f, status: 'discarded' as const } : f));
  const next: Conversation = { ...conv, intakeDone: all, noProduct: true, facts };
  return [
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { intakeDone: all, noProduct: true, facts } } },
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
