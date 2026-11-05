/** Support requests (story 5.1): replies go out by email outside the app. Open first, then by date. */
import { formatDate, useAdminStore, type SupportRequest, type SupportType } from '@shared/admin';
import { Button, DataTable, StatusText, type Column } from '@admin/ui';
import { matches, SUPPORT_TYPE } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useAdminToast } from '@admin/hooks/toast.store';
import type { Order } from './order';
import styles from './tables.module.css';

export type Show = 'open' | 'resolved' | 'all';
export type TypeFilter = 'all' | SupportType;

export function RequestsTable({ query, show, type, order }: { query: string; show: Show; type: TypeFilter; order: Order }) {
  const requests = useAdminStore((s) => s.supportRequests);
  const clients = useAdminStore((s) => s.clients);
  const toast = useAdminToast();
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const clientOf = (id: string) => clients.find((c) => c.id === id);
  const nameOf = (id: string) => clientOf(id)?.name ?? 'Unknown client';

  const rows = requests.filter(
    (r) =>
      matches(query, nameOf(r.clientId), clientOf(r.clientId)?.email ?? '') &&
      (show === 'all' || r.resolved === (show === 'resolved')) &&
      (type === 'all' || r.type === type),
  ).sort((a, b) => {
    if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
    return order === 'latest' ? b.received.localeCompare(a.received) : a.received.localeCompare(b.received);
  });
  const resolve = (r: SupportRequest) => {
    useAdminStore.getState().setSupportResolved(r.id, true);
    toast('This request has been marked as resolved.');
  };

  const columns: Column<SupportRequest>[] = [
    {
      key: 'client',
      header: 'Client',
      primary: true,
      render: (r) => {
        const c = clientOf(r.clientId);
        return (
          <span className={styles.who}>
            <span className={styles.name}>{c?.name ?? 'Unknown client'}</span>
            {c && <span className={styles.email} title={c.email}>{c.email}</span>}
          </span>
        );
      },
    },
    { key: 'subject', header: 'Message', grow: true, render: (r) => (r.aboutProfile ? `About ${r.aboutProfile}: ${r.message}` : r.message) },
    {
      key: 'type',
      header: 'Type',
      render: (r) => SUPPORT_TYPE[r.type],
    },
    { key: 'received', muted: true, header: 'Received', render: (r) => formatDate(r.received) },
    {
      key: 'action',
      header: 'Status',
      align: 'end',
      render: (r) =>
        r.resolved ? <StatusText tone="success">Resolved</StatusText> : <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); resolve(r); }}>Mark resolved</Button>,
    },
  ];

  return (
    <>
      <DataTable
        label="Support requests"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        onRowClick={(r) => openDrawer({ kind: 'support', id: r.id })}
        empty={requests.length === 0 ? 'There are no support requests right now.' : 'No requests match these filters.'}
      />
    </>
  );
}
