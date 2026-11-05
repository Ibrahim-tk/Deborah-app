/** Knowledge gaps (story 6.3): questions the Oracle couldn't answer, grouped. New first, most asked first.
 *  Only the question shows: never the Client's name, email or conversation. */
import { useState } from 'react';
import { GAP_STATUS, formatDate, useKnowledge, type GapStatus, type KnowledgeGap } from '@shared/admin';
import { DataTable, Select, type Column } from '@admin/ui';
import { FilterBar, matches } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import styles from './tables.module.css';

export function GapsTable() {
  const gaps = useKnowledge((s) => s.gaps);
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');
  const [status, setStatus] = useState<'all' | GapStatus>('all');
  const topics = [...new Set(gaps.map((g) => g.topic))].sort();

  const rows = gaps
    .filter((g) => matches(query, g.question) && (topic === 'all' || g.topic === topic) && (status === 'all' || g.status === status))
    .sort((a, b) => ((a.status === 'new') !== (b.status === 'new') ? (a.status === 'new' ? -1 : 1) : b.timesAsked - a.timesAsked));

  const columns: Column<KnowledgeGap>[] = [
    { key: 'question', header: 'Question', grow: true, primary: true, render: (g) => g.question },
    { key: 'topic', muted: true, header: 'Topic', render: (g) => g.topic },
    { key: 'times', header: 'Times asked', align: 'end', render: (g) => g.timesAsked },
    { key: 'status', header: 'Status', render: (g) => GAP_STATUS[g.status] },
    { key: 'first', muted: true, header: 'First asked', render: (g) => formatDate(g.firstAsked) },
    { key: 'last', muted: true, header: 'Last asked', render: (g) => formatDate(g.lastAsked) },
  ];

  return (
    <div className={styles.stack}>
      <FilterBar inline query={query} onQuery={setQuery} placeholder="Search questions">
        <Select label="Topic" hideLabel value={topic} onChange={setTopic} options={[{ value: 'all', label: 'All topics' }, ...topics.map((t) => ({ value: t, label: t }))]} />
        <Select<'all' | GapStatus>
          label="Status"
          hideLabel
          value={status}
          onChange={setStatus}
          options={[{ value: 'all', label: 'All statuses' }, ...(Object.keys(GAP_STATUS) as GapStatus[]).map((k) => ({ value: k, label: GAP_STATUS[k] }))]}
        />
      </FilterBar>
      <DataTable label="Knowledge gaps" columns={columns} rows={rows} rowKey={(g) => g.id} onRowClick={(g) => openDrawer({ kind: 'gap', id: g.id })} empty={gaps.length === 0 ? 'There are no knowledge gaps right now.' : 'No gaps match your search.'} />
    </div>
  );
}
