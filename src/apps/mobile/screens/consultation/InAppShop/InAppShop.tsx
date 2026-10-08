/**
 * @screen  M-2.7 · Shop (in-app browser)
 * @flow    F02 Core consultation
 * @states  default · added to cart
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=48-361
 * @spec    docs/ux/F02-consultation.md#m-27--shop-in-app-browser
 * @xref    web: W-2.7 (apps/web/screens/consultation/InAppShop) — not built
 *
 * The real URL is shown but never loaded: the page is a static mock built from products.json.
 */
import { findProduct, productList } from '@shared/data';
import { Button, Icon, IconButton } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useScreenParams } from '@mobile/navigation';
import { MockPage } from './MockPage';
import styles from './InAppShop.module.css';

export default function InAppShop() {
  const { dismissModal } = useNav();
  const toast = useToast();
  const {
    productId,
    url: linkUrl,
    title,
  } = useScreenParams<{ productId: string; url: string; title: string }>();
  const product = findProduct(productId) ?? productList[0];
  // Non-product links (e.g. the medication card's interaction checker) show a generic mock.
  const url = new URL(linkUrl ?? product.url);

  return (
    <div className={styles.root} data-xref="M-2.7 · Shop">
      <header className={styles.chrome}>
        <Button variant="ghost" size="md" onClick={dismissModal}>
          Done
        </Button>
        <span className={styles.url} title={product.url}>
          <Icon name="lock" size={16} />
          <span className={styles.host}>{url.host.replace(/^www\./, '')}</span>
          <span className={styles.query}>{url.search}</span>
        </span>
        <IconButton icon="share" label="Share link" onClick={() => toast('Link copied (demo)')} />
      </header>

      {linkUrl ? (
        <MockPage title={title ?? url.host} host={url.host} />
      ) : (
        <main
          className={styles.page}
          data-placeholder={product.status === 'placeholder' || undefined}
        >
          <img src={product.image} alt="" className={styles.hero} />
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.tagline}>{product.tagline}</p>
          <p className={styles.price}>{product.price}</p>
          <p className={styles.description}>{product.description}</p>
          <div className={styles.actions}>
            <Button fullWidth onClick={() => toast('Added to cart (demo)')}>
              Add to cart
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => toast('Checkout happens on genesisgold.com')}
            >
              Checkout
            </Button>
          </div>
        </main>
      )}

      <footer className={styles.toolbar}>
        <IconButton icon="back" label="Back" disabled />
        <IconButton icon="chevron" label="Forward" disabled />
        <IconButton icon="refresh" label="Refresh" onClick={() => toast('Refreshed (demo)')} />
      </footer>
    </div>
  );
}
