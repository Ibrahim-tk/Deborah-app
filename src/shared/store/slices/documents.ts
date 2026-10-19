/** F11 Documents and reports — uploads per profile, soft delete (docs/ux/F11-documents.md). */
import type { StateCreator } from 'zustand';
import { nowFrom } from '../../utils/dates';
import type { AppState, DocumentsSlice } from '../types';

type Actions = Pick<DocumentsSlice, 'addDocument' | 'updateDocument' | 'deleteDocument' | 'setDocumentChatPrompt'>;

export const documentsActions: StateCreator<AppState, [], [], Actions> = (set) => ({
  addDocument: (d) => set((s) => ({ documents: { ...s.documents, byId: { ...s.documents.byId, [d.id]: d } } })),
  updateDocument: (id, patch) =>
    set((s) => {
      const d = s.documents.byId[id];
      return d ? { documents: { ...s.documents, byId: { ...s.documents.byId, [id]: { ...d, ...patch, id } } } } : {};
    }),
  // OPEN: soft delete — "we may need it again" (Miro sticky). Hard delete / retention TBD.
  deleteDocument: (id) =>
    set((s) => {
      const d = s.documents.byId[id];
      if (!d || d.deletedAt) return {};
      return {
        documents: {
          byId: { ...s.documents.byId, [id]: { ...d, deletedAt: nowFrom(s).toISOString() } },
          // A deleted document is never offered to Deborah again.
          pendingChatPromptId: s.documents.pendingChatPromptId === id ? undefined : s.documents.pendingChatPromptId,
        },
      };
    }),
  setDocumentChatPrompt: (pendingChatPromptId) => set((s) => ({ documents: { ...s.documents, pendingChatPromptId } })),
});
