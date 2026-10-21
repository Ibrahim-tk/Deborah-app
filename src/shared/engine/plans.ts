/** Step builders for each conversation phase (docs/07-ai-simulation.md §2). */
import { formatShortDate } from '../utils/dates';
import { persona, scripts } from '../data';
import type { Script } from '../types/content';
import type { Conversation, LabReport, Message, Profile } from '../types/domain';
import type { EngineContext, Step } from '../types/engine';
import { uid } from '../utils/ids';
import { interpolate } from '../utils/text';
import providerReviewCopy from '../data/conversation/provider-review.json';
import { buildAnswer, buildProviderReview, emptyAnswer } from './answer';
import { shouldOfferFollowUp } from './counting';
import { pendingFacts } from './facts';
import { baseId, countryName, missingGates, optionsFor, planIntake, question, recommendsProduct } from './intake';
import { journeyVars } from './journey';
import { shows, type ShowIfValue } from './showIf';
import { guardrailsData as g } from '../data';
import { CLARIFY, journeyAllowsProduct, journeyFor, planClarifiers } from './journey';
import { isUncoveredConcern } from './guidanceGates';
import { isMinor } from './profile';
import { between, CPS } from './streamer';

/** Inline uncovered handoff (avoid plans ↔ safety circular import). */
function uncoveredGuidanceSteps(ctx: EngineContext, conv: Conversation): Step[] {
  const teamAlert = { level: 'uncovered' as const, at: ctx.now, phrase: conv.openingText ?? conv.topic };
  return [
    ...deborahText(ctx, g.uncovered.body, { kind: 'outOfScope' }),
    {
      type: 'store',
      action: { type: 'setConversation', conversationId: conv.id, patch: { status: 'answered', teamAlert } },
    },
  ];
}

export const ANSWER_REQUEST_LABEL = 'Tell me what you think';

export const scriptOf = (c: Conversation): Script => scripts[c.scriptId ?? 'generic'] ?? scripts.generic;

const msg = (ctx: EngineContext, m: Omit<Message, 'id' | 'createdAt'>): Message => ({
  id: uid('m'),
  createdAt: ctx.now,
  ...m,
});

export function userBubble(ctx: EngineContext, text: string): Step {
  return { type: 'message', message: msg(ctx, { role: 'user', kind: 'text', text }) };
}

/** A short "Deborah is working" pause before she speaks. */
export function pause(label: string, min = 800, max = 1200): Step[] {
  return [{ type: 'thinking', on: true, label }, { type: 'delay', ms: between(min, max) }, { type: 'thinking', on: false }];
}

/** Deborah text message, streamed at text speed. */
export function deborahText(ctx: EngineContext, text: string, extra: Partial<Message> = {}): Step[] {
  const m = msg(ctx, { role: 'deborah', kind: 'text', text: '', meta: { streaming: true, status: 'placeholder' }, ...extra });
  return [
    { type: 'message', message: m },
    { type: 'stream', messageId: m.id, field: 'text', text, cps: CPS.text },
    { type: 'patch', messageId: m.id, patch: { meta: { streaming: false } } },
  ];
}

/**
 * DN-10: the `@clarify` slot becomes the journey × symptom-group clarifiers once everything before it is
 * answered (the stage may only just have been given). A re-routing journey (stage "not sure") leaves a new
 * slot after its stage question. No bank (teen, child): the script's own questions.
 */
function expandClarifiers(ctx: EngineContext, conv: Conversation, profile: Profile): { conv: Conversation; steps: Step[] } {
  const plan = conv.intakePlan ?? [];
  const at = plan.indexOf(CLARIFY);
  const now = new Date(ctx.now);
  const asked = [...plan.filter((id) => id !== CLARIFY), ...(conv.intakeDone ?? [])];
  const picked = planClarifiers(profile, now, conv.symptomGroup, asked) ?? planIntake(scriptOf(conv).intake, profile);
  // The red-flag screen is always the last question (DN-11), after any safety gates.
  const flags = picked.filter((id) => question(id)?.redFlags);
  const rest = plan.slice(at + 1);
  const intakePlan = [...plan.slice(0, at), ...picked.filter((id) => !flags.includes(id)), ...rest, ...flags];
  const journey = journeyFor(profile, now) ?? undefined;
  return {
    conv: { ...conv, intakePlan, journey },
    steps: [{ type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { intakePlan, journey } } }],
  };
}

