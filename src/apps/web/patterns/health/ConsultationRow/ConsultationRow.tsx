/**
 * @pattern ConsultationRow — topic, date and status as one plain subtitle line
 *          ("Answered" / "In progress" · "With labs"). No badges (DESIGN.md bans).
 * @usedBy  M-9.1
 * @spec    docs/ux/F09-records.md#m-91--records
 * @xref    web: apps/web/patterns/health/ConsultationRow — not built
 */
import { Icon, ListRow } from '@web/ui';
import styles from './ConsultationRow.module.css';

export interface ConsultationRowProps {
  topic: string;
  /** Already formatted, e.g. "12 Sep". */
  date: string;
  status: 'answered' | 'in-progress';
  withLabs?: boolean;
  /** Desktop master–detail: row is the open pane. */
  selected?: boolean;
  onPress: () => void;
}

export function ConsultationRow({ topic, date, status, withLabs = false, selected = false, onPress }: ConsultationRowProps) {
  const subtitle = [date, status === 'answered' ? 'Answered' : 'In progress', withLabs && 'With labs'].filter(Boolean).join(' · ');
  return (
    <div className={selected ? styles.selected : undefined} data-selected={selected || undefined}>
      <ListRow
        title={<span className={styles.topic}>{topic}</span>}
        subtitle={subtitle}
        leading={
          <span className={styles.icon}>
            <Icon name={withLabs ? 'labs' : 'chat'} size={22} />
          </span>
        }
        onPress={onPress}
      />
    </div>
  );
}
