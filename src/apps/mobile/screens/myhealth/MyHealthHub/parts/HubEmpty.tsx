/** M-7.1 — first time: empty block, start the first consultation, popular starting points. */
import { Button, ListRow } from '@mobile/ui';
import { ContentCard, EmptyState } from '@mobile/patterns/health';
import { useNav } from '@mobile/navigation';
import { useForYou } from '@mobile/hooks/useForYou';
import styles from './Hub.module.css';

export function HubEmpty() {
  const { openAsk, push } = useNav();
  // With no consultations yet, "For you" is ranked by recency only: the newest items that suit
  // this profile (teen-appropriate for a minor).
  const popular = useForYou().slice(0, 3);

  return (
    <>
      <div className={styles.stack}>
        <EmptyState icon="health" title="Nothing here yet" text="Your health picture builds as you talk with Deborah." />
        <Button fullWidth leadingIcon="deborah" onClick={() => openAsk({ focus: true })}>
          Start my first consultation
        </Button>
      </div>
      {/* F11: documents can be added before the first consultation. */}
      <div className={styles.rowGroup}>
        <ListRow title="Documents and reports" subtitle="Upload labs, imaging and prescriptions" onPress={() => push('M-11.1')} />
      </div>
      <section className={styles.section} aria-labelledby="hub-popular">
        <h2 id="hub-popular" className={styles.heading}>Popular starting points from Deborah</h2>
        <div className={styles.list}>
          {popular.map(({ item }) => (
            <ContentCard key={item.id} item={item} onPress={() => push('M-7.4', { itemId: item.id })} />
          ))}
        </div>
      </section>
    </>
  );
}
