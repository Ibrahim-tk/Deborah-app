/**
 * @pattern ContentCard — Deborah library item as a tonal note card: type + time header over a hairline,
 *          serif title, date + dark round action, and an
 *          optional reason line in plain text ("Because you asked about sleep"; never a chip)
 * @usedBy  M-7.1, M-7.2, M-7.5
 * @spec    docs/ux/F07-my-health-hub.md#m-72--my-health-hub (Layout 6), #m-75--deborahs-library
 * @xref    web: apps/web/patterns/health/ContentCard — not built
 */
import type { LibraryItem } from '@shared/types/content';
import { formatShortDate } from '@shared/utils';
import { Icon, type IconName } from '@mobile/ui';
import styles from './ContentCard.module.css';

export interface ContentCardProps {
  item: LibraryItem;
  reason?: string;
  onPress: () => void;
}

/** Tone follows the content type, so a list reads as a calm rhythm, not a wall of white boxes. */
const CONTENT_TYPE: Record<LibraryItem['type'], { icon: IconName; label: string; unit: string; tone: string }> = {
  video: { icon: 'video', label: 'Video', unit: 'min', tone: 'rose' },
  article: { icon: 'file', label: 'Article', unit: 'min read', tone: 'linen' },
  lesson: { icon: 'book', label: 'Lesson', unit: 'min', tone: 'lilac' },
};

export function ContentCard({ item, reason, onPress }: ContentCardProps) {
  const type = CONTENT_TYPE[item.type];
  return (
    <button type="button" className={`${styles.root} ${styles[type.tone]}`} onClick={onPress}>
      <span className={styles.head}>
        <Icon name={type.icon} size={20} />
        <span>
          {type.label} · {item.durationMin} {type.unit}
        </span>
      </span>
      <span className={styles.text} data-placeholder={item.status === 'placeholder' || undefined}>
        <span className={styles.title}>{item.title}</span>
        {reason && <span className={styles.reason}>{reason}</span>}
      </span>
      <span className={styles.foot}>
        <span className={styles.meta}>{formatShortDate(item.publishedAt)}</span>
        <span className={styles.go} aria-hidden>
          <Icon name="chevron" size={18} />
        </span>
      </span>
    </button>
  );
}
