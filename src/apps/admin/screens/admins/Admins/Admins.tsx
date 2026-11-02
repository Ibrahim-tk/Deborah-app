/**
 * @screen  A-6.1 · Admin users
 * @flow    A6 Admin management (super admin only)
 * @states  default · filtered · inviting · invite pending / expired (24 h) · deactivated
 * @spec    docs/admin/README.md#a-61-admin-users
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { formatDate, inviteHoursLeft, useAdminStore, type AdminUser, type InviteStatus } from '@shared/admin';
import { Button, DataTable, IconButton, Menu, type Column } from '@admin/ui';
import { AccountStatusText, AdminPage, FilterBar, InviteStatusText, matches } from '@admin/patterns';
import { useAdminToast } from '@admin/hooks/toast.store';
import { InviteDialog } from './parts/InviteDialog';
import styles from './Admins.module.css';

/** A pending invite older than 24 hours reads as expired. */
const inviteOf = (a: AdminUser): InviteStatus => (a.invite === 'pending' && inviteHoursLeft(a.invitedAt) <= 0 ? 'expired' : a.invite);

export default function Admins() {
  const admins = useAdminStore((s) => s.admins);
  const me = useAdminStore((s) => s.email);
  const toast = useAdminToast();
  const [query, setQuery] = useState('');
  const [inviting, setInviting] = useState(false);
  const rows = admins.filter((a) => matches(query, a.name, a.email));

  const onAction = (a: AdminUser, id: string) => {
    const s = useAdminStore.getState();
    if (id === 'resend') { s.resendInvite(a.id); toast('Invite resent'); }
    if (id === 'deactivate') { s.setAdminAccount(a.id, false); toast('Admin deactivated'); }
    if (id === 'reactivate') { s.setAdminAccount(a.id, true); toast('Admin reactivated'); }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'Name',
      grow: true,
      primary: true,
      sort: (a) => a.name,
      render: (a) => (
        <span className={styles.who}>
          <span>{a.name}</span>
          <span className={styles.email} title={a.email}>{a.email}</span>
        </span>
      ),
    },
    { key: 'role', header: 'Role', sort: (a) => a.role, render: (a) => (a.role === 'super' ? 'Super admin' : 'Admin') },
    {
      key: 'invite',
      header: 'Invitation',
      sort: (a) => inviteOf(a),
      render: (a) => {
        const status = inviteOf(a);
        return (
          <span className={styles.who}>
            <InviteStatusText status={status} />
            {status === 'pending' && <span className={styles.email}>Expires in {inviteHoursLeft(a.invitedAt)} h</span>}
            {status === 'accepted' && <span className={styles.email}>Since {formatDate(a.invitedAt.slice(0, 10))}</span>}
          </span>
        );
      },
    },
    { key: 'account', header: 'Account', sort: (a) => a.account, render: (a) => <AccountStatusText status={a.account} /> },
    {
      key: 'more',
      header: '',
      align: 'end',
      render: (a) =>
        a.email === me ? null : (
          <Menu
            side="bottom"
            align="end"
            onSelect={(id) => onAction(a, id)}
            items={[
              ...(inviteOf(a) !== 'accepted' ? [{ id: 'resend', label: 'Resend invite', icon: 'mail' as const }] : []),
              a.account === 'active'
                ? { id: 'deactivate', label: 'Deactivate', destructive: true }
                : { id: 'reactivate', label: 'Reactivate' },
            ]}
            trigger={<IconButton icon="more" label={`Actions for ${a.name}`} />}
          />
        ),
    },
  ];

  return (
    <AdminPage
      title="Admin users"
      subtitle="People who can sign in to this console. Invites expire after 24 hours."
      action={<Button leadingIcon="plus" onClick={() => setInviting(true)}>Invite admin</Button>}
      toolbar={<FilterBar query={query} onQuery={setQuery} placeholder="Search by name or email" />}
    >
      <DataTable label="Admin users" columns={columns} rows={rows} rowKey={(a) => a.id} empty="No admins match." footer={`Showing ${rows.length} of ${admins.length} admins`} />
      {inviting && <InviteDialog onClose={() => setInviting(false)} />}
    </AdminPage>
  );
}
