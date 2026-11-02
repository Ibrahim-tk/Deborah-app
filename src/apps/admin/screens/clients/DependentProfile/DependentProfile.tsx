/**
 * @screen  A-3.3 · Dependent profile
 * @flow    A3 Client management
 * @states  default (read only)
 * @spec    docs/admin/README.md#a-33-dependent-profile
 * @xref    web: none (admin only)
 */
import { useAdminStore } from '@shared/admin';
import { KeyValueList } from '@admin/ui';
import { AdminPage, Section } from '@admin/patterns';

export default function DependentProfile({ clientId, dependentId }: { clientId: string; dependentId: string }) {
  const client = useAdminStore((s) => s.clients.find((c) => c.id === clientId));
  const dep = client?.dependents.find((d) => d.id === dependentId);
  if (!client || !dep) return <AdminPage title="Profile not found">This dependent profile may have been removed.</AdminPage>;

  return (
    <AdminPage title={dep.name} subtitle={`${dep.relationship} of ${client.name}`}>
      <Section title="Health profile">
        <KeyValueList
          items={[
            { label: 'Age', value: dep.age },
            { label: 'Relationship', value: dep.relationship },
            { label: 'Main concerns', value: dep.conditions.join(', ') },
            { label: 'Account owner', value: `${client.name} (${client.email})` },
          ]}
        />
      </Section>
    </AdminPage>
  );
}
