/** Medicine box: one checklist, ordered by well (do now → provider → daily → labs); no group labels or dividers (2026-10-28). */
import { guardrailsData } from '@shared/data';
import type { PlanAction, PlanWell } from '@shared/types/domain';
import { Checkbox, ProgressBar } from '@mobile/ui';
import { MedicationSafetyCard } from '@mobile/patterns/safety';
import styles from './MedicineBox.module.css';

const WELL_ORDER: PlanWell[] = ['now', 'provider', 'daily', 'labs'];

export interface MedicineBoxProps {
  actions: PlanAction[];
  hasMedicines: boolean;
  onToggle: (actionId: string) => void;
  onCheckInteractions: () => void;
}

export function MedicineBox({ actions, hasMedicines, onToggle, onCheckInteractions }: MedicineBoxProps) {
  const done = actions.filter((a) => a.done).length;
  const showSafety = hasMedicines && actions.some((a) => a.safety);
  const ordered = WELL_ORDER.flatMap((well) => actions.filter((a) => a.well === well));

  if (!actions.length) {
    return <p className={styles.empty}>The Oracle hasn’t added actions for this yet.</p>;
  }

  return (
    <div className={styles.box}>
      <div className={styles.progress}>
        <ProgressBar value={actions.length ? done / actions.length : 0} label="Actions done" valueText={`${done} of ${actions.length}`} />
      </div>
      {showSafety && (
        <MedicationSafetyCard
          body={guardrailsData.medication.body}
          linkLabel={guardrailsData.medication.interactionLink.label}
          onCheckInteractions={onCheckInteractions}
        />
      )}
      <ul className={styles.rows}>
        {ordered.map((action) => (
          <li key={action.id}>
            <Checkbox
              round
              checked={action.done}
              label={<span className={styles.actionText}>{action.text}</span>}
              description={action.note}
              onChange={() => onToggle(action.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
