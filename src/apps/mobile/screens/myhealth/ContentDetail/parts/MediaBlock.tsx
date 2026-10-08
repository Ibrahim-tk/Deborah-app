/** M-7.4 media: video poster + play (demo placeholder) or a readable text column for articles / lessons. */
import { useState } from 'react';
import type { LibraryItem } from '@shared/types/content';
import { Icon, IconButton } from '@mobile/ui';
import styles from './MediaBlock.module.css';

export function MediaBlock({ item }: { item: LibraryItem }) {
  const [playing, setPlaying] = useState(false);

  if (item.type === 'video') {
    return (
      <div className={styles.poster} data-playing={playing || undefined}>
        {playing ? (
          <p className={styles.demo} role="status">Video plays here (demo)</p>
        ) : (
          <>
            <Icon name="video" size={32} className={styles.posterIcon} />
            <IconButton icon="play" label={`Play ${item.title}`} size="lg" tone="surface" onClick={() => setPlaying(true)} />
          </>
        )}
      </div>
    );
  }

  return (
    <div className={styles.text}>
      {(item.body ?? [item.summary]).map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}
