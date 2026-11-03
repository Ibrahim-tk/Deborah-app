/**
 * @screen  A-5.1 · Support requests
 * @flow    A5 Support request management
 * @states  requests tab · data deletion tab · filtered · no results
 * @spec    docs/admin/README.md#a-51-support-requests
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { Segmented, Select } from '@admin/ui';
import { AdminPage, FilterBar } from '@admin/patterns';
import { RequestsTable, type Show } from './parts/RequestsTable';
import { DeletionTable } from './parts/DeletionTable';

type Tab = 'requests' | 'deletion';

export default function Support() {
  const [tab, setTab] = useState<Tab>('requests');
  const [query, setQuery] = useState('');
  const [show, setShow] = useState<Show>('open');
  return (
    <AdminPage
      title="Support requests"
      subtitle="Replies go out by email. Mark a request resolved once it's answered."
      toolbar={
        <FilterBar query={query} onQuery={setQuery} placeholder="Search by client or subject">
          {tab === 'requests' && (
            <Select<Show>
              label="Show"
              hideLabel
              value={show}
              onChange={setShow}
              options={[{ value: 'open', label: 'Open requests' }, { value: 'resolved', label: 'Resolved' }, { value: 'all', label: 'All requests' }]}
            />
          )}
          <Segmented<Tab>
            label="Request type"
            value={tab}
            onChange={setTab}
            options={[{ value: 'requests', label: 'Requests' }, { value: 'deletion', label: 'Data deletion' }]}
          />
        </FilterBar>
      }
    >
      {tab === 'requests' ? <RequestsTable query={query} show={show} /> : <DeletionTable query={query} />}
    </AdminPage>
  );
}
