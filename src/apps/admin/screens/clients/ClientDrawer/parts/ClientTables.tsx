/** Documents and escalation history for one client (A-3.2 drawer). */
import { useMemo } from 'react';
import { formatDate, useAdminStore, type Client, type ClientDocument, type Escalation } from '@shared/admin';
import { DataTable, type Column } from '@admin/ui';
import { EscalationStatusText, EscalationTypeText, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';

const DOC_KIND: Record<ClientDocument['kind'], string> = {
  provider_summary: 'Provider summary',
  visit_note: 'Visit note',
  lab: 'Lab result',
  other: 'Other',
};

export function ClientTables({ client }: { client: Client }) {
  const openEscalation = useAdminNav((s) => s.openEscalation);
  // Select the stable store array, filter outside the selector: a selector that returns a fresh array
  // every time makes the store think it changed and re-render forever.
  const escalations = useAdminStore((s) => s.escalations);
  const history = useMemo(() => escalations.filter((e) => e.clientId === client.id), [escalations, client.id]);

  const docCols: Column<ClientDocument>[] = [
    { key: 'title', header: 'Document', grow: true, primary: true, sort: (d) => d.title, render: (d) => d.title },
    { key: 'kind', muted: true, header: 'Type', sort: (d) => d.kind, render: (d) => DOC_KIND[d.kind] },
    { key: 'date', muted: true, header: 'Added', sort: (d) => d.date, render: (d) => formatDate(d.date) },
  ];
  const escCols: Column<Escalation>[] = [
    { key: 'reason', header: 'Reason', grow: true, primary: true, render: (e) => e.reason },
    { key: 'type', header: 'Type', render: (e) => <EscalationTypeText type={e.type} /> },
    { key: 'status', header: 'Status', render: (e) => <EscalationStatusText status={e.status} /> },
    { key: 'opened', muted: true, header: 'Opened', sort: (e) => e.opened, render: (e) => formatDate(e.opened) },
  ];

  return (
    <>
      <Section title="Documents">
        <DataTable variant="plain" label="Documents" columns={docCols} rows={client.documents} rowKey={(d) => d.id} initialSort={{ key: 'date', dir: 'desc' }} empty="No documents uploaded yet." />
      </Section>
      <Section title="Escalation history">
        <DataTable
          variant="plain"
          label="Escalation history"
          columns={escCols}
          rows={history}
          rowKey={(e) => e.id}
          initialSort={{ key: 'opened', dir: 'desc' }}
          onRowClick={(e) => openEscalation(e.id)}
          empty="No escalations for this client."
        />
      </Section>
    </>
  );
}
