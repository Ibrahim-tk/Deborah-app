/** A third-party service card (Dropbox, Shopify, Google Docs): brand logo, what it's for, connect or manage.
 *  Connecting is simulated: the provider's sign-in is assumed and the card flips to connected. */
import { formatDate, useAdminStore, type IntegrationId } from '@shared/admin';
import { Button, Icon, KeyValueList, StatusText } from '@admin/ui';
import { IntegrationCard } from '@admin/patterns';
import { useSim } from '@admin/hooks/useSim';
import s from '@admin/screens/common/drawer/drawer.module.css';

export interface Service {
  id: IntegrationId;
  name: string;
  /** Brand colour for the logo tile (data, not a style token). */
  brand: string;
  description: string;
  account: string;
  features: string[];
}

export function ServiceCard({ service }: { service: Service }) {
  const conn = useAdminStore((st) => st.integrations[service.id]);
  const canEdit = useAdminStore((st) => st.role === 'super');
  const sim = useSim();
  const set = (connect: boolean) =>
    sim.run(() => useAdminStore.getState().setIntegration(service.id, connect, service.account), `${service.name} ${connect ? 'connected' : 'disconnected'}`, connect ? 1200 : 600);

  // Only the connected view lives here; the Connect tile is in the Available grid.
  if (!conn.connected) return null;

  return (
    <IntegrationCard
      mark={<Icon name={service.id} size={26} />}
      markColor={service.brand}
      name={service.name}
      description={service.description}
      features={service.features}
      status={conn.connected ? <StatusText tone="success">Connected</StatusText> : <StatusText>Not connected</StatusText>}
      actions={
        canEdit &&
        (conn.connected ? (
          <Button size="sm" variant="ghost" className={s.danger} loading={sim.busy} onClick={() => set(false)}>Disconnect</Button>
        ) : (
          <Button size="sm" loading={sim.busy} onClick={() => set(true)}>{sim.busy ? 'Connecting…' : `Connect ${service.name}`}</Button>
        ))
      }
    >
      {conn.connected && (
        <KeyValueList
          items={[
            { label: 'Account', value: conn.account ?? '—' },
            { label: 'Connected', value: conn.connectedAt ? formatDate(conn.connectedAt) : '—' },
          ]}
        />
      )}
    </IntegrationCard>
  );
}
