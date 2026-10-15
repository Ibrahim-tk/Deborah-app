import type { StateCreator } from 'zustand';
import type { ConfirmedFact, Conversation, ID, Message, PendingFact } from '../../types/domain';
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
  | 'proposeFacts'
  | 'confirmFacts'
  | 'discardFacts'
  | 'editFact'
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

const setFacts = (c: Conversation, ids: ID[], fn: (f: PendingFact) => PendingFact): Conversation => ({
  ...c,
  facts: (c.facts ?? []).map((f) => (ids.includes(f.id) && f.status === 'pending' ? fn(f) : f)),
});

export const conversationsActions: StateCreator<AppState, [], [], Actions> = (set, get) => ({
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
  // DN-13: a newer note on the same field replaces the older pending one.
  proposeFacts: (cid, facts) =>
    set((s) =>
      withConversation(s, cid, (c) => {
        const keys = new Set(facts.map((f) => f.key));
        return { ...c, facts: [...(c.facts ?? []).filter((f) => f.status !== 'pending' || !keys.has(f.key)), ...facts] };
      }),
    ),
  // The only path from a conversation to the profile (plan guardrail F-6).
  confirmFacts: (cid, ids) => {
    const s = get();
    const c = s.conversations.byId[cid];
    const picked = (c?.facts ?? []).filter((f) => ids.includes(f.id) && f.status === 'pending');
    if (!c || !picked.length) return;
    const at = nowFrom(s).toISOString();
    for (const f of picked) {
      // Lists also land in the structured health profile (M-2.10, Home), marked as confirmed in chat.
      // First, so the intake patch below keeps the option ids the engine's rules read ("hrt", "thyroid-med").
      if (f.key === 'medications' || f.key === 'allergies' || f.key === 'conditions') {
        const names = f.value === 'None' ? [] : f.value.split(',').map((x) => x.trim()).filter(Boolean);
        const value = f.key === 'allergies' ? names.map((substance) => ({ substance })) : names.map((name) => ({ name }));
        s.setHealth(c.profileId, { [f.key]: { value, source: 'chat', updatedAt: at } });
      }
      if (f.patch.intake && Object.keys(f.patch.intake).length) s.updateIntake(c.profileId, f.patch.intake);
      if (f.patch.profile && Object.keys(f.patch.profile).length) s.updateProfile(c.profileId, f.patch.profile);
    }
    const profile = get().profiles.byId[c.profileId];
    const log: ConfirmedFact[] = picked.map((f) => ({ key: f.key, label: f.label, value: f.value, conversationId: cid, confirmedAt: at }));
    const kept = (profile?.confirmedFacts ?? []).filter((x) => !picked.some((f) => f.key === x.key));
    if (profile) s.updateProfile(c.profileId, { confirmedFacts: [...kept, ...log] });
    set((st) => withConversation(st, cid, (conv) => setFacts(conv, ids, (f) => ({ ...f, status: 'confirmed' }))));
  },
  discardFacts: (cid, ids) => set((s) => withConversation(s, cid, (c) => setFacts(c, ids, (f) => ({ ...f, status: 'discarded' })))),
  editFact: (cid, id, change) => set((s) => withConversation(s, cid, (c) => setFacts(c, [id], (f) => ({ ...f, ...change })))),
});
