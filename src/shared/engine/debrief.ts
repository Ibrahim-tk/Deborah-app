/**
 * Visit debrief in chat (docs/ux/F09c-log-visit.md › M-2.1 state · Visit debrief).
 * opening → listening → probe (≤ 3, each skippable) → summary → saved → documents from the visit? → Discuss this with the Oracle?
 * Guardrails run before any of this in handleText; debrief turns are never counted.
 * OPEN: "medication card on plain reports" and "out-of-scope on specialty words" in a debrief
 * (docs/ux/F09c-log-visit.md › Safety) — F03 is left exactly as specified.
 */
import { debriefScript as d, DEBRIEF_SCRIPT_ID, visitSpecialties } from '../data';
import type { Conversation, DebriefState, Option, VisitOutcome, VisitProbeId } from '../types/domain';
import type { EngineContext, Step } from '../types/engine';
import { interpolate } from '../utils/text';
import { deborahText, pause, userBubble } from './plans';
import { uid } from '../utils/ids';
import { debriefToConsultSeed, emptyVisitOutcome, extractVisitOutcome, hasProviderSpecialty, nextVisitProbe, visitProfileUpdates, visitSummaryLines } from './visitOutcome';

/** Chat intent: "I just saw my doctor", "back from my appointment" (not a question about one). */
const VISIT_REPORT = /\b(?:just|today|yesterday|this morning)?\s*(?:saw|seen|visited|went to|got back from|back from|had (?:my|an?|the))\b[^.?!]{0,40}\b(?:doctor|provider|appointment|gyn\w*|ob-?gyn|cardiolog\w*|endocrinolog\w*|pcp|gp|specialist|np|nurse practitioner|physician)\b/i;
export const isVisitReport = (text: string) => VISIT_REPORT.test(text) && !/\?\s*$/.test(text.trim());

/** Offer to log the visit after her message (status empty / answered / check-in only). */
export function visitOfferSteps(ctx: EngineContext, text: string): Step[] {
  return [userBubble(ctx, text), ...say(ctx, d.offer, { quickReplies: { options: d.offerOptions } })];
}

const SPECIALTY_REPLIES: Option[] = visitSpecialties.map((s) => ({ id: `spec:${s.id}`, label: s.label }));

const setDebrief = (conv: Conversation, patch: Partial<DebriefState>): Step => ({
  type: 'store',
  action: { type: 'setConversation', conversationId: conv.id, patch: { debrief: { ...conv.debrief!, ...patch } } },
});

const answer = (ctx: EngineContext, messageId: string, optionId: string): Step[] | undefined => {
  const m = ctx.conversation.messages.find((x) => x.id === messageId);
  const option = m?.quickReplies?.options.find((o) => o.id === optionId);
  if (!m?.quickReplies || m.quickReplies.answered || !option) return undefined;
  return [{ type: 'patch', messageId, patch: { quickReplies: { ...m.quickReplies, answered: optionId } } }, userBubble(ctx, option.label)];
};

const say = (ctx: EngineContext, text: string, extra = {}) => [...pause(d.thinking, 500, 800), ...deborahText(ctx, text, extra)];

/** Ask the next gap, or show the summary when there is none. */
function advance(ctx: EngineContext, outcome: VisitOutcome, asked: VisitProbeId[], confidence: DebriefState['confidence']): Step[] {
  const conv = ctx.conversation;
  const probe = nextVisitProbe(outcome, asked);
  if (probe) {
    const replies =
      probe === 'specialty' ? SPECIALTY_REPLIES
      : probe === 'tests' ? [...d.testsOptions, d.skip]
      : probe === 'meds' ? [...d.medsOptions, d.skip]
      : [d.skip];
    return [
      setDebrief(conv, { stage: 'probe', outcome, confidence, asked: [...asked, probe], awaiting: probe }),
      ...say(ctx, d.probes[probe], { quickReplies: { options: replies } }),
    ];
  }
  // "Looks right, save" applies these too, so the card says so before she taps it.
  const updates = visitProfileUpdates(outcome, ctx.profile);
  const lines = [...visitSummaryLines(outcome), ...(updates.length ? [{ label: 'Health profile updates', text: updates.map((u) => u.label).join('; ') }] : [])];
  return [
    setDebrief(conv, { stage: 'summary', outcome, confidence, asked, awaiting: undefined }),
    ...say(ctx, d.summaryTitle, { visitSummary: lines, quickReplies: { options: d.summaryOptions } }),
  ];
}

