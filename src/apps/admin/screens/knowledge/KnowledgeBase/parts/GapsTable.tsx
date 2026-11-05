/** Knowledge gaps (story 6.3): questions the Oracle couldn't answer, grouped. New first, most asked first.
 *  Only the question shows: never the Client's name, email or conversation. */
import { useState } from 'react';
import { GAP_STATUS, formatDate, useKnowledge, type GapStatus, type KnowledgeGap } from '@shared/admin';
import { Button, DataTable, Select, StatusText, type Column } from '@admin/ui';
import { DEFAULT_SORT, FilterBar, GAP_TONE, SortRange, applySort, matches, rangePhrase, showing, type SortValue } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { openEditor } from '../../ContentEditor/open';
import styles from './tables.module.css';

export function GapsTable() {
  const gaps = useKnowledge((s) => s.gaps);
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');
  const [status, setStatus] = useState<'all' | GapStatus>('all');
  const [sort, setSort] = useState<SortValue>(DEFAULT_SORT);
  const topics = [...new Set(gaps.map((g) => g.topic))].sort();

  // New gaps always come first; within each group, the sort orders by when they were last asked.
  const rows = applySort(
    gaps.filter((g) => matches(query, g.question) && (topic === 'all' || g.topic === topic) && (status === 'all' || g.status === status)),
    sort,
    (g) => g.lastAsked,
  ).sort((a, b) => ((a.status === 'new') === (b.status === 'new') ? 0 : a.status === 'new' ? -1 : 1));
  const summary = showing(rows.length, ['gap', 'gaps'], [
    topic !== 'all' && `about ${topic}`,
    status !== 'all' && GAP_STATUS[status].toLowerCase(),
    rangePhrase(sort, 'last asked'),
    query.trim() && `matching \u201c${query.trim()}\u201d`,
  ]);

  const columns: Column<KnowledgeGap>[] = [
    { key: 'question', header: 'Question', grow: true, primary: true, render: (g) => g.question },
    { key: 'topic', muted: true, header: 'Topic', render: (g) => g.topic },
    { key: 'times', header: 'Times asked', align: 'end', render: (g) => g.timesAsked },
    { key: 'status', header: 'Status', render: (g) => <StatusText tone={GAP_TONE[g.status]}>{GAP_STATUS[g.status]}</StatusText> },
    { key: 'first', muted: true, header: 'First asked', render: (g) => formatDate(g.firstAsked) },
    { key: 'last', muted: true, header: 'Last asked', render: (g) => formatDate(g.lastAsked) },
    {
      key: 'answer',
      header: '',
      align: 'end',
      // One step to the main job: answer a new gap straight from its row.
      render: (g) =>
        g.status === 'new' ? (
          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); openEditor(`new:${g.id}`); }}>Answer</Button>
        ) : null,
    },
  ];

  return (
    <div className={styles.stack}>
      <FilterBar query={query} onQuery={setQuery} placeholder="Search questions">
        <Select label="Topic" hideLabel value={topic} onChange={setTopic} options={[{ value: 'all', label: 'All topics' }, ...topics.map((t) => ({ value: t, label: t }))]} />
        <Select<'all' | GapStatus>
          label="Status"
          hideLabel
          value={status}
          onChange={setStatus}
          options={[{ value: 'all', label: 'All statuses' }, ...(Object.keys(GAP_STATUS) as GapStatus[]).map((k) => ({ value: k, label: GAP_STATUS[k] }))]}
        />
        <SortRange value={sort} onChange={setSort} rangeLabel="Last asked between" />
      </FilterBar>
      <DataTable label="Knowledge gaps" columns={columns} rows={rows} rowKey={(g) => g.id} onRowClick={(g) => openDrawer({ kind: 'gap', id: g.id })} footer={summary} pager="outside" empty={gaps.length === 0 ? 'There are no knowledge gaps right now.' : 'No gaps match your search.'} />
    </div>
  );
}
