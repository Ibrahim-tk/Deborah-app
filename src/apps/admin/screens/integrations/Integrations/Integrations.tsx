/**
 * @screen  A-10.1 · Integrations
 * @flow    A10 Integrations (super admin only)
 * @states  some connected · none connected · all connected · connecting
 * @spec    docs/admin/README.md#a-101-integrations
 * @xref    web: none (admin only)
 */
import { useAdminStore } from '@shared/admin';
import { AdminPage, Section } from '@admin/patterns';
import { StripeCard } from './parts/StripeCard';
import { ServiceCard, type Service } from './parts/ServiceCard';
import { AvailableGrid, type AvailableItem } from './parts/AvailableGrid';
import styles from './Integrations.module.css';

const STRIPE: AvailableItem = { id: 'stripe', name: 'Stripe', brand: '#635bff', blurb: 'Receive payments for plans and subscriptions.' };

const toAvailable = (s: Service): AvailableItem => ({ id: s.id, name: s.name, brand: s.brand, blurb: s.description, account: s.account });

const SERVICES: Service[] = [
  {
    id: 'dropbox',
    name: 'Dropbox',
    brand: '#0061fe',
    description: 'Import intake forms, lab results and records that clients share from Dropbox.',
    account: 'records@oracleclinician.com',
    features: [],
  },
  {
    id: 'shopify',
    name: 'Shopify',
    brand: '#5e8e3e',
    description: "Show products from Deborah's shop in recommendations and the in-app store.",
    account: 'genesis-gold.myshopify.com',
    features: [],
  },
  {
    id: 'googleDocs',
    name: 'Google Docs',
    brand: '#1a73e8',
    description: 'Keep visit notes and healing plans in a live Google Doc the team can edit.',
    account: 'team@oracleclinician.com',
    features: [],
  },
];

export default function Integrations() {
  const stripeOn = useAdminStore((s) => s.stripe.status === 'connected');
  const conns = useAdminStore((s) => s.integrations);
  const connected = SERVICES.filter((s) => conns[s.id].connected);
  const available = [...(stripeOn ? [] : [STRIPE]), ...SERVICES.filter((s) => !conns[s.id].connected).map(toAvailable)];
  const anyConnected = stripeOn || connected.length > 0;

  return (
    <AdminPage title="Integrations" subtitle="Connect the services the console works with. Only super admins can change these.">
      {/* Connected only appears once something is connected. */}
      {anyConnected && (
        <Section title="Connected">
          <div className={styles.stack}>
            <StripeCard />
            {connected.map((svc) => <ServiceCard key={svc.id} service={svc} />)}
          </div>
        </Section>
      )}
      {available.length > 0 && (
        <Section title="Available">
          <AvailableGrid items={available} />
        </Section>
      )}
    </AdminPage>
  );
}
