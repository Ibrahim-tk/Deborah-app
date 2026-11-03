/** Data deletion requests with their compliance deadline (GDPR 30 days, CCPA 45 days). */
import { deletionDaysLeft, formatDate, useAdminStore, type DeletionRequest } from '@shared/admin';
import { DataTable, StatusText, type Column } from '@admin/ui';
import { matches } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';

export function DeadlineText({ request }: { request: DeletionRequest }) {
  if (request.status !== 'pending') {
    return <StatusText tone={request.status === 'deleted' ? 'success' : 'neutral'}>{request.status === 'deleted' ? 'Deleted' : 'Rejected'}</StatusText>;
  }
  const left = deletionDaysLeft(request.received, request.regulation);
  if (left < 0) return <StatusText tone="danger">{`Overdue by ${-left} days`}</StatusText>;
  return <StatusText tone={left <= 7 ? 'warning' : 'accent'}>{`${left} days left`}</StatusText>;
}

export function DeletionTable({ query }: { query: string }) {
  const requests = useAdminStore((s) => s.deletionRequests);
  const clients = useAdminStore((s) => s.clients);
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const nameOf = (id: string) => clients.find((c) => c.id === id)?.name ?? 'Deleted account';
  const rows = requests.filter((r) => matches(query, nameOf(r.clientId), r.regulation));

  const columns: Column<DeletionRequest>[] = [
    { key: 'client', header: 'Client', grow: true, primary: true, sort: (r) => nameOf(r.clientId), render: (r) => nameOf(r.clientId) },
    { key: 'law', muted: true, header: 'Regulation', render: (r) => r.regulation },
    { key: 'deps', muted: true, header: 'Dependents', align: 'end', render: (r) => r.decisions.length || '—' },
    { key: 'received', muted: true, header: 'Received', sort: (r) => r.received, render: (r) => formatDate(r.received) },
    { key: 'deadline', header: 'Deadline', sort: (r) => deletionDaysLeft(r.received, r.regulation), render: (r) => <DeadlineText request={r} /> },
  ];

  return (
    <DataTable
      label="Data deletion requests"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      initialSort={{ key: 'deadline', dir: 'asc' }}
      onRowClick={(r) => openDrawer({ kind: 'deletion', id: r.id })}
      empty="No deletion requests."
    />
  );
}
