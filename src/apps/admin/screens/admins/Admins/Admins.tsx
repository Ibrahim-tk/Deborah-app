/**
 * @screen  A-6.1 · Admin users
 * @flow    A6 Admin management (super admin only)
 * @states  default · filtered · inviting · invite pending / expired (24 h) · deactivated
 * @spec    docs/admin/README.md#a-61-admin-users
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { adminName, formatDate, inviteHoursLeft, useAdminStore, type AdminUser, type InviteStatus } from '@shared/admin';
import { Button, DataTable, StatusText, type Column } from '@admin/ui';
import { AdminPage, DEFAULT_SORT, NoMatches, TableFilters, applySort, matches, rangePhrase, showing, type FilterState } from '@admin/patterns';
import { useTableFilters } from '@admin/hooks/useTableFilters';
import { useAdminToast } from '@admin/hooks/toast.store';
import { useAdminNav } from '@admin/navigation';
import { InviteDialog } from './parts/InviteDialog';
import styles from './Admins.module.css';

/** A pending invite older than 24 hours reads as expired. */
type AdminStatus = 'pending' | 'expired' | 'active' | 'deactivated';
const STATUS_LABEL: Record<AdminStatus, string> = { pending: 'Invite pending', expired: 'Invite expired', active: 'Active', deactivated: 'Deactivated' };
const STATUS_TONE: Record<AdminStatus, 'info' | 'warning' | 'success' | 'neutral'> = { pending: 'info', expired: 'warning', active: 'success', deactivated: 'neutral' };
const statusOf = (a: AdminUser): AdminStatus => (a.account === 'deactivated' ? 'deactivated' : inviteOf(a) === 'accepted' ? 'active' : (inviteOf(a) as 'pending' | 'expired'));

const inviteOf = (a: AdminUser): InviteStatus => (a.invite === 'pending' && inviteHoursLeft(a.invitedAt) <= 0 ? 'expired' : a.invite);

const INITIAL: FilterState = { query: '', values: {}, quick: null, sort: DEFAULT_SORT };

export default function Admins() {
  const admins = useAdminStore((s) => s.admins);
  const me = useAdminStore((s) => s.email);
  const toast = useAdminToast();
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const [inviting, setInviting] = useState(false);
  const f = useTableFilters('admins', INITIAL);
  const { query, values, sort } = f.state;
  const status = (values.status ?? 'all') as 'all' | AdminStatus;
  const rows = applySort(
    admins.filter(
      (a) =>
        matches(query, adminName(a), a.email) &&
        (status === 'all' || statusOf(a) === status),
    ),
    sort,
    (a) => a.invitedAt,
  );
  const summary = showing(rows.length, ['admin', 'admins'], [
    status !== 'all' && `with Status: ${STATUS_LABEL[status]}`,
    rangePhrase(sort, 'added'),
    query.trim() && `matching \u201c${query.trim()}\u201d`,
  ]);

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
        // The Super Admin tag sits beside the name-and-email block, centred on both lines.
        <span className={styles.nameRow}>
          <span className={styles.who}>
            <span>{adminName(a)}</span>
            <span className={styles.email} title={a.email}>{a.email}</span>
          </span>
          {a.role === 'super' && <StatusText tone="accent">Super Admin</StatusText>}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (a) => <StatusText tone={STATUS_TONE[statusOf(a)]}>{STATUS_LABEL[statusOf(a)]}</StatusText> },
    {
      key: 'invitedBy',
      muted: true,
      header: 'Invited by',
      // Who sent the invite (Deborah for everyone today); the Super Admin's own row has no inviter.
      render: (a) => {
        const by = admins.find((x) => x.email === a.addedBy);
        return by ? adminName(by) : a.addedBy ?? '—';
      },
    },
    { key: 'added', muted: true, header: 'Date added', render: (a) => formatDate(a.invitedAt.slice(0, 10)) },
    {
      key: 'more',
      header: '',
      align: 'end',
      render: (a) =>
        a.email === me ? null : (
          // Keep button clicks from also opening the row's drawer.
          <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          {a.account === 'active' ? (
            <Button size="sm" variant="secondary" className={styles.deactivate} onClick={() => onAction(a, 'deactivate')}>Deactivate</Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => onAction(a, 'reactivate')}>Reactivate</Button>
          )}
          </span>
        ),
    },
  ];

  return (
    <AdminPage
      title="Admin users"
      subtitle={`${admins.length} admins in total`}
      action={<Button leadingIcon="plus" onClick={() => setInviting(true)}>Add admin</Button>}
      toolbar={
        <TableFilters
          {...f}
          placeholder="Search by name or email"
          rangeLabel="Added between"
          categories={[{ key: 'status', label: 'Status', options: (Object.keys(STATUS_LABEL) as AdminStatus[]).map((k) => ({ value: k, label: STATUS_LABEL[k] })) }]}
        />
      }
    >
      <DataTable footer={summary} label="Admin users" columns={columns} rows={rows} rowKey={(a) => a.id} onRowClick={(a) => openDrawer({ kind: 'admin', id: a.id })} empty={<NoMatches text="No admins match these filters." onClear={() => f.onChange(INITIAL)} />} pager="outside" />
      {inviting && <InviteDialog onClose={() => setInviting(false)} />}
    </AdminPage>
  );
}
