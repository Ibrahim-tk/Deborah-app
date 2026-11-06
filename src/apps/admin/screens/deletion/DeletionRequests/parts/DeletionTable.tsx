/** Data deletion requests (story 5.2): client, profile, type and request date; oldest first. Deadline and status live in the drawer. */
import type { ReactNode } from 'react';
import { businessDaysLeft, formatDate, useAdminStore, type DeletionRequest } from '@shared/admin';
import { DataTable, StatusText, type Column, type StatusTone } from '@admin/ui';
import { DELETION_TYPE } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';

import styles from './tables.module.css';

export function DeadlineText({ request }: { request: DeletionRequest }) {
  if (request.status === 'completed') return <StatusText tone="success">Completed</StatusText>;
  if (request.status === 'legal_hold') return <StatusText tone="neutral">On legal hold</StatusText>;
  const left = businessDaysLeft(request.received);
  if (left < 0) return <StatusText tone="danger">{`Overdue by ${-left} business days`}</StatusText>;
  return <StatusText tone={left <= 2 ? 'warning' : 'info'}>{`${left} business days left`}</StatusText>;
}

/** Type pills: account red (the whole account goes), family member yellow, teen blue. */
const TYPE_TONE: Record<DeletionRequest['type'], StatusTone> = { account: 'danger', family_member: 'warning', teen: 'info' };

/** The table only; DeletionRequests.tsx filters and sorts the rows. */
export function DeletionTable({ rows, empty, footer }: { rows: DeletionRequest[]; empty: ReactNode; footer: string }) {
  const clients = useAdminStore((s) => s.clients);
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const clientOf = (id: string) => clients.find((c) => c.id === id);
  const profileOf = (r: DeletionRequest) => {
    const c = clientOf(r.clientId);
    if (r.type === 'family_member') return c?.dependents.find((d) => d.id === r.aboutProfile)?.name ?? 'Family member';
    return r.type === 'teen' ? 'Teen' : 'Self';
  };

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
    { key: 'profile', muted: true, header: 'Profile', render: profileOf },
    { key: 'type', header: 'Type', render: (r) => <StatusText tone={TYPE_TONE[r.type]}>{DELETION_TYPE[r.type]}</StatusText> },
    { key: 'received', muted: true, header: 'Requested on', render: (r) => formatDate(r.received) },
  ];

  return (
    <DataTable
        footer={footer}
      pager="outside"
      label="Data deletion requests"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      onRowClick={(r) => openDrawer({ kind: 'deletion', id: r.id })}
      empty={empty}
    />
  );
}
