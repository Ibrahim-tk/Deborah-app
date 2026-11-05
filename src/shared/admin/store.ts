/** useAdminStore — the Super Admin panel's own client store. Separate from the app store on purpose. */
import { create } from 'zustand';
import { useAdminNotifications } from './notifications';
import { categorize } from './audit';
import { seed } from './data';
import type { AdminRole, AdminUser, IntegrationId, Plan } from './types';

type Seed = typeof seed;

export interface AdminState extends Seed {
  signedIn: boolean;
  /** When this session signed in (shown on My Profile, story 12.1). */
  lastSignInAt: string;
  role: AdminRole;
  email: string;
  signIn: (email: string) => void;
  /** Stops the simulated auto-accept so a walkthrough of the invite email can finish the setup. */
  holdInvite: (id: string) => void;
  signOut: () => void;
  setRole: (role: AdminRole) => void;
  log: (text: string) => void;
  /** Story 3.2: a reason is required to deactivate; a parent's invited teens are paused (and restored on reactivation). */
  setClientAccount: (id: string, active: boolean, reason?: string) => void;
  /** Mark reviewed (with the reviewer's notes) or back to not yet reviewed. Story 4.1. */
  reviewEscalation: (id: string, reviewed: boolean, notes: string) => void;
  /** Resolve or reopen a support request (story 5.1). */
  setSupportResolved: (id: string, resolved: boolean) => void;
  /** Story 3.1: change a Client's email; resolves their open Email Change Request. */
  changeClientEmail: (clientId: string, email: string) => void;
  saveSupportNote: (id: string, notes: string) => void;
  acceptTransfer: (requestId: string, dependentId: string) => void;
  /** Story 5.2 deletion workflow. */
  setDeletionCheck: (id: string, key: 'identity' | 'legalHold', value: boolean) => void;
  completeDeletion: (id: string) => void;
  setLegalHold: (id: string, on: boolean, note: string) => void;
  /** For a teen who can't sign in and emailed from their registered address. Returns the new id. */
  createDeletion: (teenId: string, received: string, note: string) => string;
  saveDeletionNote: (id: string, notes: string) => void;
  /** Story 7.2: invites are always for the Admin role; there's one Super Admin. */
  inviteAdmin: (firstName: string, lastName: string, email: string) => void;
  resendInvite: (id: string) => void;
  /** Story 7.1: the link stops working and the Admin is removed from the listing. */
  cancelInvite: (id: string) => void;
  /** Story 7.2: the invitee set a password and verified their email; the super admin is notified. */
  completeAdminSetup: (id: string) => void;
  /** Names only; the email can't be edited because it's used to sign in. */
  editAdmin: (id: string, firstName: string, lastName: string) => void;
  setAdminAccount: (id: string, active: boolean, reason?: string) => void;
  savePlan: (plan: Plan) => void;
  /** Audit logs are append-only: no edit, clear or delete (story 10.1). */
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
const inviteTimers = new Map<string, ReturnType<typeof setTimeout>>();
const clearInviteTimer = (id: string) => {
  const timer = inviteTimers.get(id);
  if (timer) clearTimeout(timer);
  inviteTimers.delete(id);
};
const nameOf = (s: Seed, id: string) => s.clients.find((c) => c.id === id)?.name ?? id;

export const useAdminStore = create<AdminState>((set, get) => {
  const log = (text: string) =>
    set((s) => ({ auditLog: [{ id: uid('l'), at: stamp(), actor: s.email, role: s.role, category: categorize(text), text }, ...s.auditLog] }));
  return {
    ...seed,
    signedIn: false,
    lastSignInAt: '2026-11-02T08:00',
    role: 'super',
    email: 'deborah@oracleclinician.com',
    signIn: (email) => {
      const next = email || get().email;
      const match = get().admins.find((a) => a.email.toLowerCase() === next.toLowerCase());
      set({ signedIn: true, email: next, role: match?.role ?? get().role, lastSignInAt: stamp() });
      log('Signed in');
    },
    holdInvite: (id) => clearInviteTimer(id),
    signOut: () => {
      log('Signed out');
      set({ signedIn: false });
    },
    setRole: (role) => set({ role }),
    log,
    setClientAccount: (id, active, reason) => {
      set((s) => {
        const parent = s.clients.find((c) => c.id === id);
        const familyOn = parent?.planId === 'family-monthly' && !parent.consentRevoked;
        return {
          clients: s.clients.map((c) => {
            if (c.id === id) return { ...c, account: active ? 'active' : 'deactivated' };
            // Teens linked to this parent: paused on deactivation; back on reactivation if the Family plan is still active.
            if (c.parentId === id && c.teenStatus !== 'invite_sent' && c.teenStatus !== 'turned_off') return { ...c, teenStatus: !active ? 'paused' : familyOn ? 'joined' : c.teenStatus };
            return c;
          }),
        };
      });
      log(`${active ? 'Reactivated' : 'Deactivated'} client ${nameOf(get(), id)}${reason ? `. Reason: ${reason}` : ''}`);
    },
    reviewEscalation: (id, reviewed, notes) => {
      const by = get().email;
      set((s) => ({
        escalations: s.escalations.map((e) =>
          e.id === id
            ? { ...e, status: reviewed ? 'reviewed' : 'not_reviewed', reviewNotes: notes, reviewedBy: reviewed ? by : undefined, reviewedAt: reviewed ? stamp() : undefined }
            : e,
        ),
      }));
      log(reviewed ? `Marked escalation ${id} as reviewed` : `Marked escalation ${id} as not yet reviewed`);
    },
    setSupportResolved: (id, resolved) => {
      const by = get().email;
      set((s) => ({
        supportRequests: s.supportRequests.map((r) =>
          r.id === id ? { ...r, resolved, resolvedBy: resolved ? by : undefined, resolvedAt: resolved ? stamp() : undefined } : r,
        ),
      }));
      log(`${resolved ? 'Resolved' : 'Reopened'} support request ${id}`);
    },
    changeClientEmail: (clientId, email) => {
      const by = get().email;
      set((s) => ({
        clients: s.clients.map((c) => (c.id === clientId ? { ...c, email } : c)),
        supportRequests: s.supportRequests.map((r) =>
          r.clientId === clientId && r.type === 'email_change' && !r.resolved ? { ...r, resolved: true, resolvedBy: by, resolvedAt: stamp() } : r,
        ),
      }));
      log(`Changed the email address for client ${nameOf(get(), clientId)}`);
    },
    saveSupportNote: (id, notes) => {
      set((s) => ({ supportRequests: s.supportRequests.map((r) => (r.id === id ? { ...r, notes } : r)) }));
      log(`Added a note to support request ${id}`);
    },
    acceptTransfer: (requestId, dependentId) => {
      set((s) => ({
        deletionRequests: s.deletionRequests.map((r) => {
          if (r.id !== requestId) return r;
          const decisions = r.decisions.map((d) =>
            d.dependentId === dependentId && d.action === 'transfer' ? { ...d, transfer: 'accepted' as const } : d,
          );
          const waiting = decisions.some((d) => d.action === 'transfer' && d.transfer !== 'accepted');
          return { ...r, decisions, status: r.status === 'waiting_transfer' && !waiting ? 'pending_review' : r.status };
        }),
      }));
      log(`Family member transfer accepted for ${dependentId}`);
    },
    setDeletionCheck: (id, key, value) =>
      set((s) => ({ deletionRequests: s.deletionRequests.map((r) => (r.id === id ? { ...r, checklist: { ...r.checklist, [key]: value } } : r)) })),
    completeDeletion: (id) => {
      const req = get().deletionRequests.find((r) => r.id === id);
      const by = get().email;
      set((s) => ({
        deletionRequests: s.deletionRequests.map((r) => (r.id === id ? { ...r, status: 'completed', completedBy: by, completedAt: stamp() } : r)),
        // Account and teen deletions remove the account; advocate-only and family member deletions keep it.
        clients: req && (req.type === 'teen' || req.option === 'everything' || req.option === 'transfer')
          ? s.clients.map((c) => (c.id === req.clientId ? { ...c, account: 'deactivated' } : c))
          : s.clients,
      }));
      log(`Deletion completed for ${nameOf(get(), req?.clientId ?? '')}`);
    },
    setLegalHold: (id, on, note) => {
      set((s) => ({
        deletionRequests: s.deletionRequests.map((r) =>
          r.id === id ? { ...r, status: on ? 'legal_hold' : 'in_progress', notes: note ? [r.notes, note].filter(Boolean).join('\n') : r.notes } : r,
        ),
      }));
      log(on ? `Placed deletion request ${id} on legal hold` : `Lifted the legal hold on deletion request ${id}`);
    },
    createDeletion: (teenId, received, note) => {
      const id = uid('dr');
      const by = get().email;
      set((s) => ({
        deletionRequests: [
          { id, clientId: teenId, type: 'teen', source: 'email', received, status: 'pending_review', decisions: [], checklist: { identity: true, legalHold: false }, notes: note, createdBy: by },
          ...s.deletionRequests,
        ],
      }));
      log(`Created a teen deletion request for ${nameOf(get(), teenId)} (by email)`);
      return id;
    },
    saveDeletionNote: (id, notes) => {
      set((s) => ({ deletionRequests: s.deletionRequests.map((r) => (r.id === id ? { ...r, notes } : r)) }));
      log(`Added a note to deletion request ${id}`);
    },
    inviteAdmin: (firstName, lastName, email) => {
      const admin: AdminUser = { id: uid('a'), firstName, lastName, email, role: 'admin', account: 'active', invite: 'pending', invitedAt: stamp(), addedBy: get().email };
      set((s) => ({ admins: [admin, ...s.admins] }));
      log(`Invited ${email} as admin`);
      // Simulated: the invitee sets up their account a little later, unless the email link is opened first.
      clearInviteTimer(admin.id);
      inviteTimers.set(admin.id, setTimeout(() => get().completeAdminSetup(admin.id), 20_000));
    },
    completeAdminSetup: (id) => {
      clearInviteTimer(id);
      const admin = get().admins.find((a) => a.id === id);
      if (!admin || admin.invite !== 'pending') return;
      set((s) => ({ admins: s.admins.map((a) => (a.id === id ? { ...a, invite: 'accepted', lastActive: stamp() } : a)) }));
      log(`${admin.email} set up their admin account`);
      useAdminNotifications.getState().post({ category: 'admins', kind: 'admin_setup', title: `${admin.firstName} ${admin.lastName} set up their account`, body: 'A new admin has set up their account.', audience: 'super', severity: 'normal', target: { kind: 'admin', id } });
    },
    resendInvite: (id) => {
      set((s) => ({ admins: s.admins.map((a) => (a.id === id ? { ...a, invite: 'pending', invitedAt: stamp() } : a)) }));
      log(`Resent invite to ${get().admins.find((a) => a.id === id)?.email}`);
    },
    cancelInvite: (id) => {
      const email = get().admins.find((a) => a.id === id)?.email;
      set((s) => ({ admins: s.admins.filter((a) => a.id !== id) }));
      log(`Cancelled the invite for ${email}`);
    },
    editAdmin: (id, firstName, lastName) => {
      set((s) => ({ admins: s.admins.map((a) => (a.id === id ? { ...a, firstName, lastName } : a)) }));
      log(`Edited admin ${firstName} ${lastName}`);
    },
    setAdminAccount: (id, active, reason) => {
      set((s) => ({ admins: s.admins.map((a) => (a.id === id ? { ...a, account: active ? 'active' : 'deactivated' } : a)) }));
      log(`${active ? 'Reactivated' : 'Deactivated'} admin ${get().admins.find((a) => a.id === id)?.email}${reason ? `. Reason: ${reason}` : ''}`);
    },
    savePlan: (plan) => {
      const before = get().plans.find((p) => p.id === plan.id);
      // Price history: a new entry whenever the price (or the trial length) changes.
      const label = plan.kind === 'trial' ? `${plan.trialDays ?? 0} days` : `$${plan.monthly.toFixed(2)}`;
      const priceChanged = !before || before.monthly !== plan.monthly || before.trialDays !== plan.trialDays;
      const next = priceChanged ? { ...plan, priceHistory: [...plan.priceHistory, { price: label, at: stamp(), by: get().email }] } : plan;
      set((s) => ({ plans: before ? s.plans.map((p) => (p.id === plan.id ? next : p)) : [...s.plans, next] }));
      log(`${before ? 'Updated' : 'Created'} plan ${plan.name}${priceChanged && before ? `: price ${label}` : ''}`);
    },
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
  };
});
