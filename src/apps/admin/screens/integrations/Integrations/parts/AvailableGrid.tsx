/** One container of services that aren't connected yet: a column per service (4, then 3, 2, 1 as they connect).
 *  Each tile: brand logo, name, one line, Connect. The provider's sign-in is assumed (simulated). */
import type { CSSProperties } from 'react';
import { useAdminStore, type IntegrationId } from '@shared/admin';
import { Icon } from '@admin/ui';
import { useSim } from '@admin/hooks/useSim';
import styles from './AvailableGrid.module.css';

export interface AvailableItem {
  id: 'stripe' | IntegrationId;
  name: string;
  brand: string;
  blurb: string;
  account?: string;
}

export function AvailableGrid({ items }: { items: AvailableItem[] }) {
  return (
    <div className={styles.grid} style={{ '--cols': items.length } as CSSProperties}>
      {items.map((it) => <Tile key={it.id} item={it} />)}
    </div>
  );
}

function Tile({ item }: { item: AvailableItem }) {
  const canEdit = useAdminStore((s) => s.role === 'super');
  const sim = useSim();
  const connect = () =>
    sim.run(
      () => (item.id === 'stripe' ? useAdminStore.getState().connectStripe() : useAdminStore.getState().setIntegration(item.id, true, item.account)),
      `${item.name} connected`,
      1200,
    );

  return (
    <div className={styles.tile}>
      <span className={styles.mark} style={{ '--mark': item.brand } as CSSProperties} aria-hidden><Icon name={item.id} size={26} /></span>
      <div className={styles.text}>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.blurb}>{item.blurb}</p>
      </div>
      {canEdit && (
        // Each provider's own button: its brand colour, white logo chip, fully rounded.
        <button
          type="button"
          className={styles.brandBtn}
          style={{ '--brand': item.brand } as CSSProperties}
          disabled={sim.busy}
          aria-busy={sim.busy || undefined}
          onClick={connect}
        >
          <span className={styles.brandChip} aria-hidden><Icon name={item.id} size={16} /></span>
          {sim.busy ? 'Connecting…' : `Connect ${item.name}`}
        </button>
      )}
    </div>
  );
}
