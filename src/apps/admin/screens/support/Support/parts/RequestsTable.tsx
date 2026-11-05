/** Support requests (story 5.1): replies go out by email outside the app. Open first, then by date. */
import { formatDate, useAdminStore, type SupportRequest, type SupportType } from '@shared/admin';
import { Button, DataTable, StatusText, type Column } from '@admin/ui';
import { applySort, matches, rangePhrase, showing, SUPPORT_TYPE, type SortValue } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useAdminToast } from '@admin/hooks/toast.store';
import styles from './tables.module.css';

export type Show = 'open' | 'resolved' | 'all';
export type TypeFilter = 'all' | SupportType;

export type AccountFilter = 'all' | 'adult' | 'teen';

export function RequestsTable({ query, show, type, account, sort }: { query: string; show: Show; type: TypeFilter; account: AccountFilter; sort: SortValue }) {
  const requests = useAdminStore((s) => s.supportRequests);
  const clients = useAdminStore((s) => s.clients);
  const toast = useAdminToast();
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const clientOf = (id: string) => clients.find((c) => c.id === id);
  const nameOf = (id: string) => clientOf(id)?.name ?? 'Unknown client';

  // Open requests always come first; the sort orders by date received within each group.
  const rows = applySort(
    requests.filter(
      (r) =>
        matches(query, nameOf(r.clientId), clientOf(r.clientId)?.email ?? '') &&
        (show === 'all' || r.resolved === (show === 'resolved')) &&
        (type === 'all' || r.type === type) &&
        (account === 'all' || clientOf(r.clientId)?.accountType === account),
    ),
    sort,
    (r) => r.received,
  ).sort((a, b) => (a.resolved === b.resolved ? 0 : a.resolved ? 1 : -1));
  const summary = showing(rows.length, ['request', 'requests'], [
    show !== 'all' && (show === 'open' ? 'open' : 'resolved'),
    type !== 'all' && `of type ${SUPPORT_TYPE[type]}`,
    rangePhrase(sort, 'received'),
    query.trim() && `matching \u201c${query.trim()}\u201d`,
  ]);
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
        footer={summary}
        pager="outside"
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
