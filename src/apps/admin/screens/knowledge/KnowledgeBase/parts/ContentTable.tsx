/** Content listing (story 6.1): Pending approval first, then newest. Search by title or words in the content. */
import { useState } from 'react';
import { CONTENT_STATUS, CONTENT_TYPES, contentText, formatDate, useKnowledge, type ContentItem, type ContentStatus, type ContentType } from '@shared/admin';
import { DataTable, Select, type Column } from '@admin/ui';
import { FilterBar, matches } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import styles from './tables.module.css';

export function ContentTable() {
  const items = useKnowledge((s) => s.items);
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | ContentType>('all');
  const [status, setStatus] = useState<'all' | ContentStatus>('all');
  const [order, setOrder] = useState<'latest' | 'oldest'>('latest');

  const rows = items
    .filter((c) => matches(query, c.title, contentText(c)) && (type === 'all' || c.type === type) && (status === 'all' || c.status === status))
    .sort((a, b) => {
      if ((a.status === 'pending') !== (b.status === 'pending')) return a.status === 'pending' ? -1 : 1;
      return order === 'latest' ? b.updated.localeCompare(a.updated) : a.updated.localeCompare(b.updated);
    });

  const columns: Column<ContentItem>[] = [
    { key: 'title', header: 'Title', grow: true, primary: true, render: (c) => c.title },
    { key: 'type', muted: true, header: 'Type', render: (c) => c.type },
    { key: 'source', muted: true, header: 'Source', render: (c) => c.source },
    { key: 'status', header: 'Status', render: (c) => CONTENT_STATUS[c.status] },
    { key: 'version', muted: true, header: 'Version', align: 'end', render: (c) => `v${c.version}` },
    { key: 'updated', muted: true, header: 'Last updated', render: (c) => formatDate(c.updated) },
  ];

  return (
    <div className={styles.stack}>
      <FilterBar inline query={query} onQuery={setQuery} placeholder="Search titles and content">
        <Select<'all' | ContentType> label="Type" hideLabel value={type} onChange={setType} options={[{ value: 'all', label: 'All types' }, ...CONTENT_TYPES.map((t) => ({ value: t, label: t }))]} />
        <Select<'all' | ContentStatus>
          label="Status"
          hideLabel
          value={status}
          onChange={setStatus}
          options={[{ value: 'all', label: 'All statuses' }, ...(Object.keys(CONTENT_STATUS) as ContentStatus[]).map((k) => ({ value: k, label: CONTENT_STATUS[k] }))]}
        />
        <Select<'latest' | 'oldest'> label="Sort" hideLabel value={order} onChange={setOrder} options={[{ value: 'latest', label: 'Latest' }, { value: 'oldest', label: 'Oldest' }]} />
      </FilterBar>
      <DataTable label="Knowledge Base content" columns={columns} rows={rows} rowKey={(c) => c.id} onRowClick={(c) => openDrawer({ kind: 'content', id: c.id })} empty="No content matches your search." />
    </div>
  );
}
