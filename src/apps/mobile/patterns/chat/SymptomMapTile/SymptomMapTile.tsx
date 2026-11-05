/**
 * @pattern SymptomMapTile — quiet chat row that opens M-7.9 after guidance
 * @usedBy  M-2.1 Conversation
 * @spec    Design request 2026-11-04 (OPEN: add to docs/ux/F02)
 * @xref    web: apps/web/patterns/chat/SymptomMapTile
 */
import { Icon } from '@mobile/ui';
import styles from './SymptomMapTile.module.css';

export interface SymptomMapTileProps {
  onPress: () => void;
}

export function SymptomMapTile({ onPress }: SymptomMapTileProps) {
  return (
    <button type="button" className={styles.root} onClick={onPress}>
      <span className={styles.label}>See how your symptoms connect</span>
      <Icon name="chevron" size={18} className={styles.chevron} />
    </button>
  );
}
