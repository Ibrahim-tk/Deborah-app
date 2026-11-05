/** usePolicies — Terms of Service, Privacy Policy and Health Consent versions (stories 9.1 and 9.2).
 *  Published versions are immutable; changes go through a new version (draft → publish). Simulated. */
import { create } from 'zustand';
import seed from './data/policies.json';
import { useAdminStore } from './store';
import { useAdminNotifications } from './notifications';

export interface PolicyVersion {
  version: string;
  text: string;
  /** Short note of what's changed, shown to Clients. */
  summary: string;
  publishedAt: string;
  publishedBy: string;
}

export interface Policy {
  id: 'terms' | 'privacy' | 'health';
  name: string;
  /** Oldest first; the last one is live. */
  versions: PolicyVersion[];
  draft?: { text: string; summary: string };
  /** Clients who have accepted the live version, and who haven't yet. */
  accepted: number;
  notYet: number;
  status: 'placeholder';
}

export const liveVersion = (p: Policy) => p.versions[p.versions.length - 1];

/** Next version number: same year bumps the minor, e.g. 2026.3 → 2026.4. */
export function nextVersion(p: Policy): string {
  const [year, minor] = liveVersion(p).version.split('.').map(Number);
  return `${year}.${(minor ?? 0) + 1}`;
}

interface PoliciesState {
  policies: Policy[];
  saveDraft: (id: Policy['id'], text: string, summary: string) => void;
  discardDraft: (id: Policy['id']) => void;
  publish: (id: Policy['id'], text: string, summary: string) => string;
}

const stamp = () => new Date().toISOString().slice(0, 16);

export const usePolicies = create<PoliciesState>((set, get) => ({
  policies: seed as Policy[],
  saveDraft: (id, text, summary) => {
    set((s) => ({ policies: s.policies.map((p) => (p.id === id ? { ...p, draft: { text, summary } } : p)) }));
    useAdminStore.getState().log(`Saved a draft of the ${get().policies.find((p) => p.id === id)?.name}`);
  },
  discardDraft: (id) => set((s) => ({ policies: s.policies.map((p) => (p.id === id ? { ...p, draft: undefined } : p)) })),
  publish: (id, text, summary) => {
    const p = get().policies.find((x) => x.id === id)!;
    const version = nextVersion(p);
    const by = useAdminStore.getState().email;
    const total = p.accepted + p.notYet;
    set((s) => ({
      policies: s.policies.map((x) =>
        x.id === id ? { ...x, versions: [...x.versions, { version, text, summary, publishedAt: stamp(), publishedBy: by }], draft: undefined, accepted: 0, notYet: total } : x,
      ),
    }));
    useAdminStore.getState().log(`Published ${p.name} version ${version}`);
    useAdminNotifications.getState().post({ category: 'policies', kind: 'policy_published', title: `${p.name} ${version} is live`, body: 'Clients will be asked to accept it when they next open the app.', audience: 'all', severity: 'normal', target: { section: 'compliance' } });
    return version;
  },
}));
