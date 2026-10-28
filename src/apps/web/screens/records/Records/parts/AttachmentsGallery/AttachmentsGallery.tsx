/**
 * Attachments / Images gallery: photo tiles (optionally captioned). Prototype uses seed + lab/doc previews.
 */
import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { seedAttachments } from '@shared/data';
import { selectDocuments, selectProfileLabs, useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import { Icon, Lightbox } from '@web/ui';
import { EmptyState } from '@web/patterns/health';
import { useNav } from '@web/navigation';
import styles from './AttachmentsGallery.module.css';

const PHOTO = '/images/labs/camera-preview.jpg';

interface Attachment {
  id: string;
  title: string;
  date?: string;
  image?: string;
  onOpen?: () => void;
}

export function AttachmentsGallery({
  profileId,
  query = '',
  captions = false,
}: {
  profileId: string;
  query?: string;
  captions?: boolean;
}) {
  const { open } = useNav();
  const labs = useAppStore(useShallow((s) => selectProfileLabs(s, profileId)));
  const docs = useAppStore(useShallow((s) => selectDocuments(s, profileId)));

  const items: Attachment[] = useMemo(() => {
    const all: Attachment[] = [
      ...seedAttachments.map((a) => ({
        id: a.id,
        title: a.alt,
        date: formatShortDate(a.date),
        image: a.src,
      })),
      ...labs.map((r) => ({
        id: r.id,
        title: r.panelTitle ?? r.labName ?? 'Lab report',
        date: r.collectedAt ? formatShortDate(r.collectedAt) : undefined,
        image: PHOTO,
        onOpen: () => open('M-9.5', { reportId: r.id }),
      })),
      ...docs.map((d) => ({
        id: d.id,
        title: d.title,
        date: formatShortDate(d.documentDate ?? d.uploadedAt),
        image: d.format === 'jpg' || d.format === 'png' ? PHOTO : undefined,
        onOpen: () => open('M-11.2', { documentId: d.id }),
      })),
    ];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((a) => a.title.toLowerCase().includes(q));
  }, [docs, labs, open, query]);

  // Plain photos open in the lightbox; lab reports and documents keep their own pages.
  const photos = useMemo(
    () =>
      items
        .filter((a) => !a.onOpen && a.image)
        .map((a) => ({ id: a.id, src: a.image!, title: a.title, date: a.date })),
    [items],
  );
  const [viewing, setViewing] = useState<number | null>(null);
  const view = (id: string) => setViewing(photos.findIndex((p) => p.id === id));

  if (!items.length)
    return (
      <EmptyState
        icon="image"
        title={query.trim() ? 'No images match that search' : 'No attachments yet'}
      />
    );

  return (
    <>
      <ul className={styles.grid} aria-label="Images" data-captions={captions || undefined}>
        {items.map((a) => (
          <li key={a.id}>
            {a.onOpen ? (
              <button
                type="button"
                className={styles.tile}
                onClick={a.onOpen}
                aria-label={a.date ? `${a.title}, ${a.date}` : a.title}
              >
                {a.image ? (
                  <img src={a.image} alt="" className={styles.img} draggable={false} />
                ) : (
                  <Icon name="file" size={24} />
                )}
                {captions && <span className={styles.caption}>{a.title}</span>}
              </button>
            ) : (
              <button
                type="button"
                className={styles.tile}
                onClick={() => view(a.id)}
                aria-label={a.date ? `View ${a.title}, ${a.date}` : `View ${a.title}`}
              >
                <img src={a.image} alt="" className={styles.img} loading="lazy" draggable={false} />
                {captions && <span className={styles.caption}>{a.title}</span>}
              </button>
            )}
          </li>
        ))}
      </ul>
      {viewing !== null && viewing >= 0 && (
        <Lightbox
          items={photos}
          index={viewing}
          onIndex={setViewing}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}
