/**
 * @screen  A-9.1 · Consent
 * @flow    A9 Consent management (story 9.1)
 * @states  default · draft exists · revocations empty
 * @spec    docs/admin/stories.md#91---view--edit-policy-versions
 * @xref    web: none (admin only)
 */
import { formatDate, liveVersion, useAdminStore, usePolicies, type ConsentRevocation, type Policy } from '@shared/admin';
import { DataTable, type Column } from '@admin/ui';
import { AdminPage, Section } from '@admin/patterns';
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
      <Section title="Withdrawn consent">
        <DataTable
          label="Withdrawn consent"
          columns={revokeCols}
          rows={revocations}
          rowKey={(r) => r.id}
          onRowClick={(r) => clients.some((c) => c.id === r.clientId) && openClient(r.clientId)}
          empty="No one has withdrawn consent."
        />
      </Section>
    </AdminPage>
  );
}
