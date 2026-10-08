import type { StateCreator } from 'zustand';
import type { Conversation, ID, Message } from '../../types/domain';
import { nowFrom } from '../../utils/dates';
import type { AppState, ConversationsSlice } from '../types';

type Actions = Pick<
  ConversationsSlice,
  | 'startConversation'
  | 'appendMessage'
  | 'patchMessage'
  | 'removeMessage'
  | 'setConversation'
  | 'setActiveConversation'
  | 'archiveActive'
  | 'completeConsultation'
>;

const withConversation = (
  s: AppState,
  id: ID,
  fn: (c: Conversation) => Conversation,
): Partial<AppState> => {
  const c = s.conversations.byId[id];
  if (!c) return {};
  return { conversations: { ...s.conversations, byId: { ...s.conversations.byId, [id]: fn(c) } } };
};

const mapMessages = (c: Conversation, id: ID, fn: (m: Message) => Message): Conversation => ({
  ...c,
  messages: c.messages.map((m) => (m.id === id ? fn(m) : m)),
});

export const conversationsActions: StateCreator<AppState, [], [], Actions> = (set) => ({
  startConversation: (c) =>
    set((s) => ({
      conversations: {
        byId: { ...s.conversations.byId, [c.id]: c },
        activeByProfile: { ...s.conversations.activeByProfile, [c.profileId]: c.id },
      },
    })),
  appendMessage: (cid, m) => set((s) => withConversation(s, cid, (c) => ({ ...c, messages: [...c.messages, m] }))),
  patchMessage: (cid, mid, patch) =>
    set((s) => withConversation(s, cid, (c) => mapMessages(c, mid, (m) => ({ ...m, ...patch, meta: { ...m.meta, ...patch.meta } })))),
  removeMessage: (cid, mid) =>
    set((s) => withConversation(s, cid, (c) => ({ ...c, messages: c.messages.filter((m) => m.id !== mid) }))),
  setConversation: (cid, patch) => set((s) => withConversation(s, cid, (c) => ({ ...c, ...patch }))),
  setActiveConversation: (profileId, cid) =>
    set((s) => ({ conversations: { ...s.conversations, activeByProfile: { ...s.conversations.activeByProfile, [profileId]: cid } } })),
  archiveActive: (profileId) =>
    set((s) => {
      const cid = s.conversations.activeByProfile[profileId];
      const byId = { ...s.conversations.byId };
      const c = cid ? byId[cid] : undefined;
      if (c) {
        // An archived conversation with no messages is just discarded.
        if (c.messages.length === 0) delete byId[c.id];
        else byId[c.id] = { ...c, archived: true, thinking: undefined };
      }
      return { conversations: { byId, activeByProfile: { ...s.conversations.activeByProfile, [profileId]: undefined } } };
    }),
  // Counted when the 7-section answer finishes streaming (docs/07-ai-simulation.md §4).
  completeConsultation: (cid) =>
    set((s) => {
      const c = s.conversations.byId[cid];
      if (!c || c.countedAt) return {};
      const used = s.plan === 'trial' ? Math.min(3, s.freeConsultationsUsed + 1) : s.freeConsultationsUsed;
      return {
        ...withConversation(s, cid, (conv) => ({ ...conv, countedAt: nowFrom(s).toISOString() })),
        freeConsultationsUsed: used,
        limitReachedPending: s.plan === 'trial' && used >= 3,
      };
    }),
});
