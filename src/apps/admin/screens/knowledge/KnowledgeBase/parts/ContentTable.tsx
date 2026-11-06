/** Content listing (story 6.1): Pending approval first, then newest. Search by title or words in the content. */
import { fileType, CONTENT_STATUS, CONTENT_TYPES, contentText, formatDate, useKnowledge, type ContentItem, type ContentStatus, type ContentType } from '@shared/admin';
import { DataTable, StatusText, type Column } from '@admin/ui';
import { CONTENT_TONE, DEFAULT_SORT, NoMatches, TableFilters, applySort, matches, rangePhrase, showing, type FilterState } from '@admin/patterns';
import { useTableFilters } from '@admin/hooks/useTableFilters';

import { useAdminNav } from '@admin/navigation';
import styles from './tables.module.css';

/** Processing uploads first, then content waiting for approval, then everything else. */
const rank = (st: ContentStatus) => (st === 'processing' ? 0 : st === 'pending' ? 1 : 2);

const INITIAL: FilterState = { query: '', values: {}, quick: null, sort: DEFAULT_SORT };

export function ContentTable() {
  const items = useKnowledge((s) => s.items);
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const f = useTableFilters('kb-content', INITIAL);
  const { query, values, sort } = f.state;
  const type = (values.type ?? 'all') as 'all' | ContentType;
  const status = (values.status ?? 'all') as 'all' | ContentStatus;

  // Pending approval always comes first; the sort orders by last updated within each group.
  const rows = applySort(
    items.filter((c) => matches(query, c.title, contentText(c)) && (type === 'all' || c.type === type) && (status === 'all' || c.status === status)),
    sort,
    (c) => c.updated,
  ).sort((a, b) => rank(a.status) - rank(b.status));
  const summary = showing(rows.length, ['item', 'items'], [
    type !== 'all' && `of type ${type}`,
    status !== 'all' && `with Status: ${CONTENT_STATUS[status]}`,
    rangePhrase(sort, 'updated'),
    query.trim() && `matching \u201c${query.trim()}\u201d`,
  ]);

  const columns: Column<ContentItem>[] = [
    { key: 'title', header: 'Title', grow: true, primary: true, render: (c) => c.title },
    { key: 'type', muted: true, header: 'Type', render: (c) => c.type },
    { key: 'status', header: 'Status', render: (c) => <StatusText tone={CONTENT_TONE[c.status]}>{CONTENT_STATUS[c.status]}</StatusText> },
    { key: 'file', muted: true, header: 'File type', render: (c) => fileType(c) },
    { key: 'updated', muted: true, header: 'Last updated', render: (c) => <span className={styles.date}>{formatDate(c.updated)}</span> },
  ];

  return (
    <div className={styles.stack}>
      <TableFilters
        {...f}
        placeholder="Search titles and content"
        rangeLabel="Updated between"
        categories={[
          { key: 'status', label: 'Status', options: (Object.keys(CONTENT_STATUS) as ContentStatus[]).map((k) => ({ value: k, label: CONTENT_STATUS[k] })) },
          { key: 'type', label: 'Type', options: CONTENT_TYPES.map((t) => ({ value: t, label: t })) },
        ]}
      />
      <DataTable footer={summary} label="Knowledge Base content" columns={columns} rows={rows} rowKey={(c) => c.id} onRowClick={(c) => openDrawer({ kind: 'content', id: c.id })} pager="outside" empty={<NoMatches text="No content matches these filters." onClear={() => f.onChange(INITIAL)} />} />
    </div>
  );
}
