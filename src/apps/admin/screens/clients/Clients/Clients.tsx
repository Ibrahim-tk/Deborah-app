/**
 * @screen  A-3.1 · Clients
 * @flow    A3 Client management
 * @states  default · filtered · no results
 * @spec    docs/admin/README.md#a-31-clients
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { formatDate, planLabel, useAdminStore, type Client } from '@shared/admin';
import { DataTable, Select, type Column } from '@admin/ui';
import {
  AccountStatusText, AdminPage, FilterBar, SUBSCRIPTION_OPTIONS, SubscriptionStatusText, matches,
} from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import styles from './Clients.module.css';

type AccountFilter = 'all' | 'active' | 'deactivated';

export default function Clients() {
  const clients = useAdminStore((s) => s.clients);
  const plans = useAdminStore((s) => s.plans);
  const openClient = useAdminNav((s) => s.openClient);
  const [query, setQuery] = useState('');
  const [sub, setSub] = useState<string>('all');
  const [account, setAccount] = useState<AccountFilter>('all');

  const planName = (id: string) => planLabel(plans.find((p) => p.id === id));
  const rows = clients.filter(
    (c) => matches(query, c.name, c.email, c.location) && (sub === 'all' || c.subscription === sub) && (account === 'all' || c.account === account),
  );

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Client',
      grow: true,
      primary: true,
      sort: (c) => c.name,
      render: (c) => (
        <span className={styles.who}>
          <span className={styles.name}>{c.name}</span>
          <span className={styles.email} title={c.email}>{c.email}</span>
        </span>
      ),
    },
    { key: 'plan', header: 'Plan', sort: (c) => planName(c.planId), render: (c) => planName(c.planId) },
    { key: 'sub', header: 'Subscription', sort: (c) => c.subscription, render: (c) => <SubscriptionStatusText status={c.subscription} /> },
    { key: 'account', header: 'Account', sort: (c) => c.account, render: (c) => <AccountStatusText status={c.account} /> },
    { key: 'dependents', muted: true, header: 'Dependents', align: 'end', sort: (c) => c.dependents.length, render: (c) => c.dependents.length || '—' },
    { key: 'joined', muted: true, header: 'Joined', sort: (c) => c.joined, render: (c) => formatDate(c.joined) },
  ];

  return (
    <AdminPage
      title="Clients"
      subtitle={`${clients.length} accounts`}
      toolbar={
        <FilterBar query={query} onQuery={setQuery} placeholder="Search by name, email or city">
          <Select label="Subscription" hideLabel value={sub} onChange={setSub} options={[{ value: 'all', label: 'All subscriptions' }, ...SUBSCRIPTION_OPTIONS]} />
          <Select<AccountFilter>
            label="Account"
            hideLabel
            value={account}
            onChange={setAccount}
            options={[{ value: 'all', label: 'All accounts' }, { value: 'active', label: 'Active' }, { value: 'deactivated', label: 'Deactivated' }]}
          />
        </FilterBar>
      }
    >
      <DataTable
        label="Clients"
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        initialSort={{ key: 'joined', dir: 'desc' }}
        footer={`Showing ${rows.length} of ${clients.length} clients`}
        onRowClick={(c) => openClient(c.id)}
        empty="No clients match. Try a different name or clear the filters."
      />
    </AdminPage>
  );
}