/** What she typed while the debrief listens or a probe waits. */
export function debriefTextSteps(ctx: EngineContext, text: string): Step[] {
  const conv = ctx.conversation;
  const db = conv.debrief!;
  if (db.stage === 'saved') return [];
  const { outcome, confidence } = extractVisitOutcome(text, db.outcome, db.confidence);
  // The probe asked for this, so keep her words even when no rule matched.
  const o = structuredClone(outcome);
  const plain = text.trim().replace(/[.!]$/, '');
  if (db.awaiting === 'said' && !o.takeaway.said) [o.takeaway.said, confidence['takeaway.said']] = [text.trim(), 0.9];
  if (db.awaiting === 'specialty' && !o.provider.specialty) [o.provider.specialty, o.provider.specialtyOther, confidence['provider.specialty']] = ['other', plain, 0.6];
  if (db.awaiting === 'tests' && !o.tests.length) {
    o.tests = plain.split(/,|\band\b/).map((t) => t.trim()).filter(Boolean).map((name) => ({ name, status: 'ordered' as const }));
    confidence.tests = 0.6;
  }
  if (db.awaiting === 'meds' && !o.medChanges.length && plain) {
    o.medChanges = [{ name: plain, change: 'dose' }];
    confidence.medChanges = 0.5;
  }
  return [userBubble(ctx, text), ...advance(ctx, o, db.asked, confidence)];
}

export function debriefReplySteps(ctx: EngineContext, messageId: string, optionId: string): Step[] {
  const conv = ctx.conversation;
  if (optionId === 'offerLog' || optionId === 'offerNo') return offerReplySteps(ctx, messageId, optionId);
  const db = conv.debrief;
  // "Review and save" opens M-9.8 in the UI and keeps the summary's replies active until saved.
  if (!db || optionId === 'review') return [];
  // "Fill it in myself" opens M-9.8; the opening's replies are kept so she can still tell Deborah.
  if (optionId === 'manual') return [];
  const head = answer(ctx, messageId, optionId);
  if (!head) return [];
  const o = structuredClone(db.outcome);

  switch (optionId) {
    case 'tell':
      return [...head, setDebrief(conv, { stage: 'listening' }), ...say(ctx, d.listening)];
    case 'notNow':
      return [...head, endDebrief(conv), ...say(ctx, d.notNow)];
    case 'skip':
    case 'testsNo':
    case 'medsNo':
      if (db.awaiting === 'specialty' && !hasProviderSpecialty(o)) {
        return [...head, ...advance(ctx, o, db.asked.filter((p) => p !== 'specialty'), db.confidence)];
      }
      return [...head, ...advance(ctx, o, db.asked, db.confidence)];
    case 'testsYes':
      return [...head, setDebrief(conv, { awaiting: 'tests' }), ...say(ctx, d.whichTests)];
    case 'medsYes':
      return [...head, setDebrief(conv, { awaiting: 'meds' }), ...say(ctx, d.whichMeds)];
    case 'save':
      if (!hasProviderSpecialty(o)) {
        return [...head, ...advance(ctx, o, db.asked.filter((p) => p !== 'specialty'), db.confidence)];
      }
      return [...head, { type: 'store', action: { type: 'saveDebriefOutcome', conversationId: conv.id } }, ...savedSteps(ctx, visitProfileUpdates(db.outcome, ctx.profile).length)];
    case 'discussYes': {
      const seed = debriefToConsultSeed(db.outcome);
      // Step 3: back to 'empty' with no script, so her next message starts a normal consultation in this
      // same conversation (counted and gated as usual). `afterVisit` travels with it: answer lead + Visit Brief.
      const afterVisit = { noteId: db.noteId, memory: seed.memory, summary: visitSummaryLines(db.outcome).map((l) => `${l.label}: ${l.text}`).join('. ') };
      return [...head, ...say(ctx, interpolate(d.discussYes, { memory: seed.memory })), { type: 'store', action: { type: 'setConversation', conversationId: conv.id, patch: { status: 'empty', scriptId: undefined, topic: seed.topic, afterVisit } } }];
    }
    case 'uploadDoc':
    case 'uploadNo':
      // Values are typed into the chat as text (no uploads); either way Deborah moves on to "talk it through?".
      return [...head, ...say(ctx, d.discuss, { quickReplies: { options: d.discussOptions } })];
    case 'discussNo':
      return [...head, endDebrief(conv), ...say(ctx, d.discussNo)];
    default:
      if (optionId.startsWith('spec:')) {
        o.provider.specialty = optionId.slice(5) as VisitOutcome['provider']['specialty'];
        return [...head, ...advance(ctx, o, db.asked, { ...db.confidence, 'provider.specialty': 1 })];
      }
      return [];
  }
}

