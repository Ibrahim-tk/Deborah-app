/**
 * @pattern AttachedDocument — the user's side of a shared document: type icon, title, type · format.
 *          Tapping opens the document; once deleted it reads "Document removed" and does nothing.
 * @usedBy  M-2.1 (Conversation)
 * @spec    docs/ux/F11-documents.md#deborah-handoff-phase-4
 * @xref    web: apps/web/patterns/chat/AttachedDocument — not built
 */
import { Icon, type IconName } from '@web/ui';
import styles from './AttachedDocument.module.css';

export interface AttachedDocumentProps {
  /** Undefined once the document is deleted. */
  title?: string;
  /** e.g. "Lab result · PDF". */
  meta?: string;
  icon?: IconName;
  onOpen?: () => void;
}

export function AttachedDocument({ title, meta, icon = 'file', onOpen }: AttachedDocumentProps) {
  const removed = !title;
  const body = (
    <>
      <span className={styles.icon} aria-hidden>
        <Icon name={removed ? 'file' : icon} size={22} />
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{removed ? 'Document removed' : title}</span>
        {!removed && meta && <span className={styles.meta}>{meta}</span>}
      </span>
    </>
  );
  return (
    <div className={styles.row}>
      {removed || !onOpen ? (
        <div className={styles.card} data-removed={removed || undefined}>{body}</div>
      ) : (
        <button type="button" className={styles.card} onClick={onOpen} aria-label={`Open ${title}`}>
          {body}
        </button>
      )}
    </div>
  );
}
