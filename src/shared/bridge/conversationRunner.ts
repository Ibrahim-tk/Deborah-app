/**
 * Engine bridge runner (docs/07-ai-simulation.md §1). Executes an EnginePlan step by step with
 * timers against the app store. Lives at module level so a plan keeps running when the user
 * navigates away; Stop cancels the remaining steps.
 */
import { create } from 'zustand';
import { chunkText, forFamilyMember, hasProviderSpecialty, resolvePronouns, streamInto, visitProfileUpdates } from '../engine';
import { SELF_PROFILE_ID, useAppStore } from '../store';
import type { EnginePlan, Step, StoreAction } from '../types/engine';
import { sleep } from '../utils';

export interface RunHandlers {
  onGate: () => void;
  onPrompt: (prompt: 'followUpOptIn') => void;
}

/** Which conversations have a plan in flight (drives Stop and composer locking). */
export const useRunnerStore = create<{ busy: Record<string, boolean> }>()(() => ({ busy: {} }));
const setBusy = (cid: string, busy: boolean) => useRunnerStore.setState((s) => ({ busy: { ...s.busy, [cid]: busy } }));

const tokens = new Map<string, { cancelled: boolean }>();

// Scenario reset must invalidate background plans before their next store write or prompt.
// The subscription also covers resets initiated outside the journey dashboard.
useAppStore.subscribe((s, previous) => {
  if (s.scenario.loadNonce === previous.scenario.loadNonce) return;
  for (const token of tokens.values()) token.cancelled = true;
  tokens.clear();
  useRunnerStore.setState({ busy: {} });
});

const speedFactor = () => ({ normal: 1, slow: 3, instant: 0 })[useAppStore.getState().dev.speed];

async function wait(ms: number, token: { cancelled: boolean }) {
  const f = speedFactor();
  if (f > 0 && ms > 0) await sleep(ms * f);
  return !token.cancelled;
}

function applyAction(action: StoreAction, cid: string): string {
  const s = useAppStore.getState();
  switch (action.type) {
    case 'startConversation':
      s.archiveActive(action.conversation.profileId);
      s.startConversation(action.conversation);
      return action.conversation.id;
    case 'setConversation':
      s.setConversation(action.conversationId, action.patch);
      break;
    case 'updateIntake':
      s.updateIntake(action.profileId, action.patch);
      break;
    case 'completeConsultation':
      s.completeConsultation(action.conversationId);
      break;
    case 'setSummary':
      s.setConversation(action.conversationId, { summary: action.summary, topic: action.topic });
      break;
    case 'createPlanFromAnswer':
      s.createPlanFromAnswer(action.profileId, action.goal, action.habits, action.productId, action.status, action.topic);
      break;
    case 'scheduleGuidanceFollowUp':
      s.scheduleGuidanceFollowUp(action.profileId, action.days);
      break;
    case 'updateProfile':
      s.updateProfile(action.profileId, action.patch);
      break;
    case 'acceptHealthConsent':
      s.acceptHealthConsent();
      break;
    case 'saveDebriefOutcome': {
      const c = s.conversations.byId[action.conversationId];
      if (!c?.debrief || !hasProviderSpecialty(c.debrief.outcome)) break;
      const noteId = s.saveVisitOutcome(c.profileId, c.debrief.outcome, c.debrief.noteId);
      const profile = s.profiles.byId[c.profileId];
      if (profile) s.applyVisitUpdates(c.profileId, visitProfileUpdates(c.debrief.outcome, profile));
      s.setConversation(c.id, { debrief: { ...c.debrief, stage: 'saved', noteId, awaiting: undefined } });
      break;
    }
    case 'proposeFacts':
      s.proposeFacts(action.conversationId, action.facts);
      break;
    case 'clearFailNext':
      s.setDev({ failNext: false });
      break;
  }
  return cid;
}

