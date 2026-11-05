/** Internal inbox route: the teen invitation, plus a standing admin invite from the Super Admin. */
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminName, inviteHoursLeft, useAdminStore, useInviteLink } from '@shared/admin';
import { INTERNAL_ADMIN } from '@shared/utils/internalPaths';
import { EmailInbox, type EmailInboxProps, type WorkLetter } from './EmailInbox';

/** Standing demo invitee (Jo). Prefer a pending invite, then the URL, then Jo. */
const DEMO_INVITE = 'a003';

function inviteTarget(inviteId: string | null) {
  const admins = useAdminStore.getState().admins;
  if (inviteId) return admins.find((a) => a.id === inviteId) ?? null;
  return admins.find((a) => a.invite === 'pending') ?? admins.find((a) => a.id === DEMO_INVITE) ?? null;
}

function workLetter(id: string, onOpen: () => void): WorkLetter | null {
  const admins = useAdminStore.getState().admins;
  const admin = admins.find((a) => a.id === id);
  if (!admin) return null;
  const inviter = admins.find((a) => a.email === admin.addedBy) ?? admins.find((a) => a.role === 'super');
  const who = inviter ? adminName(inviter) : 'A super admin';
  const hours = inviteHoursLeft(admin.invitedAt);
  const expired = admin.invite === 'expired' || (admin.invite === 'pending' && hours <= 0);
  return {
    id: admin.id,
    from: who,
    address: inviter?.email ?? 'invites@oracleclinician.example',
    to: admin.email,
    subject: 'You’re invited to Oracle Admin',
    preview: expired ? 'This invite has expired.' : 'Set up your account to open your dashboard.',
    time: 'Just now',
    body: expired
      ? ['This invite has expired. Ask a super admin to send a new one.']
      : [`${who} invited you to the Oracle Admin panel as an admin.`],
    cta: 'Set up your account',
    note: 'This link is unique to you and can only be used once. If you weren’t expecting it, you can ignore this email.',
    foot: ['Oracle Admin · Your Oracle Clinician'],
    initial: admin.firstName.slice(0, 1).toUpperCase(),
    onOpen,
  };
}

export function EmailRoute({ mobilePath, webPath }: EmailInboxProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inviteId = params.get('invite');
  // Re-render when invites change so the standing letter stays in sync.
  useAdminStore((s) => s.admins);
  const target = inviteTarget(inviteId);
  const pending = target?.invite === 'pending';

  useEffect(() => {
    if (target && pending) useAdminStore.getState().holdInvite(target.id);
  }, [target?.id, pending]);

  const letter = target
    ? workLetter(target.id, () => {
        useInviteLink.getState().open(target.id);
        navigate(INTERNAL_ADMIN);
      })
    : null;

  // Only auto-open when the drawer link landed here with ?invite=.
  return <EmailInbox mobilePath={mobilePath} webPath={webPath} letter={letter} openLetter={Boolean(inviteId && letter)} />;
}
