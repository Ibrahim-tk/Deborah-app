/**
 * @pattern ProductCard — image, name, why it fits, 90-day line, Shop
 * @usedBy  M-2.1 (answer §6), M-9.2
 * @spec    docs/ux/F02-consultation.md#answer-sections · DESIGN.md › Answer sections
 * @xref    web: apps/web/patterns/commerce/ProductCard — not built
 */
import type { Product } from '@shared/types/content';
import type { ProductRef } from '@shared/types/domain';
import { Button } from '@mobile/ui';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  product: Product;
  productRef: ProductRef;
  onShop: () => void;
}

export function ProductCard({ product, productRef, onShop }: ProductCardProps) {
  return (
    <div className={styles.root} data-placeholder={product.status === 'placeholder' || undefined}>
      <div className={styles.top}>
        <img src={product.image} alt="" className={styles.image} />
        <div className={styles.titles}>
          <p className={styles.name}>{product.name}</p>
        </div>
      </div>
      <p className={styles.why}>{productRef.why}</p>
      <p className={styles.frame}>{productRef.frame90}</p>
      <Button variant="secondary" fullWidth leadingIcon="shop" onClick={onShop}>
        Shop on Genesis Gold
      </Button>
    </div>
  );
}
