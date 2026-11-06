/**
 * @screen  A-3.1 · Clients
 * @flow    A3 Client management (story 3.1)
 * @states  default · filtered by plan / status · sort / custom range · no matches
 * @spec    docs/admin/stories.md#31---view-client-listings--details
 * @xref    web: none (admin only)
 */
import { SIMPLE_CLIENT_STATUS_LABEL, clientStatus, simpleClientStatus, type SimpleClientStatus, formatDate, planLabel, useAdminStore, type Client } from '@shared/admin';
import { DataTable, StatusText, type Column, type StatusTone } from '@admin/ui';
import { AdminPage, CLIENT_SIMPLE_TONE, DEFAULT_SORT, NoMatches, TableFilters, applySort, matches, rangePhrase, showing, type FilterState } from '@admin/patterns';
import { useTableFilters } from '@admin/hooks/useTableFilters';
import { useAdminNav } from '@admin/navigation';
import { ClientActions } from '../ClientActions';
import styles from './Clients.module.css';

const INITIAL: FilterState = { query: '', values: {}, quick: null, sort: DEFAULT_SORT };

/** Plan pills: Individual purple, Family blue, Free grey. */
const PLAN_TONE: Record<string, StatusTone> = { individual: 'accent', family: 'info', trial: 'neutral' };

export default function Clients() {
  const clients = useAdminStore((s) => s.clients);
  const plans = useAdminStore((s) => s.plans);
  const openClient = useAdminNav((s) => s.openClient);
  const deletions = useAdminStore((s) => s.deletionRequests);
  const f = useTableFilters('clients', INITIAL);
  const { query, values, sort } = f.state;
  const v = (k: string) => values[k] ?? 'all';

  const planName = (id: string) => planLabel(plans.find((p) => p.id === id));
  const passes = (c: Client) => {
    const st = simpleClientStatus(clientStatus(c, deletions));
    return (
      matches(query, c.name, c.email) &&
      (v('status') === 'all' || st === v('status')) &&
      (v('plan') === 'all' || c.planId === v('plan'))
    );
  };
  const rows = applySort(clients.filter(passes), sort, (c) => c.joined);
  const filtered = rows.length !== clients.length;
  // The screen's only live count: it always describes exactly what the table shows.
  const summary = showing(rows.length, ['client', 'clients'], [
    v('status') !== 'all' && `with Status: ${SIMPLE_CLIENT_STATUS_LABEL[v('status') as SimpleClientStatus]}`,
    v('plan') !== 'all' && `on ${plans.find((p) => p.id === v('plan'))?.name ?? ''}`,
    rangePhrase(sort, 'who joined'),
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
    {
      key: 'plan',
      header: 'Plan',
      // Plan as a pill: one person for Individual, a group for Family (and teens on a parent's Family plan), no icon for the free trial.
      render: (c) => {
        const kind = c.accountType === 'teen' ? 'family' : plans.find((p) => p.id === c.planId)?.kind;
        const label = c.accountType === 'teen' ? 'Parent\u2019s Family plan' : planName(c.planId);
        return <StatusText tone={PLAN_TONE[kind ?? 'trial']} icon={kind === 'family' ? 'group' : kind === 'individual' ? 'person' : undefined}>{label}</StatusText>;
      },
    },
    { key: 'account', muted: true, header: 'Account type', render: (c) => (c.accountType === 'teen' ? 'Teen' : 'Adult') },
    { key: 'status', header: 'Status', render: (c) => { const st = simpleClientStatus(clientStatus(c, deletions)); return <StatusText tone={CLIENT_SIMPLE_TONE[st]}>{SIMPLE_CLIENT_STATUS_LABEL[st]}</StatusText>; } },
    { key: 'joined', muted: true, header: 'Joined', render: (c) => formatDate(c.joined) },
    {
      key: 'actions',
      header: '',
      align: 'end',
      // Keep menu and dialog clicks from also opening the row's drawer (portalled dialogs still bubble here in React).
      render: (c) => (
        <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <ClientActions client={c} />
        </span>
      ),
    },
  ];

  return (
    <AdminPage
      title="Clients"
      toolbar={
        <TableFilters
          {...f}
          placeholder="Search by name or email"
          rangeLabel="Joined between"
          categories={[
            { key: 'plan', label: 'Plan', options: plans.map((p) => ({ value: p.id, label: p.name })) },
            { key: 'status', label: 'Status', options: (Object.keys(SIMPLE_CLIENT_STATUS_LABEL) as SimpleClientStatus[]).map((k) => ({ value: k, label: SIMPLE_CLIENT_STATUS_LABEL[k] })) },
          ]}
        />
      }
    >
      <DataTable footer={summary}
        label="Clients"
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        pager="outside"
        onRowClick={(c) => openClient(c.id)}
        empty={<NoMatches text="No clients match these filters." onClear={filtered ? () => f.onChange(INITIAL) : undefined} />}
      />
    </AdminPage>
  );
}
