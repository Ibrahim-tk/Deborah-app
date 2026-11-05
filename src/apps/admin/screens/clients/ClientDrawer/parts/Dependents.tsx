/** Dependent profiles inside the client drawer: one plain table row each (name, relationship, age). */
import type { Client, Dependent } from '@shared/admin';
import { DataTable, type Column } from '@admin/ui';
import { Section } from '@admin/patterns';

const columns = (rows: Dependent[]): Column<Dependent>[] => [
  { key: 'n', muted: true, header: '#', render: (d) => rows.indexOf(d) + 1 },
  { key: 'name', header: 'Name', primary: true, render: (d) => d.name },
  { key: 'relationship', header: 'Relationship', grow: true, render: (d) => d.relationship },
  { key: 'age', header: 'Age', align: 'end', render: (d) => d.age },
];

export function Dependents({ client }: { client: Client }) {
  return (
    <Section title="Dependents">
      <DataTable variant="plain" label="Dependents" columns={columns(client.dependents)} rows={client.dependents} rowKey={(d) => d.id} empty="No dependent profiles on this account." />
    </Section>
  );
}
