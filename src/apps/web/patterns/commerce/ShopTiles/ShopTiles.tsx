/**
 * @pattern ShopTiles — horizontal row of wide product cards (product art in a rounded panel left,
 *          name + tagline right, round shop button bottom-right); each tile opens the in-app shop
 *          browser (M-2.7) for that product.
 * @usedBy  M-2.0 (Recommended for you), M-2.1 (under an answer)
 * @spec    design direction 2026-10-08 · docs/ux/F02-consultation.md#m-27--shop-in-app-browser
 * @xref    web: apps/web/patterns/commerce/ShopTiles — not built
 */
import type { Product } from '@shared/types/content';
import { Icon } from '@web/ui';
import styles from './ShopTiles.module.css';

export interface ShopTilesProps {
  products: Product[];
  title?: string;
  onShop: (productId: string) => void;
}

export function ShopTiles({ products, title = 'Recommended for you', onShop }: ShopTilesProps) {
  if (products.length === 0) return null;
  return (
    <section className={styles.root} aria-label={title} data-placeholder>
      <h3 className={styles.title}>{title}</h3>
      <ul className={styles.row}>
        {products.map((p) => (
          <li key={p.id}>
            <button type="button" className={styles.tile} onClick={() => onShop(p.id)} aria-label={`Shop ${p.name}: ${p.tagline}`}>
              {/* Image left, copy right, round shop button bottom-right (design 2026-10-26). */}
              <span className={styles.art} aria-hidden>
                <img src={p.image} alt="" />
              </span>
              <span className={styles.copy}>
                <span className={styles.name}>{p.name}</span>
                <span className={styles.tagline}>{p.tagline}</span>
                <span className={styles.go} aria-hidden>
                  <Icon name="external" size={18} />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
