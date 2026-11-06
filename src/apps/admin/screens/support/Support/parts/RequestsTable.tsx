/** Support requests (story 5.1): replies go out by email outside the app. Open first, then by date. */
import type { ReactNode } from 'react';
import { formatDate, useAdminStore, type SupportRequest } from '@shared/admin';
import { Button, DataTable, StatusText, type Column } from '@admin/ui';
import { SUPPORT_TONE, SUPPORT_TYPE } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useAdminToast } from '@admin/hooks/toast.store';
import styles from './tables.module.css';

/** The table only; Support.tsx filters and sorts the rows. */
export function RequestsTable({ rows, empty, footer }: { rows: SupportRequest[]; empty: ReactNode; footer: string }) {
  const clients = useAdminStore((s) => s.clients);
  const toast = useAdminToast();
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const clientOf = (id: string) => clients.find((c) => c.id === id);
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
      // Type pills: each request type gets its own colour from the status palette (blue, green, yellow, grey).
      render: (r) => <StatusText tone={SUPPORT_TONE[r.type]}>{SUPPORT_TYPE[r.type]}</StatusText>,
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
        footer={footer}
        pager="outside"
        label="Support requests"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        onRowClick={(r) => openDrawer({ kind: 'support', id: r.id })}
        empty={empty}
      />
    </>
  );
}
