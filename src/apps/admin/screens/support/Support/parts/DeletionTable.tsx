/** Data deletion requests (story 5.2): 10-business-day deadline, closest first; due within 2 business days is highlighted. */
import { businessDaysLeft, deletionDueDate, formatDate, useAdminStore, type DeletionRequest } from '@shared/admin';
import { DataTable, StatusText, type Column } from '@admin/ui';
import { DELETION_STATUS, DELETION_TYPE, applySort, matches, rangePhrase, showing, type SortValue } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import styles from './tables.module.css';

export function DeadlineText({ request }: { request: DeletionRequest }) {
  if (request.status === 'completed') return <StatusText tone="success">Completed</StatusText>;
  if (request.status === 'legal_hold') return <StatusText tone="neutral">On legal hold</StatusText>;
  const left = businessDaysLeft(request.received);
  if (left < 0) return <StatusText tone="danger">{`Overdue by ${-left} business days`}</StatusText>;
  return <StatusText tone={left <= 2 ? 'warning' : 'accent'}>{`${left} business days left`}</StatusText>;
}

export function DeletionTable({ query, sort }: { query: string; sort: SortValue }) {
  const requests = useAdminStore((s) => s.deletionRequests);
  const clients = useAdminStore((s) => s.clients);
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const clientOf = (id: string) => clients.find((c) => c.id === id);
  const nameOf = (id: string) => clientOf(id)?.name ?? 'Deleted account';
  const profileOf = (r: DeletionRequest) => {
    const c = clientOf(r.clientId);
    if (r.type === 'family_member') return c?.dependents.find((d) => d.id === r.aboutProfile)?.name ?? 'Family member';
    return r.type === 'teen' ? 'Teen (own account)' : 'Their own account';
  };
  // Completed requests go to the bottom; oldest received first means the closest deadline first.
  const rows = applySort(
    requests.filter((r) => matches(query, nameOf(r.clientId), clientOf(r.clientId)?.email ?? '')),
    sort,
    (r) => r.received,
  ).sort((a, b) => ((a.status === 'completed') === (b.status === 'completed') ? 0 : a.status === 'completed' ? 1 : -1));
  const summary = showing(rows.length, ['request', 'requests'], [rangePhrase(sort, 'received'), query.trim() && `matching \u201c${query.trim()}\u201d`]);

  const columns: Column<DeletionRequest>[] = [
    {
      key: 'client',
      header: 'Client',
      grow: true,
      primary: true,
      render: (r) => {
        const c = clientOf(r.clientId);
        return (
          <span className={styles.who}>
            <span className={styles.name}>{c?.name ?? 'Deleted account'}</span>
            {c && <span className={styles.email} title={c.email}>{c.email}</span>}
          </span>
        );
      },
    },
    { key: 'type', header: 'Type', render: (r) => DELETION_TYPE[r.type] },
    { key: 'profile', muted: true, header: 'Profile', render: profileOf },
    { key: 'source', muted: true, header: 'Source', render: (r) => (r.source === 'email' ? 'By email' : 'In app') },
    { key: 'status', header: 'Status', render: (r) => DELETION_STATUS[r.status] },
    { key: 'received', muted: true, header: 'Received', render: (r) => formatDate(r.received) },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (r) => (r.status === 'completed' ? '—' : <span className={styles.deadline}>{formatDate(deletionDueDate(r.received))} <DeadlineText request={r} /></span>),
    },
  ];

  return (
    <DataTable
      footer={summary}
      pager="outside"
      label="Data deletion requests"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      onRowClick={(r) => openDrawer({ kind: 'deletion', id: r.id })}
      empty={requests.length === 0 ? 'There are no deletion requests right now.' : 'No requests match your search.'}
    />
  );
}
