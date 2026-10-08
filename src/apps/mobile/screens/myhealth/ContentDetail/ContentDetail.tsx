/**
 * @screen  M-7.4 · For-you content detail
 * @flow    F07 My Health hub
 * @states  video (poster · playing placeholder) · article / lesson (text column) · with / without reason · with / without related product · not found
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280
 * @spec    docs/ux/F07-my-health-hub.md#m-74--for-you-content-detail
 * @xref    web: W-7.4 (apps/web/screens/myhealth/ContentDetail) — not built
 */
import { findLibraryItem, findProduct } from '@shared/data';
import { formatShortDate } from '@shared/utils';
import { Button, Header, IconButton, ListRow } from '@mobile/ui';
import { EmptyState } from '@mobile/patterns/health';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useRoute, useScreenParams } from '@mobile/navigation';
import { useForYou } from '@mobile/hooks/useForYou';
import { MediaBlock } from './parts/MediaBlock';
import styles from './ContentDetail.module.css';

export default function ContentDetail() {
  const { pop, open, openAsk } = useNav();
  const { previousTitle } = useRoute();
  const { itemId } = useScreenParams<{ itemId: string }>();
  const toast = useToast();
  const item = findLibraryItem(itemId);
  const reason = useForYou().find((f) => f.item.id === itemId)?.reason;
  const product = findProduct(item?.relatedProductId);

  const header = (
    <Header
      title="For you"
      onBack={pop}
      backLabel={previousTitle}
      right={item && <IconButton icon="share" label="Share" onClick={() => toast('Copied link (demo)')} />}
    />
  );

  if (!item) {
    return (
      <div className={styles.root} data-xref="M-7.4 · For-you content detail">
        {header}
        <div className={styles.body}>
          <EmptyState icon="book" text="This item isn’t in Deborah’s library any more." actionLabel="Back" onAction={pop} />
        </div>
      </div>
    );
  }

  const video = item.type === 'video';
  const verb = video ? 'watched' : 'read';
  // "Because you asked about sleep" → "you asked about sleep".
  const why = reason?.replace(/^Because\s+/i, '');

  return (
    <div className={styles.root} data-xref="M-7.4 · For-you content detail">
      {header}
      <div className={styles.scroll}>
        <article className={styles.body} data-placeholder={item.status === 'placeholder' || undefined} data-status={item.status}>
          {video && <MediaBlock item={item} />}
          {why && <p className={styles.reason}>Why you’re seeing this: {why}</p>}
          <div className={styles.titles}>
            <h2 className={styles.title}>{item.title}</h2>
            <p className={styles.meta}>
              {formatShortDate(item.publishedAt)} · {item.durationMin} {item.type === 'article' ? 'min read' : 'min'}
            </p>
          </div>
          <p className={styles.summary}>{item.summary}</p>
          {/* ASSUMPTION: spec puts the media block first; for articles / lessons the text column
              reads after the title and summary so the page doesn't open mid-text. */}
          {!video && <MediaBlock item={item} />}
          <Button fullWidth leadingIcon="deborah" onClick={() => openAsk({ prefill: `I ${verb} '${item.title}' — ` })}>
            Ask Deborah about this
          </Button>
          {product && (
            <div className={styles.group} data-placeholder={product.status === 'placeholder' || undefined}>
              <ListRow
                leading={<img src={product.image} alt="" className={styles.productImage} />}
                title={product.name}
                subtitle={product.tagline}
                onPress={() => open('M-2.7', { productId: product.id })}
              />
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
