/**
 * @pattern VisitNoteCard — a Visit Note as a card (design 2026-10-20, Rodeo-style): one shared line-doodle
 *          illustration (the "who is this for" style), then date · what it's about · one relevant line.
 *          Footer: not logged → "Log visit" on Records, "Open" in chat (`actionLabel`); logged → "Ask Deborah"
 *          and an Edit link to reopen the log.
 * @usedBy  M-9.1 (Visit Notes)
 */
import { Button, Icon, IconButton, type IconName } from '@mobile/ui';
import { EmptyDoodle } from '../EmptyState/EmptyDoodle';
import styles from './VisitNoteCard.module.css';

export interface VisitNoteCardProps {
  /** e.g. "Thu, Oct 22". */
  date: string;
  title: string;
  detail?: string;
  /** Illustration (EmptyDoodle kind): 'note' for visit notes, 'labs' for lab reports. */
  doodle?: IconName;
  /** Visit notes only: without these the card is a compact tile with no footer (lab reports). */
  logged?: boolean;
  /**
   * Footer button when the visit is not logged yet.
   * Records keeps the default "Log visit". Chat passes "Open".
   */
  actionLabel?: string;
  onOpen: () => void;
  onLog?: () => void;
  onAsk?: () => void;
}

export function VisitNoteCard({ date, title, detail, doodle = 'note', logged = false, actionLabel = 'Log visit', onOpen, onLog, onAsk }: VisitNoteCardProps) {
  return (
    <article className={styles.root} data-compact={!onLog || undefined}>
      <button type="button" className={styles.main} onClick={onOpen}>
        <span className={styles.tile} aria-hidden><EmptyDoodle icon={doodle} size={onLog ? 52 : 36} /></span>
        <span className={styles.text}>
          <span className={styles.status}>{date}</span>
          <span className={styles.title}>{title}</span>
          {detail && <span className={styles.meta}>{detail}</span>}
        </span>
      </button>
      {onLog && <div className={styles.footer}>
        {logged ? (
          <>
            {/* Ask first (the Oracle's orb), edit the log last (design 2026-10-20). */}
            <Button variant="secondary" size="sm" leadingIcon="deborah" onClick={() => onAsk?.()}>Ask Oracle</Button>
            <IconButton icon="edit" size="sm" label="Edit visit log" className={styles.edit} onClick={onLog} />
          </>
        ) : (
          <>
            <span className={styles.state}><Icon name="calendar" size={18} /> Not logged yet</span>
            <Button variant="secondary" size="sm" onClick={onLog}>{actionLabel}</Button>
          </>
        )}
      </div>}
    </article>
  );
}