/** Next intake question, or the ready line when intake is complete. */
/**
 * F02f scripted consultation: questions whose `showIf` fails (profile, or earlier answers in this chat)
 * are marked done without being asked, so the step count and the next question skip them.
 */
function skipHidden(ctx: EngineContext, conv: Conversation, profile: Profile): { conv: Conversation; steps: Step[] } {
  if (!scripts[conv.scriptId ?? '']?.ownIntake) return { conv, steps: [] };
  const vars: Record<string, ShowIfValue> = { ...journeyVars(profile, new Date(ctx.now)) };
  for (const [id, a] of Object.entries(conv.intakeAnswers ?? {})) vars[baseId(id)] = a;
  // Walk forward from the next open question only: later ones may depend on answers not given yet.
  const done = [...(conv.intakeDone ?? [])];
  const before = done.length;
  for (const id of conv.intakePlan ?? []) {
    if (done.includes(id)) continue;
    if (shows(question(id)?.showIf, vars)) break;
    done.push(id);
  }
  if (done.length === before) return { conv, steps: [] };
  const next = { ...conv, intakeDone: done };
  return { conv: next, steps: [{ type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { intakeDone: next.intakeDone } } }] };
}

export function nextIntakeOrReady(ctx: EngineContext, rawConv: Conversation, profile: Profile): Step[] {
  const skipped = skipHidden(ctx, rawConv, profile);
  let conv = skipped.conv;
  const pre: Step[] = [...skipped.steps];
  const firstOpen = (c: Conversation) => (c.intakePlan ?? []).find((id) => !(c.intakeDone ?? []).includes(id));
  while (firstOpen(conv) === CLARIFY) {
    const expanded = expandClarifiers(ctx, conv, profile);
    conv = expanded.conv;
    pre.push(...expanded.steps);
  }
  const done = conv.intakeDone ?? [];
  // Prefer this conversation's unanswered plan slots (F02e early look / seeded mid-intake).
  // stillOpen(profile) would skip quizzes already on screen when the profile seed already has the field.
  const plan = conv.intakePlan ?? [];
  const nextId = plan.find((id) => !done.includes(id) && id !== CLARIFY);
  const q = nextId ? question(nextId) : undefined;
  // Nothing to ask (the profile already covers it, e.g. sign-up's health basics): guidance straight away.
  // Profile-only chats still wait for a topic. Uncovered concerns go to team handoff (Miro Step 4).
  if (!q && !done.length && !conv.profileOnly && conv.scriptId) {
    return [...pre, ...(isUncoveredConcern(conv) ? uncoveredGuidanceSteps(ctx, conv) : answerSteps(ctx, conv, profile))];
  }
  // DN-11 → DN-12: the red-flag screen is the last question; once it is clear, hand off or answer.
  if (!q && done.some((id) => question(id)?.redFlags) && !conv.profileOnly) {
    return [
      ...pre,
      ...(isUncoveredConcern(conv) ? uncoveredGuidanceSteps(ctx, conv) : answerSteps(ctx, conv, profile)),
    ];
  }
  if (!q) {
    if (!conv.profileOnly && isUncoveredConcern(conv)) return [...pre, ...uncoveredGuidanceSteps(ctx, conv)];
    return [...pre, ...readySteps(ctx, conv, profile)];
  }

  // Consent and the country check aren't numbered steps.
  const numbered = plan.filter((id) => id !== CLARIFY && !question(id)?.hideStep);
  const step = numbered.filter((id) => done.includes(id)).length + 1;
  const concern = conv.openingText?.trim();
  const concernFreeText = q.id === 'session-concern' && !concern;
  const prompt = concernFreeText
    ? "What's your main health concern today? Type it in the box below."
    : q.prompt;
  const text = interpolate(prompt, {
    name: profile.name,
    country: countryName(ctx.region ?? 'US'),
    concern: concern || 'what you shared',
  });
  // F02d: type-only prompts get empty options + input text (composer only, no pills).
  const freeText = q.input === 'text' || concernFreeText;
  const options = freeText ? [] : optionsFor(q, ctx);
  return [
    ...pre,
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { status: 'intake' } } },
    ...deborahText(ctx, text, {
      kind: 'intakeQuestion',
      intake: {
        questionId: q.id,
        options,
        multi: q.multi,
        step,
        of: numbered.length,
        input: freeText ? 'text' : q.input,
        noSkip: q.noSkip,
        hideStep: q.hideStep,
        presentation: q.presentation,
        expandOptions: q.expandOptions,
        widget: q.widget,
        placeholder: q.placeholder,
      },
    }),
  ];
}

