/**
 * Line doodles for empty states (design 2026-10-20): the "who is this for" style — ink outlines, solid
 * hair, one plum accent. Picked from the EmptyState's icon so every list gets one. Decorative.
 */
import type { IconName } from '@mobile/ui';
import styles from './EmptyDoodle.module.css';

type Kind = 'chat' | 'note' | 'labs' | 'file' | 'calendar' | 'search' | 'self';
const KIND: Partial<Record<IconName, Kind>> = { chat: 'chat', note: 'note', book: 'note', labs: 'labs', flask: 'labs', file: 'file', pdf: 'file', calendar: 'calendar', search: 'search', health: 'self' };

const Face = () => (
  <>
    <path className={styles.hair} d="M14 34c-2-11 4-19 13-19s14 7 12 18c-1 5-2 8-3 10l-3-10c-5-1-10-4-13-8-2 4-3 6-4 9l-2 10c-1-3 0-7 0-10Z" />
    <path className={styles.line} d="M18 31c0 8 4 13 9 13s9-5 9-12" />
    <path className={styles.line} d="M23.5 33.5h.1M30.5 33.5h.1M25 38c1.3 1 3 1 4 0" />
    <path className={styles.line} d="M8 70c1-10 8-16 19-16s18 6 19 16" />
  </>
);

const ART: Record<Kind, JSX.Element> = {
  // Woman with a speech bubble: "talk with Oracle".
  chat: (<><Face /><path className={styles.line} d="M44 10h20a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H54l-5 5v-5h-5a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4Z" /><path className={styles.fill} d="M54 15c-1.3-2-4.5-1.2-3.8 1.2.6 1.8 3.8 3.3 3.8 3.3s3.2-1.5 3.8-3.3c.7-2.4-2.5-3.2-3.8-1.2Z" /></>),
  // Clipboard with lines and a heart.
  note: (<><path className={styles.line} d="M20 12h32a3 3 0 0 1 3 3v50a3 3 0 0 1-3 3H20a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3Z" /><path className={styles.hair} d="M28 8h16v8H28z" /><path className={styles.line} d="M25 28h22M25 36h22M25 44h14" /><path className={styles.fill} d="M44 52c-1.5-2.5-5.5-1.5-4.5 1.5.8 2.2 4.5 4 4.5 4s3.7-1.8 4.5-4c1-3-3-4-4.5-1.5Z" /><path className={styles.line} d="M62 14v6M59 17h6" /></>),
  // Flask with bubbles.
  labs: (<><path className={styles.line} d="M29 10h14M31 10v18L16 60a5 5 0 0 0 4.5 7h31a5 5 0 0 0 4.5-7L41 28V10" /><path className={styles.fill} d="M21 52h30l4.5 9.5a3 3 0 0 1-2.7 4.5H19.2a3 3 0 0 1-2.7-4.5Z" /><circle className={styles.line} cx="34" cy="44" r="2" /><circle className={styles.line} cx="40" cy="36" r="1.5" /><path className={styles.line} d="M58 16v6M55 19h6" /></>),
  // Document with a folded corner.
  file: (<><path className={styles.line} d="M18 8h26l12 12v44a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4Z" /><path className={styles.line} d="M44 8v12h12" /><path className={styles.line} d="M22 32h26M22 40h26M22 48h18" /><path className={styles.fill} d="M50 56c-1.5-2.5-5.5-1.5-4.5 1.5.8 2.2 4.5 4 4.5 4s3.7-1.8 4.5-4c1-3-3-4-4.5-1.5Z" /></>),
  // Calendar page with a heart on the day.
  calendar: (<><path className={styles.line} d="M14 16h44a4 4 0 0 1 4 4v42a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4Z" /><path className={styles.hair} d="M10 20a4 4 0 0 1 4-4h44a4 4 0 0 1 4 4v8H10Z" /><path className={styles.line} d="M24 10v10M48 10v10" /><path className={styles.fill} d="M36 42c-2-3-7-2-6 2 1 3 6 5 6 5s5-2 6-5c1-4-4-5-6-2Z" /></>),
  // Magnifier over a leaf.
  search: (<><circle className={styles.line} cx="30" cy="30" r="16" /><path className={styles.line} d="M42 42l16 16" /><path className={styles.fill} d="M24 34c0-8 6-12 13-12 0 8-5 13-13 12Z" /><path className={styles.line} d="M24 34l8-7" /></>),
  // Woman, hand on heart.
  self: (<><Face /><path className={styles.fill} d="M27 62c-2-3-7-2-6 2 1 3 6 5 6 5s5-2 6-5c1-4-4-5-6-2Z" /><path className={styles.line} d="M56 14v6M53 17h6M48 30v4M46 32h4" /></>),
};

export function EmptyDoodle({ icon, size = 88 }: { icon?: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden className={styles.root}>
      {ART[(icon && KIND[icon]) || 'self']}
    </svg>
  );
}
