/**
 * Replays a topic script instantly to a checkpoint so scenarios don't duplicate long message
 * arrays (`"@script:<id>#<checkpoint>"`, docs/05-state-and-scenarios.md §4).
 */
import type { Conversation, Intake, LabReport, Message, Profile } from '../types/domain';
import type { EngineContext, Step } from '../types/engine';
import { createConversationEngine } from './index';
import { question } from './intake';
import { scripts } from '../data';

export type Checkpoint = 'intake-1' | 'ready' | 'answered';

export interface ReplayOptions {
  conversationId: string;
  profile: Profile;
  now: string;
  /** Confirmed labs for the profile: lab-informed scripts replay with them. */
  labs?: LabReport;
}

/** Apply one step with no timers: streams land in full, prompts and delays are ignored. */
function applyInstant(conv: Conversation, profile: Profile, step: Step): [Conversation, Profile] {
  const patchMsg = (id: string, fn: (m: Message) => Message) => ({ ...conv, messages: conv.messages.map((m) => (m.id === id ? fn(m) : m)) });
  switch (step.type) {
    case 'message':
      return [{ ...conv, messages: [...conv.messages, step.message] }, profile];
    case 'patch':
      return [patchMsg(step.messageId, (m) => ({ ...m, ...step.patch, meta: { ...m.meta, ...step.patch.meta } })), profile];
    case 'stream':
      return [patchMsg(step.messageId, (m) => streamInto(m, step.field, step.text)), profile];
    case 'store': {
      const a = step.action;
      if (a.type === 'setConversation') return [{ ...conv, ...a.patch }, profile];
      if (a.type === 'updateIntake') return [conv, { ...profile, intake: { ...profile.intake, ...a.patch } }];
      if (a.type === 'completeConsultation') return [{ ...conv, countedAt: conv.countedAt ?? conv.startedAt }, profile];
      if (a.type === 'setSummary') return [{ ...conv, summary: a.summary, topic: a.topic }, profile];
      return [conv, profile];
    }
    default:
      return [conv, profile];
  }
}

/** Write streamed text into a message field ('text', 'section:<key>', 'bullet:<key>:<i>'). */
export function streamInto(m: Message, field: string, text: string, append = false): Message {
  if (field === 'text') return { ...m, text: append ? (m.text ?? '') + text : text };
  if (!m.answer) return m;
  const [kind, key, index] = field.split(':');
  const sections = m.answer.sections.map((s) => {
    if (s.key !== key) return s;
    if (kind === 'section') return { ...s, body: append ? s.body + text : text };
    const bullets = [...(s.bullets ?? [])];
    const i = Number(index);
    bullets[i] = append ? (bullets[i] ?? '') + text : text;
    return { ...s, bullets };
  });
  return { ...m, answer: { ...m.answer, sections } };
}

/** Option ids the seed profile already "answered" with, so replays match the seeded intake. */
function answerFor(questionId: string, intake: Intake): string[] {
  if (questionId === 'age') return intake.ageBand ? [intake.ageBand] : ['46-50'];
  if (questionId === 'meds') return intake.conditions.length ? intake.conditions : ['none'];
  if (questionId === 'cycle' || questionId === 'teen-regularity') return [intake.cycle ?? 'irregular'];
  if (questionId === 'teen-onset') return [intake.onset ?? '1-2y'];
  return [question(questionId)?.options[0].id ?? ''];
}

export function replayScript(scriptId: string, checkpoint: Checkpoint, opts: ReplayOptions): Conversation {
  const engine = createConversationEngine();
  const script = scripts[scriptId] ?? scripts.generic;
  const seedIntake = opts.profile.intake;
  // Replay as if nothing were known yet, so every intake question appears in the history.
  let profile: Profile = { ...opts.profile, intake: { conditions: [], medications: [] } };
  let conv: Conversation = { id: opts.conversationId, profileId: profile.id, status: 'empty', messages: [], startedAt: opts.now };

  const run = (input: Parameters<typeof engine.handleUserInput>[1]) => {
    const ctx: EngineContext = {
      profile,
      conversation: conv,
      subscription: { plan: 'individual', freeConsultationsUsed: 0 },
      answeredCount: 99,
      sameTopicCount: 0,
      notificationPermission: 'granted',
      followUpSnoozeUntil: 0,
      flags: { failNext: false },
      now: opts.now,
      labs: opts.labs,
    };
    for (const step of engine.handleUserInput(ctx, input)) [conv, profile] = applyInstant(conv, profile, step);
  };

  run({ kind: 'text', text: script.openingMessage, scriptId: script.id });
  if (checkpoint === 'intake-1') return conv;
  for (const qid of conv.intakePlan ?? []) run({ kind: 'intakeAnswer', questionId: qid, optionIds: answerFor(qid, seedIntake) });
  if (checkpoint === 'ready') return conv;
  run({ kind: 'requestAnswer' });
  return conv;
}
