/**
 * Engine context for the bridge (docs/07-ai-simulation.md §1): the active profile's conversation
 * and the store snapshot the pure engine needs. Shared by the mobile and web conversation hooks.
 */
import { createConversationEngine } from '../engine';
import {
  selectActiveConversation,
  selectActiveProfile,
  selectAnsweredCount,
  selectLastTopic,
  selectLatestLabs,
  useAppStore,
  type AppState,
} from '../store';
import type { Conversation } from '../types/domain';
import type { EngineContext, UserInput } from '../types/engine';
import { nowFrom, uid } from '../utils';
import { runPlan, type RunHandlers } from './conversationRunner';

const engine = createConversationEngine();

/** The active conversation, creating an empty one for the profile if needed. */
export function ensureConversation(s: AppState): Conversation {
  const existing = selectActiveConversation(s);
  if (existing) return existing;
  const conv: Conversation = { id: uid('c'), profileId: s.activeProfileId, status: 'empty', messages: [], startedAt: nowFrom(s).toISOString() };
  s.startConversation(conv);
  return conv;
}

export function contextFor(s: AppState, conversation: Conversation): EngineContext | null {
  const profile = selectActiveProfile(s);
  if (!profile) return null;
  return {
    profile,
    conversation,
    subscription: { plan: s.plan, freeConsultationsUsed: s.freeConsultationsUsed },
    answeredCount: selectAnsweredCount(s, profile.id),
    sameTopicCount: conversation.scriptId
      ? Object.values(s.conversations.byId).filter((c) => c.profileId === profile.id && c.scriptId === conversation.scriptId && c.countedAt).length
      : 0,
    notificationPermission: s.notificationPermission,
    followUpSnoozeUntil: s.followUpSnoozeUntil,
    flags: { failNext: s.dev.failNext },
    now: nowFrom(s).toISOString(),
    lastTopic: selectLastTopic(s, profile.id),
    labs: selectLatestLabs(s, profile.id),
  };
}

/** Run one user input through the engine for the active profile. Resolves false if gated. */
export async function runInput(input: UserInput, handlers: RunHandlers): Promise<boolean> {
  const conv = ensureConversation(useAppStore.getState());
  const s = useAppStore.getState();
  const ctx = contextFor(s, s.conversations.byId[conv.id] ?? conv);
  if (!ctx) return false;
  return runPlan(engine.handleUserInput(ctx, input), conv.id, handlers);
}
