/**
 * @screen  A-9.1 · Consent
 * @flow    A9 Compliance & consent management
 * @states  default · uploading · revocations empty
 * @spec    docs/admin/README.md#a-91-consent
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { formatDate, useAdminStore, type ConsentRevocation, type ConsentVersion } from '@shared/admin';
import { Button, DataTable, StatusText, type Column } from '@admin/ui';
import { AdminPage, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { UploadDialog } from './parts/UploadDialog';

export default function Consent() {
  const versions = useAdminStore((s) => s.consentVersions);
  const revocations = useAdminStore((s) => s.consentRevocations);
  const clients = useAdminStore((s) => s.clients);
  const push = useAdminNav((s) => s.push);
  const [uploading, setUploading] = useState(false);
  const current = [...versions].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))[0]?.id;

  const versionCols: Column<ConsentVersion>[] = [
    {
      key: 'name',
      header: 'Version name',
      grow: true,
      primary: true,
      sort: (v) => v.name,
      render: (v) => (v.id === current ? <span>{v.name} <StatusText tone="success">Current</StatusText></span> : v.name),
    },
    { key: 'at', header: 'Uploaded at', sort: (v) => v.uploadedAt, render: (v) => formatDate(v.uploadedAt) },
    { key: 'by', header: 'Uploaded by', sort: (v) => v.uploadedBy, render: (v) => v.uploadedBy },
  ];
  const revokeCols: Column<ConsentRevocation>[] = [
    { key: 'client', header: 'Client', grow: true, primary: true, render: (r) => clients.find((c) => c.id === r.clientId)?.name ?? 'Deleted account' },
    { key: 'scope', header: 'Consent withdrawn', render: (r) => r.scope },
    { key: 'at', header: 'When', sort: (r) => r.at, render: (r) => formatDate(r.at) },
  ];

  return (
    <AdminPage
      title="Consent"
      subtitle="Clients agree to the current version. Uploading a new version asks them to agree again."
      action={<Button leadingIcon="upload" onClick={() => setUploading(true)}>Upload version</Button>}
    >
      <Section title="Versions">
        <DataTable label="Consent versions" columns={versionCols} rows={versions} rowKey={(v) => v.id} initialSort={{ key: 'at', dir: 'desc' }} />
      </Section>
      <Section title="Withdrawn consent">
        <DataTable
          label="Withdrawn consent"
          columns={revokeCols}
          rows={revocations}
          rowKey={(r) => r.id}
          initialSort={{ key: 'at', dir: 'desc' }}
          onRowClick={(r) => clients.some((c) => c.id === r.clientId) && push({ id: 'client', clientId: r.clientId })}
          empty="No one has withdrawn consent."
        />
      </Section>
      {uploading && <UploadDialog onClose={() => setUploading(false)} />}
    </AdminPage>
  );
}
