/** Content listing (story 6.1): Pending approval first, then newest. Search by title or words in the content. */
import { useState } from 'react';
import { fileType, CONTENT_STATUS, CONTENT_TYPES, contentText, formatDate, useKnowledge, type ContentItem, type ContentStatus, type ContentType } from '@shared/admin';
import { DataTable, Select, StatusText, type Column } from '@admin/ui';
import { CONTENT_TONE, DEFAULT_SORT, FilterBar, FiltersPopover, SortRange, applySort, matches, rangePhrase, showing, type SortValue } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import styles from './tables.module.css';

export function ContentTable() {
  const items = useKnowledge((s) => s.items);
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | ContentType>('all');
  const [status, setStatus] = useState<'all' | ContentStatus>('all');
  const [source, setSource] = useState<'all' | ContentItem['source']>('all');
  const [sort, setSort] = useState<SortValue>(DEFAULT_SORT);

  // Pending approval always comes first; the sort orders by last updated within each group.
  const rows = applySort(
    items.filter((c) => matches(query, c.title, contentText(c)) && (type === 'all' || c.type === type) && (status === 'all' || c.status === status) && (source === 'all' || c.source === source)),
    sort,
    (c) => c.updated,
  ).sort((a, b) => ((a.status === 'pending') === (b.status === 'pending') ? 0 : a.status === 'pending' ? -1 : 1));
  const summary = showing(rows.length, ['item', 'items'], [
    type !== 'all' && `of kind ${type}`,
    status !== 'all' && `with status ${CONTENT_STATUS[status]}`,
    source !== 'all' && `from ${source}`,
    rangePhrase(sort, 'updated'),
    query.trim() && `matching \u201c${query.trim()}\u201d`,
  ]);

  const columns: Column<ContentItem>[] = [
    { key: 'title', header: 'Title', grow: true, primary: true, render: (c) => c.title },
    { key: 'type', muted: true, header: 'Kind', render: (c) => c.type },
    { key: 'status', header: 'Status', render: (c) => <StatusText tone={CONTENT_TONE[c.status]}>{CONTENT_STATUS[c.status]}</StatusText> },
    { key: 'source', muted: true, header: 'Source', render: (c) => c.source },
    { key: 'version', muted: true, header: 'Version', align: 'end', render: (c) => `v${c.version}` },
    { key: 'file', muted: true, header: 'File type', render: (c) => fileType(c) },
    { key: 'updated', muted: true, header: 'Last updated', render: (c) => formatDate(c.updated) },
  ];

  return (
    <div className={styles.stack}>
      <FilterBar query={query} onQuery={setQuery} placeholder="Search titles and content">
        <Select<'all' | ContentStatus>
          label="Status"
          hideLabel
          value={status}
          onChange={setStatus}
          options={[{ value: 'all', label: 'All statuses' }, ...(Object.keys(CONTENT_STATUS) as ContentStatus[]).map((k) => ({ value: k, label: CONTENT_STATUS[k] }))]}
        />
        <SortRange value={sort} onChange={setSort} rangeLabel="Updated between" />
        {/* Rarely used: content type sits behind Filters to keep the toolbar quiet. */}
        <FiltersPopover active={(type === 'all' ? 0 : 1) + (source === 'all' ? 0 : 1)} onClear={() => { setType('all'); setSource('all'); }}>
          <Select<'all' | ContentType> label="Kind of content" value={type} onChange={setType} options={[{ value: 'all', label: 'All kinds' }, ...CONTENT_TYPES.map((t) => ({ value: t, label: t }))]} />
          <Select<'all' | ContentItem['source']> label="Source" value={source} onChange={setSource} options={[{ value: 'all', label: 'All sources' }, { value: 'Uploaded', label: 'Uploaded' }]} />
        </FiltersPopover>
      </FilterBar>
      <DataTable label="Knowledge Base content" columns={columns} rows={rows} rowKey={(c) => c.id} onRowClick={(c) => openDrawer({ kind: 'content', id: c.id })} footer={summary} pager="outside" empty="No content matches your search." />
    </div>
  );
}