/** M-9.8 saved the visit opened from this debrief. */
export function debriefSavedSteps(ctx: EngineContext, noteId: string, outcome: VisitOutcome, applied = 0): Step[] {
  const conv = ctx.conversation;
  if (!conv.debrief || conv.debrief.stage === 'saved') return [];
  const summary = [...conv.messages].reverse().find((m) => m.quickReplies && !m.quickReplies.answered);
  return [
    ...(summary?.quickReplies ? [{ type: 'patch', messageId: summary.id, patch: { quickReplies: { ...summary.quickReplies, answered: 'review' } } } as Step] : []),
    setDebrief(conv, { stage: 'saved', outcome, noteId, awaiting: undefined }),
    ...savedSteps(ctx, applied),
  ];
}

const savedSteps = (ctx: EngineContext, applied = 0) =>
  say(ctx, `${applied ? interpolate(d.savedWithFacts, { count: String(applied), changes: applied === 1 ? 'change' : 'changes' }) : d.saved} ${d.upload}`, { quickReplies: { options: d.uploadOptions } });

/** Leave the debrief: the conversation behaves like an answered one from here. */
const endDebrief = (conv: Conversation): Step => ({
  type: 'store',
  action: { type: 'setConversation', conversationId: conv.id, patch: { status: 'answered', topic: conv.topic ?? 'Log your visit' } },
});

/** "Log my visit" reads the message that prompted the offer into a new debrief, then asks only for gaps. */
function offerReplySteps(ctx: EngineContext, messageId: string, optionId: string): Step[] {
  const head = answer(ctx, messageId, optionId);
  if (!head) return [];
  if (optionId === 'offerNo') return [...head, ...say(ctx, d.offerNo)];
  const msgs = ctx.conversation.messages;
  const said = msgs.slice(0, msgs.findIndex((m) => m.id === messageId)).reverse().find((m) => m.role === 'user')?.text ?? '';
  const { outcome, confidence } = extractVisitOutcome(said, emptyVisitOutcome(ctx.now));
  const conv: Conversation = {
    id: uid('c'),
    profileId: ctx.profile.id,
    scriptId: DEBRIEF_SCRIPT_ID,
    status: 'debrief',
    debrief: { stage: 'listening', outcome, confidence, asked: [] },
    messages: [],
    startedAt: ctx.now,
  };
  const next = { ...ctx, conversation: conv };
  return [
    ...head,
    { type: 'store', action: { type: 'startConversation', conversation: conv } },
    // The new thread starts with her own words, so the summary has visible context.
    userBubble(next, said),
    ...say(next, d.offerAck),
    ...advance(next, outcome, [], confidence),
  ];
}
