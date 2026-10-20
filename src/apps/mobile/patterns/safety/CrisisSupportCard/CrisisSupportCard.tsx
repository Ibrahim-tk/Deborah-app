/**
 * @pattern CrisisSupportCard — calm tone (not alarm red); actions in a bottom sheet
 *          (Call 911, text/SMS crisis line, other support, keep talking).
 * @usedBy  M-2.1
 * @spec    docs/ux/F03-safety.md#pattern--crisissupportcard-figma-33
 * @xref    web: apps/web/patterns/safety/CrisisSupportCard — not built
 */
// OPEN: "exact behaviour and copy with Deborah + attorney (SOW requires crisis safeguards)".
import { useState } from 'react';
import { BottomSheet, Button, Icon } from '@mobile/ui';
import styles from './CrisisSupportCard.module.css';

export interface CrisisSupportCardProps {
  body: string;
  lifelineLabel: string;
  moreSupport: string[];
  onCall: () => void;
  /** Call 911 (simulated). */
  onCall911?: () => void;
  /** Text / SMS crisis line (simulated). */
  onText?: () => void;
  onKeepTalking: () => void;
}

export function CrisisSupportCard({
  body,
  lifelineLabel,
  moreSupport,
  onCall,
  onCall911,
  onText,
  onKeepTalking,
}: CrisisSupportCardProps) {
  const [open, setOpen] = useState(true);
  const close = () => setOpen(false);
  const keep = () => {
    close();
    onKeepTalking();
  };

  return (
    <>
      <button type="button" className={styles.record} onClick={() => setOpen(true)} data-placeholder>
        <span className={styles.recordIcon} aria-hidden>
          <Icon name="health" size={18} />
        </span>
        <span className={styles.recordText}>
          <span className={styles.recordTitle}>Support is available</span>
          <span className={styles.recordMeta}>Call, text, or keep talking with Deborah</span>
        </span>
        <Icon name="chevron" size={18} className={styles.recordChevron} />
      </button>
      <BottomSheet open={Boolean(open)} onClose={close}>
        <div className={styles.sheet} role="group" aria-labelledby="crisis-title" data-placeholder>
          <h2 id="crisis-title" className={styles.title}>{body}</h2>
          <div className={styles.actions}>
            <Button fullWidth leadingIcon="phone" variant="emergency" onClick={() => { if (onCall911) onCall911(); else onCall(); }}>
              Call 911
            </Button>
            <Button fullWidth leadingIcon="phone" onClick={onCall}>
              {lifelineLabel}
            </Button>
            <Button variant="secondary" fullWidth onClick={() => { if (onText) onText(); else onCall(); }}>
              Text HOME to 741741
            </Button>
            {moreSupport[1] && (
              <p className={styles.note}>{moreSupport[1]}</p>
            )}
            <Button variant="ghost" fullWidth onClick={keep}>
              Keep talking with Deborah
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
