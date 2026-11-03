/**
 * @screen  A-8.1 · Audit log
 * @flow    A8 Audit logging
 * @states  default · filtered by person · empty · confirm clear all
 * @spec    docs/admin/README.md#a-81-audit-log
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { formatDate, useAdminStore, type AuditEntry } from '@shared/admin';
import { Button, DataTable, IconButton, Select, type Column } from '@admin/ui';
import { AdminPage, ConfirmDialog, FilterBar, matches } from '@admin/patterns';
import { useAdminToast } from '@admin/hooks/toast.store';
import { useAdminNav } from '@admin/navigation';

export default function AuditLog() {
  const log = useAdminStore((s) => s.auditLog);
  const toast = useAdminToast();
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const [query, setQuery] = useState('');
  const [actor, setActor] = useState('all');
  const [confirming, setConfirming] = useState(false);
  const actors = [...new Set(log.map((e) => e.actor))];
  const rows = log.filter((e) => matches(query, e.text, e.actor) && (actor === 'all' || e.actor === actor));

  const columns: Column<AuditEntry>[] = [
    { key: 'at', muted: true, header: 'When', sort: (e) => e.at, render: (e) => formatDate(e.at) },
    { key: 'text', header: 'Action', grow: true, primary: true, render: (e) => e.text },
    { key: 'actor', muted: true, header: 'By', sort: (e) => e.actor, render: (e) => e.actor },
    {
      key: 'clear',
      muted: true,
      header: '',
      align: 'end',
      render: (e) => (
        <IconButton icon="close" size="sm" label="Clear entry" onClick={(ev) => { ev.stopPropagation(); useAdminStore.getState().clearLogEntry(e.id); toast('Entry cleared'); }} />
      ),
    },
  ];

  return (
    <AdminPage
      title="Audit log"
      subtitle="Every change made in this console, newest first."
      action={<Button variant="secondary" disabled={log.length === 0} onClick={() => setConfirming(true)}>Clear all</Button>}
      toolbar={
        <FilterBar query={query} onQuery={setQuery} placeholder="Search actions">
          <Select label="Person" hideLabel value={actor} onChange={setActor} options={[{ value: 'all', label: 'Everyone' }, ...actors.map((a) => ({ value: a, label: a }))]} />
        </FilterBar>
      }
    >
      <DataTable
        label="Audit log"
        columns={columns}
        rows={rows}
        rowKey={(e) => e.id}
        onRowClick={(e) => openDrawer({ kind: 'audit', id: e.id })}
        initialSort={{ key: 'at', dir: 'desc' }}
        footer={`Showing ${rows.length} of ${log.length} entries`}
        empty={log.length === 0 ? 'The log is empty. New actions are recorded as they happen.' : 'No entries match.'}
      />
      {confirming && (
        <ConfirmDialog
          title="Clear the whole log?"
          body={`All ${log.length} entries are removed. This can't be undone.`}
          confirm="Clear all"
          destructive
          onConfirm={() => { useAdminStore.getState().clearLog(); setConfirming(false); toast('Log cleared'); }}
          onClose={() => setConfirming(false)}
        />
      )}
    </AdminPage>
  );
}
