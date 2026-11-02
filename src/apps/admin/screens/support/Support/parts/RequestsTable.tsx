/** Support requests (handled over email). "Escalate to Deborah" requests sort first. */
import { useState } from 'react';
import { formatDate, useAdminStore, type SupportRequest, type SupportType } from '@shared/admin';
import { Button, DataTable, Select, StatusText, type Column } from '@admin/ui';
import { matches } from '@admin/patterns';
import { useAdminToast } from '@admin/hooks/toast.store';

const TYPE: Record<SupportType, string> = {
  escalate_to_deborah: 'Escalate to Deborah',
  billing: 'Billing',
  account: 'Account',
  technical: 'Technical',
};
type Show = 'open' | 'resolved' | 'all';

export function RequestsTable({ query }: { query: string }) {
  const requests = useAdminStore((s) => s.supportRequests);
  const clients = useAdminStore((s) => s.clients);
  const toast = useAdminToast();
  const [show, setShow] = useState<Show>('open');
  const nameOf = (id: string) => clients.find((c) => c.id === id)?.name ?? 'Unknown client';

  const rows = requests.filter(
    (r) => matches(query, r.subject, nameOf(r.clientId), TYPE[r.type]) && (show === 'all' || r.resolved === (show === 'resolved')),
  );
  const resolve = (r: SupportRequest) => {
    useAdminStore.getState().resolveSupport(r.id);
    toast('Request resolved');
  };

  const columns: Column<SupportRequest>[] = [
    { key: 'subject', header: 'Subject', grow: true, primary: true, sort: (r) => r.subject, render: (r) => r.subject },
    { key: 'client', header: 'Client', sort: (r) => nameOf(r.clientId), render: (r) => nameOf(r.clientId) },
    {
      key: 'type',
      header: 'Type',
      sort: (r) => (r.type === 'escalate_to_deborah' ? '0' : TYPE[r.type]),
      render: (r) => (r.type === 'escalate_to_deborah' ? <StatusText tone="accent">{TYPE[r.type]}</StatusText> : TYPE[r.type]),
    },
    { key: 'received', header: 'Received', sort: (r) => r.received, render: (r) => formatDate(r.received) },
    {
      key: 'action',
      header: 'Status',
      align: 'end',
      render: (r) =>
        r.resolved ? <StatusText tone="success">Resolved</StatusText> : <Button size="sm" variant="secondary" onClick={() => resolve(r)}>Mark resolved</Button>,
    },
  ];

  return (
    <>
      <div>
        <Select<Show>
          label="Show"
          hideLabel
          value={show}
          onChange={setShow}
          options={[{ value: 'open', label: 'Open requests' }, { value: 'resolved', label: 'Resolved' }, { value: 'all', label: 'All requests' }]}
        />
      </div>
      <DataTable
        label="Support requests"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        initialSort={{ key: 'type', dir: 'asc' }}
        empty={show === 'open' ? 'All caught up. New requests arrive from the support inbox.' : 'No requests match.'}
      />
    </>
  );
}
