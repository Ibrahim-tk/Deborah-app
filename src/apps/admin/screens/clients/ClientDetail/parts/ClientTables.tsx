/** Dependents, documents and escalation history for one client (A-3.2). */
import { formatDate, useAdminStore, type Client, type ClientDocument, type Dependent, type Escalation } from '@shared/admin';
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
  const push = useAdminNav((s) => s.push);
  const history = useAdminStore((s) => s.escalations.filter((e) => e.clientId === client.id));

  const depCols: Column<Dependent>[] = [
    { key: 'name', header: 'Name', grow: true, primary: true, render: (d) => d.name },
    { key: 'rel', header: 'Relationship', render: (d) => d.relationship },
    { key: 'age', header: 'Age', align: 'end', render: (d) => d.age },
  ];
  const docCols: Column<ClientDocument>[] = [
    { key: 'title', header: 'Document', grow: true, primary: true, sort: (d) => d.title, render: (d) => d.title },
    { key: 'kind', header: 'Type', sort: (d) => d.kind, render: (d) => DOC_KIND[d.kind] },
    { key: 'date', header: 'Added', sort: (d) => d.date, render: (d) => formatDate(d.date) },
  ];
  const escCols: Column<Escalation>[] = [
    { key: 'reason', header: 'Reason', grow: true, primary: true, render: (e) => e.reason },
    { key: 'type', header: 'Type', render: (e) => <EscalationTypeText type={e.type} /> },
    { key: 'status', header: 'Status', render: (e) => <EscalationStatusText status={e.status} /> },
    { key: 'opened', header: 'Opened', sort: (e) => e.opened, render: (e) => formatDate(e.opened) },
  ];

  return (
    <>
      <Section title="Dependents">
        <DataTable
          label="Dependents"
          columns={depCols}
          rows={client.dependents}
          rowKey={(d) => d.id}
          onRowClick={(d) => push({ id: 'dependent', clientId: client.id, dependentId: d.id })}
          empty="No dependent profiles on this account."
        />
      </Section>
      <Section title="Documents">
        <DataTable label="Documents" columns={docCols} rows={client.documents} rowKey={(d) => d.id} initialSort={{ key: 'date', dir: 'desc' }} empty="No documents uploaded yet." />
      </Section>
      <Section title="Escalation history">
        <DataTable
          label="Escalation history"
          columns={escCols}
          rows={history}
          rowKey={(e) => e.id}
          initialSort={{ key: 'opened', dir: 'desc' }}
          onRowClick={(e) => push({ id: 'escalation', escalationId: e.id })}
          empty="No escalations for this client."
        />
      </Section>
    </>
  );
}