async function stream(step: Extract<Step, { type: 'stream' }>, cid: string, token: { cancelled: boolean }) {
  const chunks = speedFactor() === 0 ? [{ text: step.text, ms: 0 }] : chunkText(step.text, step.cps);
  for (const chunk of chunks) {
    if (token.cancelled) return false;
    const s = useAppStore.getState();
    const m = s.conversations.byId[cid]?.messages.find((x) => x.id === step.messageId);
    if (!m) return false;
    const next = streamInto(m, step.field, chunk.text, true);
    s.patchMessage(cid, m.id, step.field === 'text' ? { text: next.text } : { answer: next.answer });
    if (!(await wait(chunk.ms, token))) return false;
  }
  return true;
}

/** A family member's chat: Oracle speaks about them in third person, with their pronouns. */
function inPerspective(plan: EnginePlan, conversationId: string): EnginePlan {
  const s = useAppStore.getState();
  const started = plan.find((x) => x.type === 'store' && x.action.type === 'startConversation');
  const profileId =
    s.conversations.byId[conversationId]?.profileId ??
    (started?.type === 'store' && started.action.type === 'startConversation' ? started.action.conversation.profileId : undefined);
  const profile = profileId ? s.profiles.byId[profileId] : undefined;
  if (!profile || profile.id === SELF_PROFILE_ID || !profile.name) return plan;
  return forFamilyMember(plan, profile.name, resolvePronouns(profile));
}

/** Returns false when the plan was gated (the caller keeps the user's text in the composer). */
export async function runPlan(source: EnginePlan, conversationId: string, handlers: RunHandlers): Promise<boolean> {
  const plan = inPerspective(source, conversationId);
  if (plan[0]?.type === 'gate') {
    handlers.onGate();
    return false;
  }
  let cid = conversationId;
  const token = { cancelled: false };
  tokens.set(cid, token);
  setBusy(cid, true);
  try {
    for (const step of plan) {
      if (token.cancelled) break;
      const s = useAppStore.getState();
      switch (step.type) {
        case 'delay':
          await wait(step.ms, token);
          break;
        case 'thinking':
          s.setConversation(cid, { thinking: step.on ? step.label : undefined });
          break;
        case 'message':
          s.appendMessage(cid, step.message);
          break;
        case 'patch':
          s.patchMessage(cid, step.messageId, step.patch);
          break;
        case 'stream':
          await stream(step, cid, token);
          break;
        case 'store': {
          const next = applyAction(step.action, cid);
          if (next !== cid) {
            // The plan continues in a new conversation: move the token and busy flag along.
            tokens.delete(cid);
            setBusy(cid, false);
            cid = next;
            tokens.set(cid, token);
            setBusy(cid, true);
          }
          break;
        }
        case 'gate':
          // Gate after safety content: the text was already sent, so the composer stays clear.
          handlers.onGate();
          return true;
        case 'prompt':
          handlers.onPrompt(step.prompt);
          break;
        case 'error':
          break;
      }
    }
  } catch (err) {
    console.error('[conversationRunner] plan failed', err);
  } finally {
    if (tokens.get(cid) === token) {
      tokens.delete(cid);
      setBusy(cid, false);
      // A run that ended early (cancelled or threw) must not leave a message "still writing":
      // MessageList hides an intake question's answers while it streams, which strands the chat.
      settleStreaming(cid);
    }
  }
  return true;
}

/** Clears leftover `streaming` flags once nothing is running for the conversation (answers keep Stop semantics). */
function settleStreaming(cid: string) {
  const s = useAppStore.getState();
  const c = s.conversations.byId[cid];
  if (!c) return;
  for (const m of c.messages) {
    if (m.meta?.streaming && m.kind !== 'answer') s.patchMessage(cid, m.id, { meta: { ...m.meta, streaming: false } });
  }
}

/** Stop: cancel remaining steps; a partial answer is marked stopped and is not counted. */
export function stopPlan(conversationId: string) {
  const token = tokens.get(conversationId);
  if (token) token.cancelled = true;
  const s = useAppStore.getState();
  const c = s.conversations.byId[conversationId];
  if (!c) return;
  for (const m of c.messages) {
    if (m.meta?.streaming) s.patchMessage(conversationId, m.id, { meta: { streaming: false, stopped: m.kind === 'answer', activeSection: undefined } });
  }
  s.setConversation(conversationId, { thinking: undefined, status: c.status === 'generating' ? 'ready' : c.status });
}
