/** Step builders for each conversation phase (docs/07-ai-simulation.md §2). */
import { persona, scripts } from '../data';
import type { Script } from '../types/content';
import type { Conversation, LabReport, Message, Profile } from '../types/domain';
import type { EngineContext, Step } from '../types/engine';
import { uid } from '../utils/ids';
import { interpolate } from '../utils/text';
import { buildAnswer, emptyAnswer } from './answer';
import { shouldOfferFollowUp } from './counting';
import { question } from './intake';
import { between, CPS } from './streamer';

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

/** Next intake question, or the ready line when intake is complete. */
export function nextIntakeOrReady(ctx: EngineContext, conv: Conversation, profile: Profile): Step[] {
  const plan = conv.intakePlan ?? [];
  const done = conv.intakeDone ?? [];
  const nextId = plan.find((id) => !done.includes(id));
  const q = nextId ? question(nextId) : undefined;
  if (!q) return readySteps(ctx, conv, profile);

  const step = done.length + 1;
  const text = interpolate(q.prompt, { name: profile.name });
  return [
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { status: 'intake' } } },
    ...deborahText(ctx, text, {
      kind: 'intakeQuestion',
      intake: { questionId: q.id, options: q.options, multi: q.multi, step, of: plan.length },
    }),
  ];
}

export function readySteps(ctx: EngineContext, conv: Conversation, profile: Profile): Step[] {
  const script = scriptOf(conv);
  return [
    ...deborahText(ctx, interpolate(script.readyLine, { name: profile.name }), { suggestions: script.suggestedQuestions }),
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { status: 'ready' } } },
  ];
}

/** Answer phase: lead line → thinking → 7 sections streamed → count, summary, plan, prompts. */
export function answerSteps(ctx: EngineContext, conv: Conversation, profile: Profile, opts: { retry?: boolean; labs?: LabReport } = {}): Step[] {
  const script = scriptOf(conv);
  const [reviewing, handbook, writing] = persona.voice.reviewing;
  const steps: Step[] = [
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { status: 'generating' } } },
    // A retry resumes the answer without repeating the lead line.
    ...(opts.retry ? [] : deborahText(ctx, persona.voice.answerLead)),
    { type: 'thinking', on: true, label: reviewing },
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

  const built = buildAnswer(script, profile, opts.labs ?? ctx.labs);
  // Crisis earlier in this conversation suppresses products (docs/ux/F03-safety.md).
  const answer = conv.noProduct ? { ...built, product: undefined } : built;
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

  const answeredAfter = ctx.answeredCount + 1;
  steps.push(
    { type: 'patch', messageId: m.id, patch: { suggestions: script.suggestedQuestions, meta: { streaming: false, activeSection: undefined, counted: true } } },
    { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { status: 'answered' } } },
    { type: 'store', action: { type: 'completeConsultation', conversationId: conv.id } },
    { type: 'store', action: { type: 'setSummary', conversationId: conv.id, summary: script.answer.summary, topic: script.topic } },
    {
      type: 'store',
      action: {
        type: 'createPlanFromAnswer',
        profileId: profile.id,
        goal: interpolate(script.answer.goal, { name: profile.name }),
        habits: script.answer.habitsForPlan.map((h) => interpolate(h, { name: profile.name })),
        productId: answer.product?.productId,
        status: script.status,
      },
    },
  );
  if (shouldOfferFollowUp(ctx, answeredAfter)) steps.push({ type: 'delay', ms: 1500 }, { type: 'prompt', prompt: 'followUpOptIn' });
  return steps;
}
