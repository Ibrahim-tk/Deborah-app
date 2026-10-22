/**
 * LabMetricCard — marker · plain-text status · large value · circular chevron (M-9.5).
 * No status pills/badges (DESIGN.md).
 */
import type { LabValue } from '@shared/types/domain';
import { Icon } from '@web/ui';
import styles from './LabMetricCard.module.css';

export interface LabMetricCardProps {
  value: LabValue;
  onPress?: () => void;
}

export function LabMetricCard({ value, onPress }: LabMetricCardProps) {
  const tone = value.statusTone;
  const display =
    value.unit.trim().length > 0 ? `${value.value} ${value.unit}` : value.value;
  const valueTone = !value.statusLabel && tone === 'excellent' ? 'excellent' : undefined;

  const inner = (
    <>
      <div className={styles.top}>
        <span className={styles.marker}>{value.marker}</span>
        {value.statusLabel && (
          <span className={styles.status} data-tone={tone}>{value.statusLabel}</span>
        )}
      </div>
      <div className={styles.bottom}>
        <span className={styles.value} data-tone={valueTone}>{display}</span>
        <span className={styles.action} aria-hidden>
          <Icon name="chevron" size={16} />
        </span>
      </div>
    </>
  );

  if (onPress) {
    return (
      <button type="button" className={styles.card} onClick={onPress}>
        {inner}
      </button>
    );
  }

  return <div className={styles.card}>{inner}</div>;
}
