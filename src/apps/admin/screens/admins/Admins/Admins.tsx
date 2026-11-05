/**
 * @screen  A-6.1 · Admin users
 * @flow    A6 Admin management (super admin only)
 * @states  default · filtered · inviting · invite pending / expired (24 h) · deactivated
 * @spec    docs/admin/README.md#a-61-admin-users
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { adminName, formatDate, inviteHoursLeft, useAdminStore, type AdminUser, type InviteStatus } from '@shared/admin';
import { Button, DataTable, IconButton, Menu, Select, StatusText, type Column } from '@admin/ui';
import { AdminPage, FilterBar, matches } from '@admin/patterns';
import { useAdminToast } from '@admin/hooks/toast.store';
import { useAdminNav } from '@admin/navigation';
import { InviteDialog } from './parts/InviteDialog';
import styles from './Admins.module.css';

/** A pending invite older than 24 hours reads as expired. */
type AdminStatus = 'pending' | 'expired' | 'active' | 'deactivated';
const STATUS_LABEL: Record<AdminStatus, string> = { pending: 'Invite pending', expired: 'Invite expired', active: 'Active', deactivated: 'Deactivated' };
const STATUS_TONE: Record<AdminStatus, 'accent' | 'warning' | 'success' | 'neutral'> = { pending: 'accent', expired: 'warning', active: 'success', deactivated: 'neutral' };
const statusOf = (a: AdminUser): AdminStatus => (a.account === 'deactivated' ? 'deactivated' : inviteOf(a) === 'accepted' ? 'active' : (inviteOf(a) as 'pending' | 'expired'));

const inviteOf = (a: AdminUser): InviteStatus => (a.invite === 'pending' && inviteHoursLeft(a.invitedAt) <= 0 ? 'expired' : a.invite);

type Order = 'latest' | 'oldest';
const ORDER_OPTIONS: { value: Order; label: string }[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
];
const ORDERS: Record<Order, (a: AdminUser, b: AdminUser) => number> = {
  latest: (a, b) => b.invitedAt.localeCompare(a.invitedAt),
  oldest: (a, b) => a.invitedAt.localeCompare(b.invitedAt),
};

export default function Admins() {
  const admins = useAdminStore((s) => s.admins);
  const me = useAdminStore((s) => s.email);
  const toast = useAdminToast();
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const [query, setQuery] = useState('');
  const [inviting, setInviting] = useState(false);
  const [order, setOrder] = useState<Order>('latest');
  const [status, setStatus] = useState<'all' | AdminStatus>('all');
  const rows = admins.filter((a) => matches(query, adminName(a), a.email) && (status === 'all' || statusOf(a) === status)).sort(ORDERS[order]);

  const onAction = (a: AdminUser, id: string) => {
    const s = useAdminStore.getState();
    if (id === 'resend') { s.resendInvite(a.id); toast(`We\u2019ve sent ${a.firstName} a new invite.`); }
    if (id === 'cancel') { s.cancelInvite(a.id); toast(`The invite for ${a.firstName} has been cancelled.`); }
    // Deactivating needs a reason, so it happens in the drawer.
    if (id === 'deactivate') openDrawer({ kind: 'admin', id: a.id });
    if (id === 'reactivate') { s.setAdminAccount(a.id, true); toast(`${a.firstName} has been reactivated.`); }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'Name',
      grow: true,
      primary: true,
      render: (a) => (
        <span className={styles.who}>
          <span>{adminName(a)}</span>
          <span className={styles.email} title={a.email}>{a.email}</span>
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (a) => <StatusText tone={STATUS_TONE[statusOf(a)]}>{STATUS_LABEL[statusOf(a)]}</StatusText> },
    { key: 'added', muted: true, header: 'Date added', render: (a) => formatDate(a.invitedAt.slice(0, 10)) },
    { key: 'active', muted: true, header: 'Last active', render: (a) => (a.lastActive ? formatDate(a.lastActive.slice(0, 10)) : '—') },
    {
      key: 'more',
      header: '',
      align: 'end',
      render: (a) =>
        a.email === me ? null : (
          // Keep menu clicks from also opening the row's drawer.
          <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <Menu
            side="bottom"
            align="end"
            onSelect={(id) => onAction(a, id)}
            items={[
              ...(inviteOf(a) !== 'accepted' ? [{ id: 'resend', label: 'Resend invite', icon: 'mail' as const }, { id: 'cancel', label: 'Cancel invite' }] : []),
              a.account === 'active'
                ? { id: 'deactivate', label: 'Deactivate', destructive: true }
                : { id: 'reactivate', label: 'Reactivate' },
            ]}
            trigger={<IconButton icon="more" label={`Actions for ${adminName(a)}`} />}
          />
          </span>
        ),
    },
  ];

  return (
    <AdminPage
      title="Admin users"
      subtitle="People who can sign in to this console. Invites expire after 24 hours."
      action={<Button leadingIcon="plus" onClick={() => setInviting(true)}>Add admin</Button>}
      toolbar={
        <FilterBar query={query} onQuery={setQuery} placeholder="Search by name or email">
          <Select<'all' | AdminStatus>
            label="Status"
            hideLabel
            value={status}
            onChange={setStatus}
            options={[{ value: 'all', label: 'All statuses' }, ...(Object.keys(STATUS_LABEL) as AdminStatus[]).map((k) => ({ value: k, label: STATUS_LABEL[k] }))]}
          />
          <Select<Order> label="Sort" hideLabel value={order} onChange={setOrder} options={ORDER_OPTIONS} />
        </FilterBar>
      }
    >
      <DataTable label="Admin users" columns={columns} rows={rows} rowKey={(a) => a.id} onRowClick={(a) => openDrawer({ kind: 'admin', id: a.id })} empty="No admins match your search." footer={`Showing ${rows.length} of ${admins.length} admins`} />
      {inviting && <InviteDialog onClose={() => setInviting(false)} />}
    </AdminPage>
  );
}
