/** @pattern IntegrationCard — a connected service: mark, name and one-line description, status pill,
 *  optional details below, actions at the trailing edge. */
import type { CSSProperties, ReactNode } from 'react';
import styles from './IntegrationCard.module.css';

export interface IntegrationCardProps {
  /** Logo or short wordmark shown in the logo tile. */
  mark: ReactNode;
  /** Brand fill for the tile (e.g. Stripe's purple). */
  markColor?: string;
  name: string;
  description: string;
  status?: ReactNode;
  actions?: ReactNode;
  /** Shown in the body when there are no details yet (not connected). */
  features?: string[];
  children?: ReactNode;
}

export function IntegrationCard({ mark, markColor, name, description, status, actions, features, children }: IntegrationCardProps) {
  const body = children ?? (features?.length ? (
    <>
      <p className={styles.featuresTitle}>What it does</p>
      <ul className={styles.features}>{features.map((f) => <li key={f}>{f}</li>)}</ul>
    </>
  ) : null);
  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <span className={styles.mark} data-brand={markColor ? '' : undefined} style={markColor ? ({ '--mark': markColor } as CSSProperties) : undefined} aria-hidden>{mark}</span>
        <div className={styles.titles}>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{name}</h3>
            {status}
          </div>
          <p className={styles.description}>{description}</p>
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {body && <div className={styles.body}>{body}</div>}
    </div>
  );
}
