/**
 * @pattern MedicationSafetyCard — additive card; never contains dosing
 * @usedBy  M-2.1
 * @spec    docs/ux/F03-safety.md#pattern--medicationsafetycard-figma-32
 * @xref    web: apps/web/patterns/safety/MedicationSafetyCard — not built
 */
import { Panel, OptionRow } from '@mobile/ui';
import styles from './MedicationSafetyCard.module.css';

export interface MedicationSafetyCardProps {
  body: string;
  linkLabel: string;
  onCheckInteractions: () => void;
}

export function MedicationSafetyCard({ body, linkLabel, onCheckInteractions }: MedicationSafetyCardProps) {
  return (
    <Panel tone="linen" icon="medicine">
      <div className={styles.body} data-placeholder>
        <p className={styles.title}>Medication safety</p>
        <p className={styles.text}>{body}</p>
        <OptionRow chevron leadingIcon="external" onSelect={onCheckInteractions}>{linkLabel}</OptionRow>
      </div>
    </Panel>
  );
}