/**
 * DN-12: the product card shows only for an adult who is not pregnant or breastfeeding, with no crisis or
 * red flag in this conversation, and with the safety gates (medications, allergies…) known.
 */
export function productAllowed(ctx: EngineContext, conv: Conversation, profile: Profile): boolean {
  const now = new Date(ctx.now);
  if (conv.noProduct || conv.redFlag) return false;
  if (isMinor(profile, now) || !journeyAllowsProduct(conv.journey ?? journeyFor(profile, now))) return false;
  return !(ctx.profileGates !== false && missingGates(profile).length > 0);
}

/** DN-13: Review and Confirm card, when this conversation noted anything for the profile. */
export function reviewFactsSteps(ctx: EngineContext, conv: Conversation): Step[] {
  if (!pendingFacts(conv).length) return [];
  return [{ type: 'delay', ms: 600 }, { type: 'message', message: msg(ctx, { role: 'deborah', kind: 'reviewFacts', text: '' }) }];
}

/** A provider-review ending waits for confirmation, then delivers an uncounted framework. */
export function redFlagSteps(ctx: EngineContext, conv: Conversation): Step[] {
  const next: Conversation = { ...conv, redFlag: true, noProduct: true, status: 'answered', providerReview: conv.providerReview ?? { state: 'waiting', concerns: [] } };
  return [
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { redFlag: true, noProduct: true, status: 'answered', providerReview: next.providerReview } } },
    ...(pendingFacts(next).length
      ? [...deborahText(ctx, providerReviewCopy.lead), ...reviewFactsSteps(ctx, next)]
      : answerSteps(ctx, next, ctx.profile)),
  ];
}

export function readySteps(ctx: EngineContext, conv: Conversation, profile: Profile): Step[] {
  // Onboarding-only chat: the profile is set; wait for her first topic (status empty).
  if (conv.profileOnly) {
    return [
      ...deborahText(ctx, `Thank you, ${profile.name}. Your profile is set. What would you like help with today?`),
      { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { status: 'empty' } } },
    ];
  }
  const script = scriptOf(conv);
  return [
    ...deborahText(ctx, interpolate(script.readyLine, { name: profile.name }), { suggestions: script.suggestedQuestions }),
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { status: 'ready' } } },
  ];
}

