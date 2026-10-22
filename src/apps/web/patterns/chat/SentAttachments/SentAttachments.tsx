/**
 * @pattern SentAttachments — photos / files the user sent from the composer, shown in the thread as the images
 *          themselves (design 2026-10-21): right-aligned, rounded, no bubble or tint. Files without a preview
 *          show a quiet document tile with the name.
 * @usedBy  M-2.1 Conversation (MessageList)
 */
import { Icon } from '@web/ui';
import styles from './SentAttachments.module.css';

export function SentAttachments({ items }: { items: { name: string; src?: string }[] }) {
  return (
    <ul className={styles.root} data-count={Math.min(items.length, 3)} aria-label="Sent attachments">
      {items.map((a, i) => (
        <li key={`${a.name}-${i}`} className={styles.item}>
          {a.src ? (
            <img src={a.src} alt={a.name} className={styles.img} draggable={false} />
          ) : (
            <span className={styles.file}><Icon name="file" size={20} /><span className={styles.name}>{a.name}</span></span>
          )}
        </li>
      ))}
    </ul>
  );
}
