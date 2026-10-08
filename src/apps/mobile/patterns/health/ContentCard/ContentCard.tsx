/**
 * @pattern ContentCard — Deborah library item: type icon, title, duration / read time, date, and an
 *          optional reason line in plain text ("Because you asked about sleep"; never a chip)
 * @usedBy  M-7.1, M-7.2, M-7.5
 * @spec    docs/ux/F07-my-health-hub.md#m-72--my-health-hub (Layout 6), #m-75--deborahs-library
 * @xref    web: apps/web/patterns/health/ContentCard — not built
 */
import type { LibraryItem } from '@shared/types/content';
import { formatShortDate } from '@shared/utils';
import { Card, Icon, type IconName } from '@mobile/ui';
import styles from './ContentCard.module.css';

export interface ContentCardProps {
  item: LibraryItem;
  reason?: string;
  onPress: () => void;
}

const CONTENT_TYPE: Record<LibraryItem['type'], { icon: IconName; label: string; unit: string }> = {
  video: { icon: 'video', label: 'Video', unit: 'min' },
  article: { icon: 'file', label: 'Article', unit: 'min read' },
  lesson: { icon: 'book', label: 'Lesson', unit: 'min' },
};

export function ContentCard({ item, reason, onPress }: ContentCardProps) {
  const type = CONTENT_TYPE[item.type];
  return (
    <Card onPress={onPress} className={styles.root}>
      <span className={styles.icon}>
        <Icon name={type.icon} size={24} />
      </span>
      <span className={styles.text} data-placeholder={item.status === 'placeholder' || undefined}>
        <span className={styles.title}>{item.title}</span>
        <span className={styles.meta}>
          {type.label} · {item.durationMin} {type.unit} · {formatShortDate(item.publishedAt)}
        </span>
        {reason && <span className={styles.reason}>{reason}</span>}
      </span>
    </Card>
  );
}
