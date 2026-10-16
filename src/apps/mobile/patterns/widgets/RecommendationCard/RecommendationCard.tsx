/**
 * RecommendationCard rail — personalised product suggestions on Home.
 */
import type { Product } from '@shared/types/content';
import { cx } from '@shared/utils';
import field from '../homeField.module.css';
import styles from './RecommendationCard.module.css';

export interface Recommendation {
  product: Product;
  reason: string;
}

export function RecommendationCard({ items, onShop }: { items: Recommendation[]; onShop: (productId: string) => void }) {
  if (!items.length) return null;
  return (
    <section className={styles.section} aria-labelledby="home-recs">
      <h2 id="home-recs" className={field.label}>Recommended for you</h2>
      <ul className={cx(styles.rail, items.length === 1 && styles.single)}>
        {items.map(({ product, reason }) => (
          <li key={product.id}>
            <button
              type="button"
              className={styles.rec}
              onClick={() => onShop(product.id)}
              data-placeholder={product.status === 'placeholder' || undefined}
            >
              <span className={field.title}>{product.name}</span>
              <span className={field.meta}>{product.tagline}</span>
              <span className={styles.because}>{reason}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
