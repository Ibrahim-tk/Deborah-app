/** useKnowledge — Knowledge Base content and knowledge gaps (stories 6.1–6.3). The Oracle only uses Published
 *  content. Super Admin edits publish straight away; Admin edits and additions wait as Pending approval, and only
 *  the Super Admin can approve or reject. Content is archived, never deleted. Simulated. */
import { create } from 'zustand';
import seed from './data/knowledge.json';
import { useAdminStore } from './store';
import { useAdminNotifications } from './notifications';

export const CONTENT_TYPES = ['Book', 'Protocol', 'Blog post', 'Q&A answer', 'Symptom chart', 'Diagnostic tree', 'Case study', 'Knowledge gap answer'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];
export type ContentStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
export type GapStatus = 'new' | 'answered' | 'dismissed';

export interface ContentVersion { version: number; by: string; at: string; text: string }

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  source: 'Uploaded';
  status: ContentStatus;
  version: number;
  updated: string;
  history: ContentVersion[];
  /** Linked knowledge gap, when this answers one. */
  gapId?: string;
  rejectReason?: string;
  /** Wellness Protocols are also shown to Clients in their Wellness Plan. */
  wellness?: boolean;
  status_copy: 'placeholder';
}

export interface KnowledgeGap {
  id: string;
  question: string;
  topic: string;
  timesAsked: number;
  status: GapStatus;
  firstAsked: string;
  lastAsked: string;
  dismissReason?: string;
}

export const CONTENT_STATUS: Record<ContentStatus, string> = { draft: 'Draft', pending: 'Pending approval', published: 'Published', rejected: 'Rejected', archived: 'Archived' };
export const GAP_STATUS: Record<GapStatus, string> = { new: 'New', answered: 'Answered', dismissed: 'Dismissed' };
export const contentText = (c: ContentItem) => c.history.find((h) => h.version === c.version)?.text ?? '';

interface KnowledgeState {
  items: ContentItem[];
  gaps: KnowledgeGap[];
  /** New content or a new version. `publish` false saves a draft. Returns the item id. */
  save: (input: { id?: string; title: string; type: ContentType; text: string; gapId?: string }, publish: boolean) => string;
  approve: (id: string) => void;
  reject: (id: string, reason: string) => void;
  archive: (id: string) => void;
  restore: (id: string) => void;
  rollBack: (id: string, version: number) => void;
  dismissGap: (id: string, reason: string) => void;
  reopenGap: (id: string) => void;
}

const stamp = () => new Date().toISOString().slice(0, 16);
const me = () => useAdminStore.getState();
const log = (text: string) => me().log(text);
let n = 0;

export const useKnowledge = create<KnowledgeState>((set, get) => {
  const patch = (id: string, fn: (c: ContentItem) => ContentItem) => set((s) => ({ items: s.items.map((c) => (c.id === id ? fn(c) : c)) }));
  const answerGap = (gapId?: string) => gapId && set((s) => ({ gaps: s.gaps.map((g) => (g.id === gapId ? { ...g, status: 'answered' } : g)) }));

  return {
    items: seed.items as ContentItem[],
    gaps: seed.gaps as KnowledgeGap[],
    save: ({ id, title, type, text, gapId }, publish) => {
      const superAdmin = me().role === 'super';
      // Publishing as an Admin sends it for approval instead.
      const status: ContentStatus = !publish ? 'draft' : superAdmin ? 'published' : 'pending';
      const existing = get().items.find((c) => c.id === id);
      const version = existing ? existing.version + 1 : 1;
      const entry = { version, by: me().email, at: stamp(), text };
      const itemId = existing?.id ?? `k${Date.now().toString(36)}${n++}`;
      if (existing) patch(itemId, (c) => ({ ...c, title, type, status, version, updated: entry.at, history: [...c.history, entry], rejectReason: undefined }));
      else set((s) => ({ items: [{ id: itemId, title, type, source: 'Uploaded', status, version, updated: entry.at, history: [entry], gapId, status_copy: 'placeholder' }, ...s.items] }));
      if (status === 'published') answerGap(gapId ?? existing?.gapId);
      if (status === 'pending') {
        useAdminNotifications.getState().post({ category: 'content', kind: 'content_pending', title: 'Content waiting for approval', body: `“${title}” is waiting for your approval.`, audience: 'super', severity: 'normal', target: { section: 'knowledge' } });
      }
      log(`${existing ? 'Edited' : 'Added'} content “${title}” (${status === 'draft' ? 'draft' : status === 'pending' ? 'sent for approval' : 'published'})`);
      return itemId;
    },
    approve: (id) => {
      const c = get().items.find((x) => x.id === id);
      patch(id, (x) => ({ ...x, status: 'published', updated: stamp() }));
      answerGap(c?.gapId);
      log(`Approved and published content “${c?.title}”`);
    },
    reject: (id, reason) => {
      patch(id, (x) => ({ ...x, status: 'rejected', rejectReason: reason }));
      log(`Rejected content “${get().items.find((x) => x.id === id)?.title}”`);
    },
    archive: (id) => {
      patch(id, (x) => ({ ...x, status: 'archived' }));
      log(`Archived content “${get().items.find((x) => x.id === id)?.title}”`);
    },
    restore: (id) => {
      patch(id, (x) => ({ ...x, status: 'published' }));
      log(`Restored content “${get().items.find((x) => x.id === id)?.title}”`);
    },
    rollBack: (id, version) => {
      const c = get().items.find((x) => x.id === id);
      const text = c?.history.find((h) => h.version === version)?.text ?? '';
      if (c) get().save({ id, title: c.title, type: c.type, text }, true);
      log(`Rolled back “${c?.title}” to version ${version}`);
    },
    dismissGap: (id, reason) => {
      set((s) => ({ gaps: s.gaps.map((g) => (g.id === id ? { ...g, status: 'dismissed', dismissReason: reason } : g)) }));
      log(`Dismissed knowledge gap ${id}`);
    },
    reopenGap: (id) => {
      set((s) => ({ gaps: s.gaps.map((g) => (g.id === id ? { ...g, status: 'new', dismissReason: undefined } : g)) }));
      log(`Reopened knowledge gap ${id}`);
    },
  };
});
