/**
 * @screen  A-3.1 · Clients
 * @flow    A3 Client management (story 3.1)
 * @states  default · filtered by type / plan / status / state · no results
 * @spec    docs/admin/stories.md#31---view-client-listings--details
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { CLIENT_STATUS_LABEL, clientStatus, formatDate, planLabel, teensOf, useAdminStore, type Client, type ClientStatus } from '@shared/admin';
import { DataTable, Select, type Column } from '@admin/ui';
import { AdminPage, FilterBar, matches } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import styles from './Clients.module.css';

type TypeFilter = 'all' | Client['accountType'];
const all = (label: string) => ({ value: 'all', label });

type Order = 'latest' | 'oldest';
const ORDERS: Record<Order, (a: Client, b: Client) => number> = {
  latest: (a, b) => b.joined.localeCompare(a.joined),
  oldest: (a, b) => a.joined.localeCompare(b.joined),
};

export default function Clients() {
  const clients = useAdminStore((s) => s.clients);
  const plans = useAdminStore((s) => s.plans);
  const openClient = useAdminNav((s) => s.openClient);
  const [query, setQuery] = useState('');
  const deletions = useAdminStore((s) => s.deletionRequests);
  const [type, setType] = useState<TypeFilter>('all');
  const [plan, setPlan] = useState('all');
  const [status, setStatus] = useState<'all' | ClientStatus>('all');
  const [state, setState] = useState('all');
  const states = [...new Set(clients.map((c) => c.state))].sort();

  const planName = (id: string) => planLabel(plans.find((p) => p.id === id));
  const [order, setOrder] = useState<Order>('latest');
  const rows = clients
    .filter(
      (c) =>
        matches(query, c.name, c.email) &&
        (type === 'all' || c.accountType === type) &&
        (plan === 'all' || c.planId === plan) &&
        (status === 'all' || clientStatus(c, deletions) === status) &&
        (state === 'all' || c.state === state),
    )
    .sort(ORDERS[order]);

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
    { key: 'state', muted: true, header: 'State', render: (c) => c.state },
    { key: 'type', muted: true, header: 'Type', render: (c) => (c.accountType === 'teen' ? 'Teen' : 'Adult') },
    { key: 'plan', header: 'Plan', render: (c) => (c.accountType === 'teen' ? 'Parent\u2019s Family plan' : planName(c.planId)) },
    { key: 'status', header: 'Status', render: (c) => CLIENT_STATUS_LABEL[clientStatus(c, deletions)] },
    { key: 'family', muted: true, header: 'Family', align: 'end', render: (c) => (c.accountType === 'adult' ? c.dependents.length + teensOf(c.id, clients).length || '—' : '—') },
    { key: 'joined', muted: true, header: 'Signed up', render: (c) => formatDate(c.joined) },
    { key: 'active', muted: true, header: 'Last active', render: (c) => formatDate(c.lastActive) },
  ];

  return (
    <AdminPage
      title="Clients"
      subtitle={`${clients.length} accounts`}
      toolbar={
        <FilterBar query={query} onQuery={setQuery} placeholder="Search by first name or email">
          <Select<TypeFilter> label="Account type" hideLabel value={type} onChange={setType} options={[all('All types') as { value: TypeFilter; label: string }, { value: 'adult', label: 'Adult' }, { value: 'teen', label: 'Teen' }]} />
          <Select label="Plan" hideLabel value={plan} onChange={setPlan} options={[all('All plans'), ...plans.map((p) => ({ value: p.id, label: p.name }))]} />
          <Select<'all' | ClientStatus>
            label="Status"
            hideLabel
            value={status}
            onChange={setStatus}
            options={[all('All statuses') as { value: 'all'; label: string }, ...(Object.keys(CLIENT_STATUS_LABEL) as ClientStatus[]).map((k) => ({ value: k, label: CLIENT_STATUS_LABEL[k] }))]}
          />
          <Select label="State" hideLabel value={state} onChange={setState} options={[all('All states'), ...states.map((x) => ({ value: x, label: x }))]} />
          <Select<Order>
            label="Sort"
            hideLabel
            value={order}
            onChange={setOrder}
            options={[{ value: 'latest', label: 'Latest' }, { value: 'oldest', label: 'Oldest' }]}
          />
        </FilterBar>
      }
    >
      <DataTable
        label="Clients"
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        footer={`Showing ${rows.length} of ${clients.length} clients`}
        onRowClick={(c) => openClient(c.id)}
        empty="No clients match your search."
      />
    </AdminPage>
  );
}
