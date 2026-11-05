/**
 * @screen  A-9.1 · Consent
 * @flow    A9 Consent management (story 9.1)
 * @states  default · draft exists · revocations empty
 * @spec    docs/admin/stories.md#91---view--edit-policy-versions
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { formatDate, liveVersion, useAdminStore, usePolicies, type ConsentRevocation, type Policy } from '@shared/admin';
import { DataTable, type Column } from '@admin/ui';
import { AdminPage, DEFAULT_SORT, FilterBar, Section, SortRange, applySort, matches, rangePhrase, showing, type SortValue } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';

export default function Consent() {
  const policies = usePolicies((s) => s.policies);
  const revocations = useAdminStore((s) => s.consentRevocations);
  const clients = useAdminStore((s) => s.clients);
  const openClient = useAdminNav((s) => s.openClient);
  const openDrawer = useAdminNav((s) => s.openDrawer);

  const policyCols: Column<Policy>[] = [
    { key: 'name', header: 'Policy', grow: true, primary: true, render: (p) => p.name },
    { key: 'version', header: 'Live version', render: (p) => liveVersion(p).version },
    { key: 'published', muted: true, header: 'Published', render: (p) => formatDate(liveVersion(p).publishedAt) },
    { key: 'accepted', header: 'Accepted', align: 'end', render: (p) => p.accepted.toLocaleString('en-US') },
    { key: 'notYet', header: 'Not yet', align: 'end', render: (p) => p.notYet.toLocaleString('en-US') },
    { key: 'draft', muted: true, header: 'Draft', render: (p) => (p.draft ? 'Draft ready' : '—') },
  ];
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortValue>(DEFAULT_SORT);
  const nameOf = (id: string) => clients.find((c) => c.id === id)?.name ?? 'Deleted account';
  const revoked = applySort(revocations.filter((r) => matches(query, nameOf(r.clientId), clients.find((c) => c.id === r.clientId)?.email ?? '')), sort, (r) => r.at);
  const revokedSummary = showing(revoked.length, ['withdrawal', 'withdrawals'], [rangePhrase(sort, 'from'), query.trim() && `matching \u201c${query.trim()}\u201d`]);

  const revokeCols: Column<ConsentRevocation>[] = [
    { key: 'client', header: 'Client', grow: true, primary: true, render: (r) => clients.find((c) => c.id === r.clientId)?.name ?? 'Deleted account' },
    { key: 'scope', header: 'Consent withdrawn', render: (r) => r.scope },
    { key: 'at', muted: true, header: 'When', render: (r) => formatDate(r.at) },
  ];

  return (
    <AdminPage
      title="Consent"
      subtitle="Terms of Service, Privacy Policy and Health Consent. Published versions can't be changed; publish a new version instead."
    >
      <Section title="Policies">
        <DataTable paginate={false} label="Policies" columns={policyCols} rows={policies} rowKey={(p) => p.id} onRowClick={(p) => openDrawer({ kind: 'consent', id: p.id })} />
      </Section>
      <Section title={`Withdrawn consent · ${revocations.length} in total`}>
        <FilterBar query={query} onQuery={setQuery} placeholder="Search by first name or email">
          <SortRange value={sort} onChange={setSort} rangeLabel="Withdrawn between" />
        </FilterBar>
        <DataTable
          label="Withdrawn consent"
          columns={revokeCols}
          rows={revoked}
          footer={revokedSummary}
          pager="outside"
          rowKey={(r) => r.id}
          onRowClick={(r) => clients.some((c) => c.id === r.clientId) && openClient(r.clientId)}
          empty="No one has withdrawn consent."
        />
      </Section>
    </AdminPage>
  );
}
