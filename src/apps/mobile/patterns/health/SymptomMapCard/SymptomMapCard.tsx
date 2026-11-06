/**
 * @pattern SymptomMapCard — My Health entry to the Symptoms map (M-7.9).
 * @usedBy  M-7.2 My Health hub (below Your Wellness Plan)
 * @spec    Design request 2026-11-07 (OPEN: add to docs/ux/F07)
 *
 * Copy on the left; on the right the harmonious infinity-loop graphic on a peach→lavender wash.
 * @xref    web: apps/web/patterns/health/SymptomMapCard
 */
import { Icon } from '@mobile/ui';
import loopSrc from './assets/harmonious-loop.png';
import styles from './SymptomMapCard.module.css';

export interface SymptomMapCardProps {
  /** e.g. "6 symptoms across 6 areas · Fatigue appears in 3" — spoken, not shown. */
  summary: string;
  onPress: () => void;
}

export function SymptomMapCard({ summary, onPress }: SymptomMapCardProps) {
  return (
    <button type="button" className={styles.root} onClick={onPress} aria-label={`Symptoms map. ${summary}`}>
      <span className={styles.copy}>
        <span className={styles.title}>Symptoms map</span>
        <span className={styles.cta}>
          Explore your map <Icon name="chevron" size={16} />
        </span>
      </span>
      <img className={styles.art} src={loopSrc} alt="" aria-hidden />
    </button>
  );
}
