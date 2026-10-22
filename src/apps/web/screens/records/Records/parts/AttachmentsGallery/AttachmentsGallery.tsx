/**
 * Attachments segment (design 2026-10-21): every photo or file the profile has added — lab report photos and
 * uploaded documents — as a plain 3-column image gallery (design 2026-10-21): no heading, no container. Prototype: the real files are never read, so photos show the sample image.
 */
import { useShallow } from 'zustand/react/shallow';
import { seedAttachments } from '@shared/data';
import { selectDocuments, selectProfileLabs, useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import { Icon } from '@web/ui';
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

export function AttachmentsGallery({ profileId }: { profileId: string }) {
  const { open } = useNav();
  const labs = useAppStore(useShallow((s) => selectProfileLabs(s, profileId)));
  const docs = useAppStore(useShallow((s) => selectDocuments(s, profileId)));

  // Seed photos (hands, hair, skin) first, then anything added in the prototype.
  const items: Attachment[] = [
    ...seedAttachments.map((a) => ({ id: a.id, title: a.alt, date: formatShortDate(a.date), image: a.src })),
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

  if (!items.length) return <EmptyState icon="image" title="No attachments yet" />;

  return (
    <ul className={styles.grid} aria-label="Attachments">
      {items.map((a) => (
        <li key={a.id}>
          {a.onOpen ? (
            <button type="button" className={styles.tile} onClick={a.onOpen} aria-label={a.date ? `${a.title}, ${a.date}` : a.title}>
              {a.image ? <img src={a.image} alt="" className={styles.img} draggable={false} /> : <Icon name="file" size={24} />}
            </button>
          ) : (
            <span className={styles.tile}>
              <img src={a.image} alt={a.date ? `${a.title}, ${a.date}` : a.title} className={styles.img} loading="lazy" draggable={false} />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
