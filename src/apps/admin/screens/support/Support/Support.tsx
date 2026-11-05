/**
 * @screen  A-5.1 · Support requests
 * @flow    A5 Support request management
 * @states  requests tab · data deletion tab · filtered · no results
 * @spec    docs/admin/README.md#a-51-support-requests
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { Button, Select } from '@admin/ui';
import { AdminPage, FilterBar, SUPPORT_TYPE } from '@admin/patterns';
import { RequestsTable, type Show, type TypeFilter } from './parts/RequestsTable';
import { ORDER_OPTIONS, type Order } from './parts/order';
import { DeletionTable } from './parts/DeletionTable';
import { CreateDeletionDialog } from './parts/CreateDeletionDialog';

type Tab = 'requests' | 'deletion';

export default function Support() {
  const [tab, setTab] = useState<Tab>('requests');
  const [query, setQuery] = useState('');
  const [show, setShow] = useState<Show>('open');
  const [type, setType] = useState<TypeFilter>('all');
  // Story 5.1: open requests first, oldest first.
  const [order, setOrder] = useState<Order>('oldest');
  const [creating, setCreating] = useState(false);
  return (
    <AdminPage
      title="Support requests"
      subtitle="Replies go out by email. Mark a request resolved once it's answered."
      action={tab === 'deletion' && <Button leadingIcon="plus" onClick={() => setCreating(true)}>Create deletion request</Button>}
      toolbar={
        <FilterBar query={query} onQuery={setQuery} placeholder="Search by first name or email">
          <Select<Tab>
            label="Request type"
            hideLabel
            value={tab}
            onChange={setTab}
            options={[{ value: 'requests', label: 'Support requests' }, { value: 'deletion', label: 'Data deletion requests' }]}
          />
          {tab === 'requests' && (
            <Select<TypeFilter>
              label="Type"
              hideLabel
              value={type}
              onChange={setType}
              options={[{ value: 'all', label: 'All types' }, ...(Object.keys(SUPPORT_TYPE) as (keyof typeof SUPPORT_TYPE)[]).map((t) => ({ value: t, label: SUPPORT_TYPE[t] }))]}
            />
          )}
          {tab === 'requests' && (
            <Select<Show>
              label="Show"
              hideLabel
              value={show}
              onChange={setShow}
              options={[{ value: 'open', label: 'Open requests' }, { value: 'resolved', label: 'Resolved' }, { value: 'all', label: 'All requests' }]}
            />
          )}
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
      {tab === 'requests' ? <RequestsTable query={query} show={show} type={type} order={order} /> : <DeletionTable query={query} order={order} />}
      {creating && <CreateDeletionDialog onClose={() => setCreating(false)} />}
    </AdminPage>
  );
}
