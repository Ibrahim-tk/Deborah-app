/**
 * @pattern ContentCard — library item as a horizontal tonal card: body-font title + frosted
 *          affordance on the left, large rounded cover on the right with duration overlay.
 *          Optional reason line in plain text ("Because you asked about sleep"; never a chip).
 * @usedBy  M-7.1, M-7.2, M-7.5
 * @spec    docs/ux/F07-my-health-hub.md#m-72--my-health-hub (Layout 6), #m-75--deborahs-library
 * @xref    web: apps/web/patterns/health/ContentCard — not built
 */
import type { LibraryItem } from '@shared/types/content';
import { Icon, type IconName } from '@web/ui';
import styles from './ContentCard.module.css';

export interface ContentCardProps {
  item: LibraryItem;
  reason?: string;
  onPress: () => void;
}

/** Tone follows the content type, so a list reads as a calm rhythm, not a wall of white boxes. */
const CONTENT_TYPE: Record<LibraryItem['type'], { label: string; tone: string; action: IconName }> = {
  video: { label: 'Video', tone: 'rose', action: 'play' },
  article: { label: 'Article', tone: 'linen', action: 'chevron' },
  lesson: { label: 'Lesson', tone: 'lilac', action: 'chevron' },
};

/** Soft atmosphere art when a library item has no thumbnail yet. */
const TOPIC_FALLBACK: Record<string, string> = {
  sleep: '/images/home/suggest-sleep.jpg',
  labs: '/images/home/dest-health.jpg',
  thyroid: '/images/home/hero-continue.jpg',
  'hot-flashes': '/images/home/suggest-tired.jpg',
  foundations: '/images/home/hero-habits.jpg',
  teen: '/images/home/dest-family.jpg',
  stress: '/images/home/suggest-supplements.jpg',
  fatigue: '/images/home/suggest-tired.jpg',
  cycles: '/images/home/hero-new.jpg',
};

function coverFor(item: LibraryItem): string {
  if (item.thumbnail) return item.thumbnail;
  for (const topic of item.topics) {
    const hit = TOPIC_FALLBACK[topic];
    if (hit) return hit;
  }
  return '/images/home/hero-new.jpg';
}

export function ContentCard({ item, reason, onPress }: ContentCardProps) {
  const type = CONTENT_TYPE[item.type];
  const cover = coverFor(item);
  const durationLabel = item.type === 'article' ? `${item.durationMin} min read` : `${item.durationMin} min`;

  return (
    <button type="button" className={`${styles.root} ${styles[type.tone]}`} onClick={onPress}>
      <span className={styles.copy}>
        <span className={styles.kind}>{type.label} · {durationLabel}</span>
        <span className={styles.title} data-placeholder={item.status === 'placeholder' || undefined}>
          {item.title}
        </span>
        {reason && <span className={styles.reason}>{reason}</span>}
      </span>
      <span className={styles.media}>
        <img className={styles.cover} src={cover} alt="" decoding="async" />
        {/* Affordance sits on the cover, bottom right (design 2026-10-20: lighter card). */}
        <span className={styles.go} data-action={type.action} aria-hidden>
          <Icon name={type.action} size={type.action === 'play' ? 14 : 16} />
        </span>
      </span>
    </button>
  );
}
