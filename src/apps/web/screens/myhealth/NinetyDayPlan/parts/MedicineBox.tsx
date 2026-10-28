/** Medicine-box wells: checkable actions grouped by the words already in the plan. */
import { guardrailsData } from '@shared/data';
import type { PlanAction, PlanWell } from '@shared/types/domain';
import { Checkbox, ProgressBar } from '@web/ui';
import { MedicationSafetyCard } from '@web/patterns/safety';
import styles from './MedicineBox.module.css';

const WELLS: { id: PlanWell; label: string }[] = [
  { id: 'now', label: 'Do now' },
  { id: 'provider', label: 'Ask your provider' },
  { id: 'daily', label: 'Daily support' },
  { id: 'labs', label: 'Labs' },
];

export interface MedicineBoxProps {
  actions: PlanAction[];
  hasMedicines: boolean;
  onToggle: (actionId: string) => void;
  onCheckInteractions: () => void;
}

export function MedicineBox({ actions, hasMedicines, onToggle, onCheckInteractions }: MedicineBoxProps) {
  const done = actions.filter((a) => a.done).length;
  const showSafety = hasMedicines && actions.some((a) => a.safety);
  const wells = WELLS.map((well) => ({ ...well, actions: actions.filter((a) => a.well === well.id) })).filter((well) => well.actions.length);

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
      {wells.map((well) => (
        <div key={well.id} className={styles.well}>
          <h3 className={styles.wellLabel}>{well.label}</h3>
          <ul className={styles.rows}>
            {well.actions.map((action) => (
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
      ))}
    </div>
  );
}
