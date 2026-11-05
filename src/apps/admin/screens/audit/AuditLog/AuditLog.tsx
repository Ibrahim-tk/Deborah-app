/**
 * @screen  A-8.1 · Audit log
 * @flow    A8 Audit logging (story 10.1)
 * @states  default · filtered by role / category / date range · sorted · exported · empty
 * @spec    docs/admin/stories.md#101---view--export-audit-logs
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { AUDIT_CATEGORY, AUDIT_ROLE, adminName, formatDate, useAdminStore, type AuditCategory, type AuditEntry, type AuditRole } from '@shared/admin';
import { Button, DataTable, Select, type Column } from '@admin/ui';
import { AdminPage, DEFAULT_SORT, FilterBar, SortRange, applySort, matches, rangePhrase, showing, type SortValue } from '@admin/patterns';
import { useAdminToast } from '@admin/hooks/toast.store';
import { useAdminNav } from '@admin/navigation';
import { downloadCsv } from './parts/csv';
import styles from './AuditLog.module.css';

/** Entries can't be edited or deleted by anyone (story 10.1), so there's no clear action. */
export default function AuditLog() {
  const log = useAdminStore((s) => s.auditLog);
  const admins = useAdminStore((s) => s.admins);
  const clients = useAdminStore((s) => s.clients);
  const toast = useAdminToast();
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<'all' | AuditRole>('all');
  const [category, setCategory] = useState<'all' | AuditCategory>('all');
  const [sort, setSort] = useState<SortValue>(DEFAULT_SORT);

  const nameOf = (e: AuditEntry) => {
    if (e.role === 'system') return 'System';
    const a = admins.find((x) => x.email === e.actor);
    return a ? adminName(a) : clients.find((c) => c.email === e.actor)?.name ?? e.actor.split('@')[0];
  };
  const rows = applySort(
    log.filter((e) => matches(query, nameOf(e), e.actor) && (role === 'all' || e.role === role) && (category === 'all' || e.category === category)),
    sort,
    (e) => e.at,
  );
  const summary = showing(rows.length, ['entry', 'entries'], [
    role !== 'all' && `by ${AUDIT_ROLE[role]}`,
    category !== 'all' && `in ${AUDIT_CATEGORY[category]}`,
    rangePhrase(sort, 'from'),
    query.trim() && `matching \u201c${query.trim()}\u201d`,
  ]);

  const exportCsv = () => {
    downloadCsv(
      'audit-log.csv',
      ['When', 'Who', 'Email', 'Role', 'Category', 'Action', 'Affected', 'Device or IP'],
      rows.map((e) => [e.at.replace('T', ' '), nameOf(e), e.actor, AUDIT_ROLE[e.role], AUDIT_CATEGORY[e.category], e.text, e.target ?? '', e.device ?? '']),
    );
    useAdminStore.getState().log(`Exported ${rows.length} audit log entries`);
    toast('Your audit log export has downloaded.');
  };

  const columns: Column<AuditEntry>[] = [
    { key: 'text', header: 'Action', grow: true, primary: true, render: (e) => e.text },
    {
      key: 'who',
      header: 'Who',
      render: (e) => (
        <span className={styles.who}>
          <span>{nameOf(e)}</span>
          <span className={styles.sub}>{AUDIT_ROLE[e.role]}{e.role !== 'system' ? ` · ${e.actor}` : ''}</span>
        </span>
      ),
    },
    { key: 'category', muted: true, header: 'Category', render: (e) => AUDIT_CATEGORY[e.category] },
    { key: 'target', muted: true, header: 'Affected', render: (e) => e.target ?? '—' },
    { key: 'device', muted: true, header: 'Device or IP', render: (e) => e.device ?? '—' },
    { key: 'at', muted: true, header: 'When', render: (e) => formatDate(e.at) },
  ];

  return (
    <AdminPage
      title="Audit log"
      subtitle={`${log.length} entries in total`}
      action={<Button variant="secondary" leadingIcon="download" disabled={rows.length === 0} onClick={exportCsv}>Export</Button>}
      toolbar={
        <FilterBar query={query} onQuery={setQuery} placeholder="Search by name or email">
          <Select<'all' | AuditRole> label="Role" hideLabel value={role} onChange={setRole} options={[{ value: 'all', label: 'All roles' }, ...(Object.keys(AUDIT_ROLE) as AuditRole[]).map((r) => ({ value: r, label: AUDIT_ROLE[r] }))]} />
          <Select<'all' | AuditCategory>
            label="Category"
            hideLabel
            value={category}
            onChange={setCategory}
            options={[{ value: 'all', label: 'All categories' }, ...(Object.keys(AUDIT_CATEGORY) as AuditCategory[]).map((c) => ({ value: c, label: AUDIT_CATEGORY[c] }))]}
          />
          <SortRange value={sort} onChange={setSort} rangeLabel="Entries between" />
        </FilterBar>
      }
    >
      <DataTable
        label="Audit log"
        columns={columns}
        rows={rows}
        rowKey={(e) => e.id}
        onRowClick={(e) => openDrawer({ kind: 'audit', id: e.id })}
        footer={summary}
        pager="outside"
        empty="No entries match your filters."
      />
    </AdminPage>
  );
}
