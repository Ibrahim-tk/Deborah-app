/**
 * @screen  A-3.1 · Clients
 * @flow    A3 Client management (story 3.1)
 * @states  default · filtered by plan / status · latest / oldest / custom sign-up range · no results
 * @spec    docs/admin/stories.md#31---view-client-listings--details
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { CLIENT_STATUS_LABEL, clientStatus, formatDate, planLabel, useAdminStore, type Client, type ClientStatus } from '@shared/admin';
import { DataTable, Select, StatusText, type Column, type StatusTone } from '@admin/ui';
import { AdminPage, DEFAULT_SORT, FilterBar, SortRange, applySort, matches, rangePhrase, showing, type SortValue } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import styles from './Clients.module.css';

const all = (label: string) => ({ value: 'all', label });

/** Status pills: the label always shows, the tint only supports it. */
const STATUS_TONE: Record<ClientStatus, StatusTone> = {
  active: 'success',
  trial: 'info',
  payment_issue: 'warning',
  deletion_requested: 'danger',
  consent_revoked: 'warning',
  cancelled: 'neutral',
  deactivated: 'neutral',
};

export default function Clients() {
  const clients = useAdminStore((s) => s.clients);
  const plans = useAdminStore((s) => s.plans);
  const openClient = useAdminNav((s) => s.openClient);
  const [query, setQuery] = useState('');
  const deletions = useAdminStore((s) => s.deletionRequests);
  const [plan, setPlan] = useState('all');
  const [status, setStatus] = useState<'all' | ClientStatus>('all');

  const planName = (id: string) => planLabel(plans.find((p) => p.id === id));
  const [sort, setSort] = useState<SortValue>(DEFAULT_SORT);
  const rows = applySort(
    clients.filter((c) => matches(query, c.name, c.email) && (plan === 'all' || c.planId === plan) && (status === 'all' || clientStatus(c, deletions) === status)),
    sort,
    (c) => c.joined,
  );

  // The screen's only live count: it always describes exactly what the table shows.
  const summary = showing(rows.length, ['client', 'clients'], [
    plan !== 'all' && `on ${plans.find((p) => p.id === plan)?.name ?? ''}`,
    status !== 'all' && `with ${CLIENT_STATUS_LABEL[status]}`,
    rangePhrase(sort, 'who signed up'),
    query.trim() && `matching \u201c${query.trim()}\u201d`,
  ]);

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Client',
      grow: true,
      primary: true,
      render: (c) => (
        <span className={styles.who}>
          <span className={styles.name}>{c.name}</span>
          <span className={styles.email} title={c.email}>{c.email}</span>
        </span>
      ),
    },
    { key: 'plan', header: 'Plan', render: (c) => (c.accountType === 'teen' ? 'Parent\u2019s Family plan' : planName(c.planId)) },
    { key: 'status', header: 'Status', render: (c) => { const st = clientStatus(c, deletions); return <StatusText tone={STATUS_TONE[st]}>{CLIENT_STATUS_LABEL[st]}</StatusText>; } },
    { key: 'family', muted: true, header: 'Family', align: 'end', render: (c) => (c.accountType === 'adult' ? c.dependents.length || '—' : '—') },
    { key: 'joined', muted: true, header: 'Signed up', render: (c) => formatDate(c.joined) },
    { key: 'active', muted: true, header: 'Last active', render: (c) => formatDate(c.lastActive) },
  ];

  return (
    <AdminPage
      title="Clients"
      subtitle={`${clients.length} clients in total`}
      toolbar={
        <FilterBar query={query} onQuery={setQuery} placeholder="Search by first name or email">
          <Select label="Plan" hideLabel value={plan} onChange={setPlan} options={[all('All plans'), ...plans.map((p) => ({ value: p.id, label: p.name }))]} />
          <Select<'all' | ClientStatus>
            label="Status"
            hideLabel
            value={status}
            onChange={setStatus}
            options={[all('All statuses') as { value: 'all'; label: string }, ...(Object.keys(CLIENT_STATUS_LABEL) as ClientStatus[]).map((k) => ({ value: k, label: CLIENT_STATUS_LABEL[k] }))]}
          />
          <SortRange value={sort} onChange={setSort} rangeLabel="Signed up between" />
        </FilterBar>
      }
    >
      <DataTable
        label="Clients"
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        footer={summary}
        pager="outside"
        onRowClick={(c) => openClient(c.id)}
        empty="No clients match your search."
      />
    </AdminPage>
  );
}
