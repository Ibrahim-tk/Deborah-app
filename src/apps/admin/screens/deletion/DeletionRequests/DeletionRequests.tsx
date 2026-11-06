/**
 * @screen  A-5.4 · Deletion requests
 * @flow    A5 Support request management (story 5.2, data deletion)
 * @states  default (completed last) · type, status · create request · no matches
 * @spec    docs/admin/README.md#a-54-deletion-requests
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { useAdminStore, type DeletionRequest } from '@shared/admin';
import { Button } from '@admin/ui';
import { AdminPage, DEFAULT_SORT, DELETION_STATUS, DELETION_TYPE, NoMatches, TableFilters, applySort, matches, rangePhrase, showing, type FilterState } from '@admin/patterns';
import { useTableFilters } from '@admin/hooks/useTableFilters';
import { DeletionTable } from './parts/DeletionTable';
import { CreateDeletionDialog } from './parts/CreateDeletionDialog';

/** Oldest received first = closest deadline first (story 5.2); completed requests sort last. */
const INITIAL: FilterState = { query: '', values: {}, quick: null, sort: { ...DEFAULT_SORT, order: 'oldest' } };

export default function DeletionRequests() {
  const requests = useAdminStore((s) => s.deletionRequests);
  const clients = useAdminStore((s) => s.clients);
  const f = useTableFilters('deletion', INITIAL);
  const { query, values, sort } = f.state;
  const v = (k: string) => values[k] ?? 'all';
  const [creating, setCreating] = useState(false);
  const clientOf = (id: string) => clients.find((c) => c.id === id);

  // Completed requests go to the bottom.
  const rows = applySort(
    requests.filter(
      (r) =>
        matches(query, clientOf(r.clientId)?.name ?? '', clientOf(r.clientId)?.email ?? '') &&
        (v('type') === 'all' || r.type === v('type')) &&
        (v('status') === 'all' || (v('status') === 'active' ? r.status !== 'completed' : r.status === v('status'))),
    ),
    sort,
    (r) => r.received,
  ).sort((a, b) => ((a.status === 'completed') === (b.status === 'completed') ? 0 : a.status === 'completed' ? 1 : -1));
  const summary = showing(rows.length, ['request', 'requests'], [
    v('status') === 'active' ? 'not completed' : v('status') !== 'all' && `with Status: ${DELETION_STATUS[v('status') as DeletionRequest['status']]}`,
    rangePhrase(sort, 'received'),
    query.trim() && `matching \u201c${query.trim()}\u201d`,
  ]);

  return (
    <AdminPage
      title="Deletion requests"
      subtitle={`${requests.length} deletion requests in total`}
      action={<Button leadingIcon="plus" onClick={() => setCreating(true)}>Create deletion request</Button>}
      toolbar={
        <TableFilters
          {...f}
          placeholder="Search by name or email"
          rangeLabel="Received between"
          categories={[
            { key: 'type', label: 'Type', options: (Object.keys(DELETION_TYPE) as DeletionRequest['type'][]).map((t) => ({ value: t, label: DELETION_TYPE[t] })) },
            {
              key: 'status',
              label: 'Status',
              options: [{ value: 'active', label: 'Not completed' }, ...(Object.keys(DELETION_STATUS) as DeletionRequest['status'][]).map((k) => ({ value: k, label: DELETION_STATUS[k] }))],
            },
          ]}
        />
      }
    >
      <DeletionTable
        footer={summary}
        rows={rows}
        empty={requests.length === 0 ? 'There are no deletion requests right now.' : <NoMatches text="No requests match these filters." onClear={() => f.onChange(INITIAL)} />}
      />
      {creating && <CreateDeletionDialog onClose={() => setCreating(false)} />}
    </AdminPage>
  );
}
