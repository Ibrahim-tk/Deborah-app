/**
 * @screen  A-5.1 · Support requests
 * @flow    A5 Support request management
 * @states  default (open first, oldest first) · quick filter (consultation) · status, type, account type · no matches
 * @spec    docs/admin/README.md#a-51-support-requests
 * @xref    web: none (admin only)
 */
import { useAdminStore, type SupportType } from '@shared/admin';
import { AdminPage, DEFAULT_SORT, NoMatches, SUPPORT_TYPE, TableFilters, applySort, matches, rangePhrase, showing, type FilterState } from '@admin/patterns';
import { useTableFilters } from '@admin/hooks/useTableFilters';
import { RequestsTable } from './parts/RequestsTable';

/** Story 5.1: open requests first, oldest first. */
const INITIAL: FilterState = { query: '', values: {}, quick: null, sort: { ...DEFAULT_SORT, order: 'oldest' } };

export default function Support() {
  const requests = useAdminStore((s) => s.supportRequests);
  const clients = useAdminStore((s) => s.clients);
  const f = useTableFilters('support', INITIAL);
  const { query, values, quick, sort } = f.state;
  const v = (k: string) => values[k] ?? 'all';
  const clientOf = (id: string) => clients.find((c) => c.id === id);

  // Open requests always come first; the sort orders by date received within each group.
  const rows = applySort(
    requests.filter(
      (r) =>
        matches(query, clientOf(r.clientId)?.name ?? '', clientOf(r.clientId)?.email ?? '') &&
        (quick !== 'consult' || r.type === 'consultation') &&
        (v('status') === 'all' || r.resolved === (v('status') === 'resolved')) &&
        (v('type') === 'all' || r.type === v('type')) &&
        (v('account') === 'all' || clientOf(r.clientId)?.accountType === v('account')),
    ),
    sort,
    (r) => r.received,
  ).sort((a, b) => (a.resolved === b.resolved ? 0 : a.resolved ? 1 : -1));
  const summary = showing(rows.length, ['request', 'requests'], [
    v('status') !== 'all' && (v('status') === 'open' ? 'open' : 'resolved'),
    v('type') !== 'all' && `of type ${SUPPORT_TYPE[v('type') as SupportType]}`,
    rangePhrase(sort, 'received'),
    query.trim() && `matching \u201c${query.trim()}\u201d`,
  ]);

  return (
    <AdminPage
      title="Support requests"
      subtitle={`${requests.length} support requests in total`}
      toolbar={
        <TableFilters
          {...f}
          placeholder="Search by name or email"
          rangeLabel="Received between"
          quick={[{ key: 'consult', label: 'Consultation' }]}
          categories={[
            { key: 'status', label: 'Status', options: [{ value: 'open', label: 'Open' }, { value: 'resolved', label: 'Resolved' }] },
            { key: 'type', label: 'Type', options: (Object.keys(SUPPORT_TYPE) as SupportType[]).map((t) => ({ value: t, label: SUPPORT_TYPE[t] })) },
            { key: 'account', label: 'Account type', options: [{ value: 'adult', label: 'Adult' }, { value: 'teen', label: 'Teen' }] },
          ]}
        />
      }
    >
      <RequestsTable
        footer={summary}
        rows={rows}
        empty={requests.length === 0 ? 'There are no support requests right now.' : <NoMatches text="No requests match these filters." onClear={() => f.onChange(INITIAL)} />}
      />
    </AdminPage>
  );
}
