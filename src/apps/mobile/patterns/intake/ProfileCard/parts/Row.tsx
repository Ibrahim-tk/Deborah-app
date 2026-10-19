/** One row of the ProfileCard: label, then either the answered value (tap to edit) or the inline widget. */
import type { ReactNode } from 'react';
import type { FieldSource } from '@shared/types/health';
import { Icon } from '@mobile/ui';
import styles from '../ProfileCard.module.css';

const SOURCE: Record<FieldSource, string> = {
  healthkit: 'from Apple Health',
  inferred: 'from what you said',
  manual: '',
  scan: 'from your scan',
  chat: 'confirmed in conversation',
  visit: 'from your provider visit',
};

export interface RowProps {
  label: string;
  /** Answered value as text; undefined shows the widget. */
  value?: string;
  source?: FieldSource;
  confidence?: number;
  editing: boolean;
  onEdit: () => void;
  children: ReactNode;
}

export function Row({ label, value, source, confidence, editing, onEdit, children }: RowProps) {
  const check = confidence !== undefined && confidence < 0.8;
  if (value !== undefined && !editing) {
    return (
      <li className={styles.row} data-check={check || undefined}>
        <button type="button" className={styles.filled} onClick={onEdit} aria-label={`${label}: ${value}. Edit`}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}</span>
          {(check || (source && SOURCE[source])) && (
            <span className={styles.meta}>{check ? 'Check this' : SOURCE[source!]}</span>
          )}
          <Icon name="edit" size={18} className={styles.editIcon} />
        </button>
      </li>
    );
  }
  return (
    <li className={styles.row} data-open>
      <span className={styles.label}>{label}</span>
      {children}
    </li>
  );
}
