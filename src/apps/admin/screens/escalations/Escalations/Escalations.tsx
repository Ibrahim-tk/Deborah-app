/**
 * @screen  A-4.1 · Escalations
 * @flow    A4 Escalation management (story 4.1)
 * @states  default · filtered by level / status / profile · no results
 * @spec    docs/admin/stories.md#41---manage-escalations
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { formatDate, useAdminStore, type Escalation, type EscalationStatus, type EscalationType } from '@shared/admin';
import { DataTable, Select, type Column } from '@admin/ui';
import { AdminPage, EscalationStatusText, EscalationTypeText, FilterBar, matches } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';

type TypeFilter = 'all' | EscalationType;
type Order = 'latest' | 'oldest';
const ORDER_OPTIONS: { value: Order; label: string }[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
];
type StatusFilter = EscalationStatus | 'all';
type ProfileFilter = 'all' | Escalation['profile']['kind'];
const PROFILE: Record<Escalation['profile']['kind'], string> = { client: 'Client', family: 'Family member', teen: 'Teen' };

export default function Escalations() {
  const escalations = useAdminStore((s) => s.escalations);
  const clients = useAdminStore((s) => s.clients);
  const openEscalation = useAdminNav((s) => s.openEscalation);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [profile, setProfile] = useState<ProfileFilter>('all');
  const [order, setOrder] = useState<Order>('latest');

  const nameOf = (id: string) => clients.find((c) => c.id === id)?.name ?? 'Unknown client';
  const emailOf = (id: string) => clients.find((c) => c.id === id)?.email ?? '';
  const rows = escalations.filter(
    (e) =>
      matches(query, nameOf(e.clientId), emailOf(e.clientId), e.reason) &&
      (type === 'all' || e.type === type) &&
      (status === 'all' || e.status === status) &&
      (profile === 'all' || e.profile.kind === profile),
  ).sort((a, b) => {
    // Not yet reviewed always comes first; the sort dropdown orders by date within each group.
    if (a.status !== b.status) return a.status === 'not_reviewed' ? -1 : 1;
    return order === 'latest' ? b.opened.localeCompare(a.opened) : a.opened.localeCompare(b.opened);
  });

  const columns: Column<Escalation>[] = [
    { key: 'client', header: 'Client', primary: true, render: (e) => nameOf(e.clientId) },
    { key: 'profile', muted: true, header: 'Profile', render: (e) => (e.profile.kind === 'family' ? `${e.profile.name} (family)` : PROFILE[e.profile.kind]) },
    { key: 'reason', header: 'Reason', grow: true, render: (e) => e.reason },
    { key: 'type', header: 'Level', render: (e) => <EscalationTypeText type={e.type} /> },
    { key: 'device', muted: true, header: 'Device', render: (e) => e.device },
    { key: 'status', header: 'Status', render: (e) => <EscalationStatusText status={e.status} /> },
    { key: 'opened', muted: true, header: 'Date', render: (e) => formatDate(e.opened) },
  ];

  return (
    <AdminPage
      title="Escalations"
      subtitle="Emergencies, crises and urgent concerns the Oracle recorded, for review only."
      toolbar={
        <FilterBar query={query} onQuery={setQuery} placeholder="Search by first name or email">
          <Select<TypeFilter>
            label="Level"
            hideLabel
            value={type}
            onChange={setType}
            options={[{ value: 'all', label: 'All levels' }, { value: 'emergency', label: 'Emergency' }, { value: 'crisis', label: 'Crisis' }, { value: 'urgent', label: 'Urgent' }]}
          />
          <Select<StatusFilter>
            label="Status"
            hideLabel
            value={status}
            onChange={setStatus}
            options={[{ value: 'all', label: 'All statuses' }, { value: 'not_reviewed', label: 'Not yet reviewed' }, { value: 'reviewed', label: 'Reviewed' }]}
          />
          <Select<ProfileFilter>
            label="Profile"
            hideLabel
            value={profile}
            onChange={setProfile}
            options={[{ value: 'all', label: 'All profiles' }, { value: 'client', label: 'Client' }, { value: 'family', label: 'Family member' }, { value: 'teen', label: 'Teen' }]}
          />
          <Select<Order>
            label="Sort"
            hideLabel
            value={order}
            onChange={setOrder}
            options={ORDER_OPTIONS}
          />
        </FilterBar>
      }
    >
      <DataTable
        label="Escalation queue"
        columns={columns}
        rows={rows}
        rowKey={(e) => e.id}
        footer={`Showing ${rows.length} of ${escalations.length} cases`}
        onRowClick={(e) => openEscalation(e.id)}
        empty={escalations.length === 0 ? 'There are no escalations to review.' : 'No escalations match these filters.'}
      />
    </AdminPage>
  );
}
