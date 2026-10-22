/**
 * @pattern ConfirmCard — a dark glass "confirm this" card for actions with consequences (booking, a
 *          purchase, sharing data): an eyebrow, a title with its value on the right, a detail line, then
 *          Confirm / Cancel. Afterwards it stays as a one-line record. Floating card, so a soft shadow.
 * @usedBy  widget lab (/wid)
 */
import { useState } from 'react';
import { Icon, type IconName } from '@web/ui';
import styles from './ConfirmCard.module.css';

export interface ConfirmCardProps {
  eyebrow: string;
  icon?: IconName;
  title: string;
  value?: string;
  detail?: string;
  detailValue?: string;
  confirmLabel?: string;
  confirmedText: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmCard({ eyebrow, icon = 'alert', title, value, detail, detailValue, confirmLabel = 'Confirm', confirmedText, onConfirm, onCancel }: ConfirmCardProps) {
  const [state, setState] = useState<'open' | 'confirmed' | 'cancelled'>('open');
  return (
    <section className={styles.root} aria-label={eyebrow}>
      <p className={styles.eyebrow}><Icon name={icon} size={16} /> {eyebrow}</p>
      <div className={styles.row}>
        <span className={styles.title}>{title}</span>
        {value && <span className={styles.value}>{value}</span>}
      </div>
      {(detail || detailValue) && (
        <div className={styles.row}>
          <span className={styles.detail}>{detail}</span>
          {detailValue && <span className={styles.detail}>{detailValue}</span>}
        </div>
      )}
      {state === 'open' ? (
        <div className={styles.actions}>
          <button type="button" className={styles.confirm} onClick={() => { setState('confirmed'); onConfirm(); }}>{confirmLabel}</button>
          <button type="button" className={styles.cancel} onClick={() => { setState('cancelled'); onCancel?.(); }}>Cancel</button>
        </div>
      ) : (
        <p className={styles.result} role="status"><Icon name={state === 'confirmed' ? 'check' : 'close'} size={16} /> {state === 'confirmed' ? confirmedText : 'Cancelled. Nothing was changed.'}</p>
      )}
    </section>
  );
}