/** Answer phase: lead line → thinking → 7 sections streamed → count, summary, plan, prompts. */
export function answerSteps(
  ctx: EngineContext,
  conv: Conversation,
  profile: Profile,
  opts: { retry?: boolean; labs?: LabReport; /** Same-topic lab reassess — uncounted guidance refresh. */ refresh?: boolean } = {},
): Step[] {
  // Every answer entry point shares the same safety and review policy.
  if (conv.status === 'safety' || conv.gentleNext) return [];
  const provider = conv.redFlag === true;
  if (provider && (pendingFacts(conv).length || conv.providerReview?.state === 'done')) return [];
  const refresh = Boolean(opts.refresh || conv.labRefresh);
  const providerState = conv.providerReview ?? { state: 'waiting' as const, concerns: [] };
  const script = scriptOf(conv);
  const [reviewing, handbook, writing] = persona.voice.reviewing;
  const steps: Step[] = [
    {
      type: 'store',
      action: {
        type: 'setConversation',
        conversationId: conv.id,
        patch: { status: 'generating', labRefresh: undefined, ...(provider && { providerReview: { ...providerState, state: 'generating' } }) },
      },
    },
    // A retry resumes the answer without repeating the lead line.
    ...(opts.retry
      ? []
      : deborahText(ctx, provider ? providerReviewCopy.lead : refresh ? 'I’ve updated this with your labs.' : afterVisitLead(conv) + persona.voice.answerLead)),
    // The healing plan is the ongoing chart: concerns, open actions, visits, medicines.
    ...(ctx.healingPlan
      ? [{ type: 'thinking' as const, on: true, label: 'Reading your healing plan' }, { type: 'delay' as const, ms: between(400, 600) }]
      : []),
    // Grounded in the user's own labs: say so while thinking (SourceTrace, design 2026-10-21).
    { type: 'thinking', on: true, label: opts.labs?.values.length ? `Reading your lab report${opts.labs.collectedAt ? ` from ${formatShortDate(opts.labs.collectedAt)}` : ''}…` : reviewing },
    { type: 'delay', ms: between(600, 800) },
    { type: 'thinking', on: true, label: handbook },
    { type: 'delay', ms: between(400, 700) },
    { type: 'thinking', on: true, label: writing },
    { type: 'delay', ms: between(200, 500) },
  ];

  if (ctx.flags.failNext) {
    return [
      ...steps,
      { type: 'thinking', on: false },
      { type: 'store', action: { type: 'clearFailNext' } },
      { type: 'message', message: msg(ctx, { role: 'deborah', kind: 'error', text: "I couldn't finish that — tap to try again." }) },
      { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { status: 'error' } } },
    ];
  }

  const built = provider ? buildProviderReview(script, providerState.concerns) : buildAnswer(script, profile, opts.labs ?? ctx.labs);
  // DN-12: crisis or a red flag earlier in this conversation, pregnancy, a minor, or a missing safety
  // gate (date of birth, sex at birth, medications, allergies) suppresses the product (F03, F01).
  const allowed = !built.product || !recommendsProduct(ctx, true) ? true : productAllowed(ctx, conv, profile);
  const answer = conv.noProduct || !allowed ? { ...built, product: undefined } : built;
  const m = msg(ctx, {
    role: 'deborah',
    kind: 'answer',
    answer: emptyAnswer(answer),
    meta: { streaming: true, activeSection: 'hearing', scriptId: script.id, status: answer.status },
  });
  steps.push({ type: 'thinking', on: false }, { type: 'message', message: m });

  for (const section of answer.sections) {
    steps.push({ type: 'patch', messageId: m.id, patch: { meta: { activeSection: section.key } } });
    if (section.body) steps.push({ type: 'stream', messageId: m.id, field: `section:${section.key}`, text: section.body, cps: CPS.section });
    section.bullets?.forEach((b, i) => {
      steps.push({ type: 'stream', messageId: m.id, field: `bullet:${section.key}:${i}`, text: b, cps: CPS.section });
    });
  }

  if (provider) {
    steps.push(
      { type: 'patch', messageId: m.id, patch: { meta: { streaming: false, activeSection: undefined, counted: false } } },
      { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { status: 'answered', providerReview: { ...providerState, state: 'done' } } } },
    );
    // Safety education does not consume trial quota, create a product plan or ask for reminders.
    return steps;
  }

  const guidanceAt = ctx.now;
  const answeredAfter = ctx.answeredCount + (refresh ? 0 : 1);
  steps.push(
    {
      type: 'patch',
      messageId: m.id,
      patch: {
        suggestions: script.suggestedQuestions,
        meta: { streaming: false, activeSection: undefined, counted: !refresh },
      },
    },
    {
      type: 'store',
      action: {
        type: 'setConversation',
        conversationId: conv.id,
        patch: { status: 'answered', guidanceGivenAt: guidanceAt },
      },
    },
  );
  if (!refresh) {
    steps.push(
      { type: 'store', action: { type: 'completeConsultation', conversationId: conv.id } },
      { type: 'store', action: { type: 'setSummary', conversationId: conv.id, summary: script.answer.summary, topic: script.topic } },
      {
        type: 'store',
        action: {
          type: 'createPlanFromAnswer',
          profileId: profile.id,
          goal: interpolate(script.answer.goal, { name: profile.name }),
          topic: conv.topic?.trim() || script.topic,
          habits: script.answer.habitsForPlan.map((h) => interpolate(h, { name: profile.name })),
          productId: answer.product?.productId,
          status: script.status,
        },
      },
    );
  } else {
    steps.push({
      type: 'store',
      action: { type: 'setSummary', conversationId: conv.id, summary: script.answer.summary, topic: script.topic },
    });
  }
  // DN-13: anything noted in this conversation waits for Confirm before it reaches the profile.
  steps.push(...reviewFactsSteps(ctx, conv));
  // Miro: ~14 days after guidance when permission already granted; else M-2.8 on first answer.
  if (!refresh && ctx.notificationPermission === 'granted') {
    steps.push({ type: 'store', action: { type: 'scheduleGuidanceFollowUp', profileId: profile.id, days: 14 } });
  } else if (!refresh && shouldOfferFollowUp(ctx, answeredAfter)) {
    if (pendingFacts(conv).length) steps.push({ type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { followUpAfterReview: true } } });
    else steps.push({ type: 'delay', ms: 1500 }, { type: 'prompt', prompt: 'followUpOptIn' });
  }
  return steps;
}

/** F09c Step 3: the answer after "Discuss this with Deborah" opens by recalling the visit she logged. */
const afterVisitLead = (conv: Conversation) => (conv.afterVisit ? `${conv.afterVisit.memory} ` : '');
