/**
 * RecommendationCard — Home "Recommended for you" using the Genesis Shop ProductCard.
 */
import type { Product } from '@shared/types/content';
import { ProductCard } from '@web/patterns/commerce';
import field from '../homeField.module.css';
import styles from './RecommendationCard.module.css';

export interface Recommendation {
  product: Product;
  reason: string;
}

export function RecommendationCard({
  items,
  onShop,
  bare = false,
}: {
  items: Recommendation[];
  onShop: (productId: string) => void;
  /** Skip section label (e.g. Home “More for you” pair). */
  bare?: boolean;
}) {
  if (!items.length) return null;
  return (
    <section className={styles.section} aria-labelledby={bare ? undefined : 'home-recs'}>
      {!bare && (
        <h2 id="home-recs" className={field.label}>
          Recommended for you
        </h2>
      )}
      <ul className={styles.list}>
        {items.map(({ product, reason }) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              productRef={{
                productId: product.id,
                why: reason || product.tagline,
                frame90: '',
              }}
              onShop={() => onShop(product.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
