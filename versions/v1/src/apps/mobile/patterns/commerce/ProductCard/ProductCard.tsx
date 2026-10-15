/**
 * @pattern ProductCard — compact: big image, name, one line of why (2 lines max), Shop; personal note in small text under the card
 * @usedBy  M-2.1 (answer §6), M-9.2
 * @spec    docs/ux/F02-consultation.md#answer-sections · DESIGN.md › Answer sections
 * @xref    web: apps/web/patterns/commerce/ProductCard — not built
 */
import type { Product } from '@flow-v1/shared/types/content';
import type { ProductRef } from '@flow-v1/shared/types/domain';
import { Button } from '@flow-v1/apps/mobile/ui';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  product: Product;
  productRef: ProductRef;
  onShop: () => void;
}

export function ProductCard({ product, productRef, onShop }: ProductCardProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.root} data-placeholder={product.status === 'placeholder' || undefined}>
        {/* Compact (design direction 2026-10-14): a big product visual beside the name, one short line and Shop. */}
        <div className={styles.media}><img src={product.image} alt="" className={styles.image} /></div>
        <div className={styles.info}>
          <p className={styles.name}>{product.name}</p>
          <p className={styles.why}>{productRef.why}</p>
          <Button variant="secondary" size="sm" leadingIcon="shop" className={styles.shop} onClick={onShop}>
            Shop
          </Button>
        </div>
      </div>
      {/* The personal note sits under the card in small text, always in full: it can carry medication safety advice. */}
      {productRef.frame90 && <p className={styles.frame}>{productRef.frame90}</p>}
    </div>
  );
}
