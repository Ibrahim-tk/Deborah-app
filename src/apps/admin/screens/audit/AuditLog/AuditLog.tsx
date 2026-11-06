/**
 * @screen  A-8.1 · Audit log
 * @flow    A8 Audit logging (story 10.1)
 * @states  default · filtered by role / category / date range · sorted · exported · empty
 * @spec    docs/admin/stories.md#101---view--export-audit-logs
 * @xref    web: none (admin only)
 */
import { AUDIT_CATEGORY, AUDIT_ROLE, adminName, formatDate, useAdminStore, type AuditCategory, type AuditEntry, type AuditRole } from '@shared/admin';
import { Button, DataTable, StatusText, type Column, type StatusTone } from '@admin/ui';
import { AdminPage, ChecklistFilter, DEFAULT_SORT, FilterBar, NoMatches, SortRange, applySort, matches, rangePhrase, showing, type SortValue } from '@admin/patterns';
import { useTableFilters } from '@admin/hooks/useTableFilters';
import { useAdminToast } from '@admin/hooks/toast.store';
import { useAdminNav } from '@admin/navigation';
import { downloadCsv } from './parts/csv';
import styles from './AuditLog.module.css';

interface AuditFilters { query: string; picks: Record<string, string[]>; sort: SortValue }
const INITIAL: AuditFilters = { query: '', picks: {}, sort: DEFAULT_SORT };
/** Admin-panel actions happen on the web; sign-ins carry their own device and IP. */
const isMobile = (d?: string) => !!d && /iphone|android|ipad/i.test(d);
/** Profile pills, from the status palette. */
const ROLE_TONE: Record<AuditRole, StatusTone> = { super: 'accent', admin: 'info', client: 'warning', teen: 'danger', system: 'neutral' };

/** Prototype IP for entries that don't carry one: stable per person, so the same admin always shows the same address. */
const seededIp = (seed: string) => {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `${73 + (h % 40)}.${(h >>> 8) % 256}.${(h >>> 16) % 256}.${((h >>> 4) % 250) + 2}`;
};

/** Entries can't be edited or deleted by anyone (story 10.1), so there's no clear action. */
export default function AuditLog() {
  const log = useAdminStore((s) => s.auditLog);
  const admins = useAdminStore((s) => s.admins);
  const clients = useAdminStore((s) => s.clients);
  const toast = useAdminToast();
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const f = useTableFilters('audit', INITIAL);
  const { query, picks, sort } = f.state;
  const roles = picks.role ?? [];
  const cats = picks.category ?? [];

  const nameOf = (e: AuditEntry) => {
    if (e.role === 'system') return 'System';
    const a = admins.find((x) => x.email === e.actor);
    return a ? adminName(a) : clients.find((c) => c.email === e.actor)?.name ?? e.actor.split('@')[0];
  };
  const rows = applySort(
    log.filter(
      (e) =>
        matches(query, nameOf(e), e.actor) &&
        (roles.length === 0 || roles.includes(e.role)) &&
        (cats.length === 0 || cats.includes(e.category)),
    ),
    sort,
    (e) => e.at,
  );
  const summary = showing(rows.length, ['entry', 'entries'], [
    roles.length > 0 && `by ${roles.map((r) => AUDIT_ROLE[r as AuditRole]).join(' or ')}`,
    cats.length > 0 && `in ${cats.map((c) => AUDIT_CATEGORY[c as AuditCategory]).join(' or ')}`,
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
    // Normal width; long actions truncate (the full text is in the row's drawer and the tooltip).
    { key: 'text', header: 'Action', primary: true, render: (e) => <span className={styles.action} title={e.text}>{e.text}</span> },
    { key: 'who', header: 'User', render: (e) => nameOf(e) },
    { key: 'profile', header: 'Profile', render: (e) => <StatusText tone={ROLE_TONE[e.role]}>{AUDIT_ROLE[e.role]}</StatusText> },
    { key: 'email', muted: true, header: 'Email', render: (e) => (e.role === 'system' ? '—' : e.actor) },
    {
      key: 'device',
      muted: true,
      header: 'Device IP',
      // Same icons as Escalations: a phone for mobile, a laptop for the web; the IP beside it.
      render: (e) => {
        if (e.role === 'system') return '—';
        const ip = e.device?.split(' · ')[1] ?? seededIp(e.actor);
        return (
          // Grey pill: device icon then the IP.
          <span title={e.device ?? `Admin panel (web) · ${ip}`}>
            <StatusText icon={isMobile(e.device) ? 'mobile' : 'laptop'}>{ip}</StatusText>
          </span>
        );
      },
    },
    { key: 'at', muted: true, header: 'Date', render: (e) => formatDate(e.at) },
  ];

  return (
    <AdminPage
      title="Audit log"
      subtitle={`${log.length} entries in total`}
      action={<Button variant="secondary" leadingIcon="download" disabled={rows.length === 0} onClick={exportCsv}>Export</Button>}
      toolbar={
        <FilterBar query={query} onQuery={(q) => f.onChange({ ...f.state, query: q })} placeholder="Search by name or email">
          <ChecklistFilter
            value={picks}
            onApply={(p) => f.onChange({ ...f.state, picks: p })}
            groups={[
              { key: 'category', label: 'Category', options: (Object.keys(AUDIT_CATEGORY) as AuditCategory[]).map((c) => ({ value: c, label: AUDIT_CATEGORY[c] })) },
              { key: 'role', label: 'Role', options: (Object.keys(AUDIT_ROLE) as AuditRole[]).map((r) => ({ value: r, label: AUDIT_ROLE[r] })) },
            ]}
          />
          <SortRange value={sort} onChange={(v) => f.onChange({ ...f.state, sort: v })} rangeLabel="Entries between" />
        </FilterBar>
      }
    >
      <DataTable footer={summary}
        label="Audit log"
        columns={columns}
        rows={rows}
        rowKey={(e) => e.id}
        onRowClick={(e) => openDrawer({ kind: 'audit', id: e.id })}
        pager="outside"
        empty={<NoMatches text="No entries match your filters." onClear={() => f.onChange(INITIAL)} />}
      />
    </AdminPage>
  );
}
