/**
 * @pattern ProductDisclosure — the single disclosure box at the very end of a product recommendation,
 *          below the product icons: the FTC ownership statement and the affiliate statement.
 * @usedBy  M-2.1, M-2.1b (after ShopTiles / ProductCard)
 * @spec    Oct 27 session — "a separate disclosure box at the very end … instead of disclaimers in the middle of text"
 * @xref    mirrored in the other app at patterns/commerce/ProductDisclosure
 */
import { AFFILIATE_STATEMENT, FTC_OWNERSHIP_STATEMENT } from '@shared/copy/disclosures';
import styles from './ProductDisclosure.module.css';

export function ProductDisclosure() {
  return (
    <aside className={styles.root} aria-label="Product disclosures">
      <p className={styles.text}>{FTC_OWNERSHIP_STATEMENT}</p>
      <p className={styles.text} data-placeholder>{AFFILIATE_STATEMENT}</p>
    </aside>
  );
}
