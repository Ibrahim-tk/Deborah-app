/**
 * RecommendationCard — Home "Recommended for you" using the Genesis Shop ProductCard.
 */
import type { Product } from '@shared/types/content';
import { ProductCard } from '@mobile/patterns/commerce';
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
