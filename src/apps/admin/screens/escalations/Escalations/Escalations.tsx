/**
 * @screen  A-4.1 · Escalations
 * @flow    A4 Escalation management (story 4.1)
 * @states  default (review pending first) · status, level · sort · no matches
 * @spec    docs/admin/stories.md#41---manage-escalations
 * @xref    web: none (admin only)
 */
import { formatDate, useAdminStore, type Escalation, type EscalationType } from '@shared/admin';
import { DataTable, Icon, type Column } from '@admin/ui';
import { AdminPage, DEFAULT_SORT, ESCALATION_LEVEL, NoMatches, TableFilters, applySort, rangePhrase, showing, EscalationStatusText, EscalationTypeText, matches, type FilterState } from '@admin/patterns';
import { useTableFilters } from '@admin/hooks/useTableFilters';
import styles from './Escalations.module.css';
import { useAdminNav } from '@admin/navigation';

/** Every escalation shows; review-pending ones sort first (story 4.1). */
const INITIAL: FilterState = { query: '', values: {}, quick: null, sort: DEFAULT_SORT };
const PROFILE: Record<Escalation['profile']['kind'], string> = { client: 'Client', family: 'Family member', teen: 'Teen' };

export default function Escalations() {
  const escalations = useAdminStore((s) => s.escalations);
  const clients = useAdminStore((s) => s.clients);
  const openEscalation = useAdminNav((s) => s.openEscalation);
  const f = useTableFilters('escalations', INITIAL);
  const { query, values, sort } = f.state;
  const v = (k: string) => values[k] ?? 'all';

  const nameOf = (id: string) => clients.find((c) => c.id === id)?.name ?? 'Unknown client';
  const emailOf = (id: string) => clients.find((c) => c.id === id)?.email ?? '';
  const filtered = escalations.filter(
    (e) =>
      matches(query, nameOf(e.clientId), emailOf(e.clientId), e.reason) &&
      (v('level') === 'all' || e.type === v('level')) &&
      (v('status') === 'all' || e.status === v('status')),
  );
  // Review pending always comes first; the sort orders by date within each group (stable sort keeps it).
  const rows = applySort(filtered, sort, (e) => e.opened).sort((a, b) => (a.status === b.status ? 0 : a.status === 'not_reviewed' ? -1 : 1));
  const summary = showing(rows.length, ['escalation', 'escalations'], [
    v('level') !== 'all' && `with Severity: ${ESCALATION_LEVEL[v('level') as EscalationType]}`,
    v('status') !== 'all' && (v('status') === 'reviewed' ? 'reviewed' : 'with review pending'),
    rangePhrase(sort, 'opened'),
    query.trim() && `matching \u201c${query.trim()}\u201d`,
  ]);

  const columns: Column<Escalation>[] = [
    { key: 'client', header: 'User', primary: true, render: (e) => nameOf(e.clientId) },
    { key: 'profile', muted: true, header: 'Profile', render: (e) => (e.profile.kind === 'family' ? `${e.profile.name} (family)` : PROFILE[e.profile.kind]) },
    { key: 'type', header: 'Severity', render: (e) => <EscalationTypeText type={e.type} /> },
    { key: 'reason', header: 'Reason', grow: true, render: (e) => e.reason },
    { key: 'status', header: 'Status', render: (e) => <EscalationStatusText status={e.status} /> },
    {
      key: 'device',
      muted: true,
      header: 'Device',
      // Icon only: a phone for the iPhone / Android app, a laptop for the web. The name stays as the tooltip and accessible label.
      render: (e) => (
        <span className={styles.device} title={e.device} aria-label={e.device} role="img">
          <Icon name={e.device === 'Web browser' ? 'laptop' : 'mobile'} size={20} />
        </span>
      ),
    },
    { key: 'opened', muted: true, header: 'Date', render: (e) => <span className={styles.date}>{formatDate(e.opened)}</span> },
  ];

  return (
    <AdminPage
      title="Escalations"
      subtitle={`${escalations.length} escalations in total`}
      toolbar={
        <TableFilters
          {...f}
          placeholder="Search by name or email"
          rangeLabel="Opened between"
          categories={[
            { key: 'status', label: 'Status', options: [{ value: 'not_reviewed', label: 'Review pending' }, { value: 'reviewed', label: 'Reviewed' }] },
            { key: 'level', label: 'Severity', options: [{ value: 'emergency', label: 'Emergency' }, { value: 'crisis', label: 'Crisis' }, { value: 'urgent', label: 'Urgent' }] },
          ]}
        />
      }
    >
      <DataTable footer={summary}
        label="Escalation queue"
        columns={columns}
        rows={rows}
        rowKey={(e) => e.id}
        pager="outside"
        onRowClick={(e) => openEscalation(e.id)}
        empty={escalations.length === 0 ? 'There are no escalations to review.' : <NoMatches text="No escalations match these filters." onClear={() => f.onChange(INITIAL)} />}
      />
    </AdminPage>
  );
}
