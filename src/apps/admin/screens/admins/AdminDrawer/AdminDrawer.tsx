/**
 * @screen  A-6.2 · Admin user (side drawer)
 * @flow    A6 Admin management (super admin only)
 * @states  invite sent · invite expired · accepted · deactivated · self (read only)
 * @spec    docs/admin/README.md#a-62-admin-user
 * @xref    web: none (admin only)
 */
import { formatDate, inviteHoursLeft, useAdminStore } from '@shared/admin';
import { Button, Drawer, KeyValueList } from '@admin/ui';
import { AccountStatusText, InviteStatusText, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import { CopyEmail } from '@admin/screens/common/CopyEmail';
import s from '@admin/screens/common/drawer/drawer.module.css';

export default function AdminDrawer({ id }: { id: string | null }) {
  const admin = useAdminStore((st) => st.admins.find((a) => a.id === id));
  const me = useAdminStore((st) => st.email);
  const close = useAdminNav((st) => st.closeDrawer);
  const sim = useSim();
  if (!admin) return null;

  const hours = inviteHoursLeft(admin.invitedAt);
  const invite = admin.invite === 'pending' && hours <= 0 ? 'expired' : admin.invite;
  const self = admin.email === me;
  const active = admin.account === 'active';

  return (
    <Drawer
      title={admin.name}
      subtitle={<CopyEmail email={admin.email} />}
      onClose={close}
      meta={<AccountStatusText status={admin.account} />}
      actions={
        !self && (
          <>
            {invite !== 'accepted' && (
              <Button size="sm" leadingIcon="mail" loading={sim.busy} onClick={() => sim.run(() => useAdminStore.getState().resendInvite(admin.id), 'Invite resent')}>
                Resend invite
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className={active ? `${s.end} ${s.danger}` : s.end}
              onClick={() => sim.run(() => useAdminStore.getState().setAdminAccount(admin.id, !active), active ? 'Admin deactivated' : 'Admin reactivated')}
            >
              {active ? 'Deactivate' : 'Reactivate'}
            </Button>
          </>
        )
      }
    >
      <Section title="Access">
        <KeyValueList
          items={[
            { label: 'Role', value: admin.role === 'super' ? 'Super admin' : 'Admin' },
            { label: 'Invitation', value: <InviteStatusText status={invite} /> },
            { label: invite === 'accepted' ? 'Joined' : 'Invited', value: formatDate(admin.invitedAt) },
            ...(invite === 'pending' ? [{ label: 'Invite expires', value: `In ${hours} hours` }] : []),
          ]}
        />
        {self && <p className={s.note}>This is your account. Another super admin can change its access.</p>}
        {invite === 'expired' && <p className={s.note}>Invites last 24 hours. Resend it to give them a new link.</p>}
      </Section>
    </Drawer>
  );
}
