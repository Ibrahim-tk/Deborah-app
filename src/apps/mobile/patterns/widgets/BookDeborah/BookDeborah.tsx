/**
 * @pattern BookDeborah — tile CTA that requests a consult; no calendar. Tap opens a small sheet:
 *          the team has been notified and will contact soon.
 * @usedBy  widget lab (/wid)
 */
import { useState } from 'react';
import { BOOK_CONSULT_LABEL } from '@shared/copy/booking';
import { Button, Icon, Overlay } from '@mobile/ui';
import styles from './BookDeborah.module.css';

export interface BookDeborahProps {
  /** Called once when the request is sent (sheet opens). */
  onRequest?: () => void;
  title?: string;
  meta?: string;
}

export function BookDeborah({
  onRequest,
  title = BOOK_CONSULT_LABEL,
  meta = 'We’ll reach out to schedule',
}: BookDeborahProps) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const request = () => {
    if (!sent) {
      setSent(true);
      onRequest?.();
    }
    setOpen(true);
  };

  return (
    <>
      <button type="button" className={styles.tile} onClick={request} data-placeholder>
        <span className={styles.icon} aria-hidden>
          <Icon name="calendar" size={18} />
        </span>
        <span className={styles.text}>
          <span className={styles.title}>{sent ? 'Request sent' : title}</span>
          <span className={styles.meta}>{sent ? 'The team will contact you soon' : meta}</span>
        </span>
        <Icon name={sent ? 'check' : 'chevron'} size={18} className={styles.chevron} />
      </button>

      <Overlay>
        {open && (
          <div className={styles.layer}>
            <button type="button" className={styles.scrim} aria-label="Close" onClick={() => setOpen(false)} />
            <div className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="book-deborah-title" data-placeholder>
              <span className={styles.grabber} aria-hidden />
              <span className={styles.sheetIcon} aria-hidden>
                <Icon name="check" size={28} />
              </span>
              <h2 id="book-deborah-title" className={styles.sheetTitle}>
                The team has been notified
              </h2>
              <p className={styles.sheetBody}>
                Someone from Deborah’s team will contact you soon to set up a time.
              </p>
              <Button fullWidth onClick={() => setOpen(false)}>
                Got it
              </Button>
            </div>
          </div>
        )}
      </Overlay>
    </>
  );
}
