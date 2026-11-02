/**
 * @screen  A-4.1 · Escalations
 * @flow    A4 Escalation & support management
 * @states  default · filtered by type / status · no results
 * @spec    docs/admin/README.md#a-41-escalations
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { formatDate, useAdminStore, type Escalation, type EscalationStatus, type EscalationType } from '@shared/admin';
import { DataTable, Segmented, Select, type Column } from '@admin/ui';
import { AdminPage, EscalationStatusText, EscalationTypeText, FilterBar, matches } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import styles from './Escalations.module.css';

type TypeFilter = 'all' | EscalationType;
type StatusFilter = 'active' | EscalationStatus | 'all';

export default function Escalations() {
  const escalations = useAdminStore((s) => s.escalations);
  const clients = useAdminStore((s) => s.clients);
  const push = useAdminNav((s) => s.push);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('active');

  const nameOf = (id: string) => clients.find((c) => c.id === id)?.name ?? 'Unknown client';
  const rows = escalations.filter(
    (e) =>
      matches(query, e.reason, nameOf(e.clientId), e.id) &&
      (type === 'all' || e.type === type) &&
      (status === 'all' || (status === 'active' ? e.status !== 'resolved' : e.status === status)),
  );

  const columns: Column<Escalation>[] = [
    { key: 'type', header: 'Type', sort: (e) => (e.type === 'emergency' ? 0 : 1), render: (e) => <EscalationTypeText type={e.type} /> },
    {
      key: 'reason',
      header: 'Reason',
      grow: true,
      primary: true,
      render: (e) => (
        <span className={styles.reason}>
          <span>{e.reason}</span>
          <span className={styles.client}>{nameOf(e.clientId)}</span>
        </span>
      ),
    },
    { key: 'status', header: 'Status', sort: (e) => e.status, render: (e) => <EscalationStatusText status={e.status} /> },
    { key: 'opened', header: 'Opened', sort: (e) => e.opened, render: (e) => formatDate(e.opened) },
  ];

  return (
    <AdminPage
      title="Escalations"
      subtitle="Conversations the Oracle flagged for the team."
      toolbar={
        <FilterBar query={query} onQuery={setQuery} placeholder="Search by reason or client">
          <Segmented<TypeFilter>
            label="Type"
            value={type}
            onChange={setType}
            options={[{ value: 'all', label: 'All' }, { value: 'emergency', label: 'Emergency' }, { value: 'critical', label: 'Critical' }]}
          />
          <Select<StatusFilter>
            label="Status"
            hideLabel
            value={status}
            onChange={setStatus}
            options={[
              { value: 'active', label: 'Open and in review' },
              { value: 'open', label: 'Open' },
              { value: 'in_review', label: 'In review' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'all', label: 'All cases' },
            ]}
          />
        </FilterBar>
      }
    >
      <DataTable
        label="Escalation queue"
        columns={columns}
        rows={rows}
        rowKey={(e) => e.id}
        initialSort={{ key: 'type', dir: 'asc' }}
        footer={`Showing ${rows.length} of ${escalations.length} cases`}
        onRowClick={(e) => push({ id: 'escalation', escalationId: e.id })}
        empty={status === 'active' ? 'No open cases. New escalations appear here as they come in.' : 'No cases match these filters.'}
      />
    </AdminPage>
  );
}
