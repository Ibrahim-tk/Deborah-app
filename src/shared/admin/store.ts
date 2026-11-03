/** useAdminStore — the Super Admin panel's own client store. Separate from the app store on purpose. */
import { create } from 'zustand';
import { seed } from './data';
import type { AdminRole, AdminUser, AuditEntry, EscalationStatus, IntegrationId, Plan } from './types';

type Seed = typeof seed;

export interface AdminState extends Seed {
  signedIn: boolean;
  role: AdminRole;
  email: string;
  signIn: (email: string) => void;
  signOut: () => void;
  setRole: (role: AdminRole) => void;
  log: (text: string) => void;
  setClientAccount: (id: string, active: boolean) => void;
  setEscalationStatus: (id: string, status: EscalationStatus) => void;
  resolveSupport: (id: string) => void;
  acceptTransfer: (requestId: string, dependentId: string) => void;
  decideDeletion: (id: string, approve: boolean) => void;
  inviteAdmin: (name: string, email: string, role: AdminRole) => void;
  resendInvite: (id: string) => void;
  setAdminAccount: (id: string, active: boolean) => void;
  savePlan: (plan: Plan) => void;
  clearLogEntry: (id: string) => void;
  clearLog: () => void;
  uploadConsent: (name: string) => void;
  setStripeConnecting: () => void;
  connectStripe: () => void;
  setStripeMode: (mode: 'test' | 'live') => void;
  disconnectStripe: () => void;
  setIntegration: (id: IntegrationId, connect: boolean, account?: string) => void;
}

/** Prototype clock: everything is relative to the seeded "today". */
export const ADMIN_NOW = '2026-11-02T12:00';
const stamp = () => new Date().toISOString().slice(0, 16);
let n = 0;
const uid = (p: string) => `${p}${Date.now().toString(36)}${n++}`;
const nameOf = (s: Seed, id: string) => s.clients.find((c) => c.id === id)?.name ?? id;

export const useAdminStore = create<AdminState>((set, get) => {
  const log = (text: string) =>
    set((s) => ({ auditLog: [{ id: uid('l'), at: stamp(), actor: s.email, text } as AuditEntry, ...s.auditLog] }));
  return {
    ...seed,
    signedIn: false,
    role: 'super',
    email: 'deborah@oracleclinician.com',
    signIn: (email) => {
      set({ signedIn: true, email: email || get().email });
      log('Signed in');
    },
    signOut: () => {
      log('Signed out');
      set({ signedIn: false });
    },
    setRole: (role) => set({ role }),
    log,
    setClientAccount: (id, active) => {
      set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, account: active ? 'active' : 'deactivated' } : c)) }));
      log(`${active ? 'Reactivated' : 'Deactivated'} client ${nameOf(get(), id)}`);
    },
    setEscalationStatus: (id, status) => {
      set((s) => ({
        escalations: s.escalations.map((e) =>
          e.id === id ? { ...e, status, closed: status === 'resolved' ? stamp() : undefined } : e,
        ),
      }));
      log(status === 'resolved' ? `Closed case ${id}` : `Reopened case ${id}`);
    },
    resolveSupport: (id) => {
      set((s) => ({ supportRequests: s.supportRequests.map((r) => (r.id === id ? { ...r, resolved: true } : r)) }));
      log(`Resolved support request ${id}`);
    },
    acceptTransfer: (requestId, dependentId) => {
      set((s) => ({
        deletionRequests: s.deletionRequests.map((r) =>
          r.id !== requestId ? r : {
            ...r,
            decisions: r.decisions.map((d) =>
              d.dependentId === dependentId && d.action === 'transfer' ? { ...d, transfer: 'accepted' as const } : d,
            ),
          },
        ),
      }));
      log(`Dependent transfer accepted for ${dependentId}`);
    },
    decideDeletion: (id, approve) => {
      const req = get().deletionRequests.find((r) => r.id === id);
      set((s) => ({
        deletionRequests: s.deletionRequests.map((r) => (r.id === id ? { ...r, status: approve ? 'deleted' : 'rejected' } : r)),
        clients: approve && req ? s.clients.map((c) => (c.id === req.clientId ? { ...c, account: 'deactivated' } : c)) : s.clients,
      }));
      log(`${approve ? 'Approved and deleted' : 'Rejected'} data request ${id}`);
    },
    inviteAdmin: (name, email, role) => {
      const admin: AdminUser = { id: uid('a'), name, email, role, account: 'active', invite: 'pending', invitedAt: stamp() };
      set((s) => ({ admins: [...s.admins, admin] }));
      log(`Invited ${email} as ${role === 'super' ? 'super admin' : 'admin'}`);
    },
    resendInvite: (id) => {
      set((s) => ({ admins: s.admins.map((a) => (a.id === id ? { ...a, invite: 'pending', invitedAt: stamp() } : a)) }));
      log(`Resent invite to ${get().admins.find((a) => a.id === id)?.email}`);
    },
    setAdminAccount: (id, active) => {
      set((s) => ({ admins: s.admins.map((a) => (a.id === id ? { ...a, account: active ? 'active' : 'deactivated' } : a)) }));
      log(`${active ? 'Reactivated' : 'Deactivated'} admin ${get().admins.find((a) => a.id === id)?.email}`);
    },
    savePlan: (plan) => {
      const exists = get().plans.some((p) => p.id === plan.id);
      set((s) => ({ plans: exists ? s.plans.map((p) => (p.id === plan.id ? plan : p)) : [...s.plans, plan] }));
      log(`${exists ? 'Updated' : 'Created'} plan ${plan.name}`);
    },
    clearLogEntry: (id) => set((s) => ({ auditLog: s.auditLog.filter((e) => e.id !== id) })),
    clearLog: () => set({ auditLog: [] }),
    setStripeConnecting: () => set((s) => ({ stripe: { ...s.stripe, status: 'connecting' } })),
    connectStripe: () => {
      set((s) => ({
        stripe: {
          status: 'connected',
          mode: 'test',
          account: { id: 'acct_1PxQe8Gd7Oracle', name: 'Genesis Health LLC', email: 'billing@oracleclinician.com', country: 'US', payoutsEnabled: true, detailsComplete: true },
          webhook: { url: 'https://api.oracleclinician.com/webhooks/stripe', status: 'active', lastEventAt: stamp() },
        },
        plans: s.plans.map((p) => (p.monthly ? { ...p, stripePriceId: `price_${p.id.replace(/-/g, '_')}` } : p)),
      }));
      log('Connected Stripe account Genesis Health LLC (test mode)');
    },
    setStripeMode: (mode) => {
      set((s) => ({ stripe: { ...s.stripe, mode } }));
      log(`Switched Stripe to ${mode} mode`);
    },
    disconnectStripe: () => {
      set((s) => ({ stripe: { status: 'disconnected', mode: 'test', account: null, webhook: null }, plans: s.plans.map(({ stripePriceId: _drop, ...p }) => p) }));
      log('Disconnected Stripe');
    },
    setIntegration: (id, connect, account) => {
      set((s) => ({ integrations: { ...s.integrations, [id]: connect ? { connected: true, account, connectedAt: stamp() } : { connected: false } } }));
      const name = { dropbox: 'Dropbox', shopify: 'Shopify', googleDocs: 'Google Docs' }[id];
      log(`${connect ? 'Connected' : 'Disconnected'} ${name}`);
    },
    uploadConsent: (name) => {
      set((s) => ({ consentVersions: [{ id: uid('cv'), name, uploadedAt: stamp(), uploadedBy: s.email }, ...s.consentVersions] }));
      log(`Uploaded consent version ${name}`);
    },
  };
});
