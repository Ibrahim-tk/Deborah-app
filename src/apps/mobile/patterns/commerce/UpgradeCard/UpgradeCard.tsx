/**
 * @pattern UpgradeCard — compact "Choose a plan" card for the side menu while on the free trial (designer,
 *          2026-10-29). Same look as the Settings plan card and the intake card: white, hairline, Home radius,
 *          light lilac circle with a deep purple glyph, chevron.
 * @usedBy  navigation/Sidebar
 * @xref    web: apps/web/patterns/commerce/UpgradeCard
 */
import { Icon } from '@mobile/ui';
import styles from './UpgradeCard.module.css';

export function UpgradeCard({ onPress }: { onPress: () => void }) {
  return (
    <button type="button" className={styles.root} onClick={onPress}>
      {/* Tile (designer, 2026-10-29): icon and chevron on top, words below. */}
      <span className={styles.top}>
        <span className={styles.mark} aria-hidden><Icon name="shop" size={16} /></span>
        <span className={styles.chevron} aria-hidden><Icon name="chevron" size={16} /></span>
      </span>
      <span className={styles.copy}>
        <span className={styles.title}>Choose a plan</span>
        <span className={styles.body}>Unlimited conversations, Your Wellness Plan and provider notes.</span>
      </span>
    </button>
  );
}
