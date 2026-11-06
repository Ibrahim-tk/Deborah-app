/**
 * @screen  A-3.2 · Client detail (side drawer)
 * @flow    A3 Client management
 * @states  tabs: overview · health profile · family · escalation history · change email · deactivate (reason) · reactivate · deactivated · emailing · reminder sent · confirm deactivate
 * @spec    docs/admin/README.md#a-32-client-detail
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { SIMPLE_CLIENT_STATUS_LABEL, clientStatus, simpleClientStatus, useAdminStore } from '@shared/admin';
import { Drawer, StatusText, Tabs } from '@admin/ui';
import { CLIENT_SIMPLE_TONE } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useViewLog } from '@admin/hooks/useViewLog';
import { ClientTables } from './parts/ClientTables';
import { Dependents } from './parts/Dependents';
import { CopyEmail } from '@admin/screens/common/CopyEmail';
import { HealthProfile } from './parts/HealthProfile';
import { Overview } from './parts/Overview';
import { ClientActions } from '../ClientActions';

type Tab = 'overview' | 'health' | 'family' | 'activity';

export default function ClientDrawer({ clientId }: { clientId: string }) {
  const client = useAdminStore((s) => s.clients.find((c) => c.id === clientId));
  const deletions = useAdminStore((st) => st.deletionRequests);
  const close = useAdminNav((s) => s.closeDrawer);
  const [tab, setTab] = useState<Tab>('overview');

  useViewLog(client?.id, `Viewed client ${client?.name ?? ''}`);

  if (!client) return null;
  const simple = simpleClientStatus(clientStatus(client, deletions));
  return (
    <Drawer
      title={client.name}
      subtitle={<CopyEmail email={client.email} />}
      size="wide"
      onClose={close}
      // Header carries the account state only; the subscription state sits with the plan below, so the two
      // statuses never read as a duplicate pair.
      // Same simple status as the Clients list, so the two never disagree.
      meta={<StatusText tone={CLIENT_SIMPLE_TONE[simple]}>{SIMPLE_CLIENT_STATUS_LABEL[simple]}</StatusText>}
      headerControls={<ClientActions client={client} />}
    >
      <Tabs<Tab>
        label="Client details"
        value={tab}
        onChange={setTab}
        tabs={[
          {
            value: 'overview',
            label: 'Overview',
            content: <Overview client={client} />,
          },
          { value: 'health', label: 'Health profile', content: <HealthProfile client={client} /> },
          { value: 'family', label: 'Dependents', content: <Dependents client={client} /> },
          { value: 'activity', label: 'Escalation history', content: <ClientTables client={client} /> },
        ]}
      />

    </Drawer>
  );
}
