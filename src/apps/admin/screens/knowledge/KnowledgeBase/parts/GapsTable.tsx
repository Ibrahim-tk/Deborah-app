/** Knowledge gaps (story 6.3): questions the Oracle couldn't answer, grouped. New first, most asked first.
 *  Only the question shows: never the Client's name, email or conversation. */
import { GAP_STATUS, formatDate, useKnowledge, type GapStatus, type KnowledgeGap } from '@shared/admin';
import { Button, DataTable, StatusText, type Column } from '@admin/ui';
import { DEFAULT_SORT, GAP_TONE, NoMatches, TableFilters, applySort, matches, rangePhrase, showing, type FilterState } from '@admin/patterns';
import { useTableFilters } from '@admin/hooks/useTableFilters';

import { useAdminNav } from '@admin/navigation';
import { openEditor } from '../../ContentEditor/open';
import styles from './tables.module.css';

const INITIAL: FilterState = { query: '', values: {}, quick: null, sort: DEFAULT_SORT };

export function GapsTable() {
  const gaps = useKnowledge((s) => s.gaps);
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const f = useTableFilters('kb-gaps', INITIAL);
  const { query, values, sort } = f.state;
  const status = (values.status ?? 'all') as 'all' | GapStatus;

  // New gaps always come first; within each group, the sort orders by when they were last asked.
  const rows = applySort(
    gaps.filter((g) => matches(query, g.question) && (status === 'all' || g.status === status)),
    sort,
    (g) => g.lastAsked,
  ).sort((a, b) => ((a.status === 'new') === (b.status === 'new') ? 0 : a.status === 'new' ? -1 : 1));
  const summary = showing(rows.length, ['gap', 'gaps'], [
    status !== 'all' && GAP_STATUS[status].toLowerCase(),
    rangePhrase(sort, 'last asked'),
    query.trim() && `matching \u201c${query.trim()}\u201d`,
  ]);

  const columns: Column<KnowledgeGap>[] = [
    { key: 'question', header: 'Question', grow: true, primary: true, render: (g) => g.question },
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
      <TableFilters
        {...f}
        placeholder="Search questions"
        rangeLabel="Last asked between"
        categories={[
          { key: 'status', label: 'Status', options: (Object.keys(GAP_STATUS) as GapStatus[]).map((k) => ({ value: k, label: GAP_STATUS[k] })) },
        ]}
      />
      <DataTable footer={summary} label="Knowledge gaps" columns={columns} rows={rows} rowKey={(g) => g.id} onRowClick={(g) => openDrawer({ kind: 'gap', id: g.id })} pager="outside" empty={gaps.length === 0 ? 'There are no knowledge gaps right now.' : <NoMatches text="No gaps match these filters." onClear={() => f.onChange(INITIAL)} />} />
    </div>
  );
}
