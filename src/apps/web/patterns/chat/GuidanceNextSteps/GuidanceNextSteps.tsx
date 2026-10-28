/**
 * @pattern GuidanceNextSteps — simple OptionRow list after Guidance given (Miro Step 4 What’s next)
 * @usedBy  M-2.1
 * @spec    docs/ux/F02e-guidance.md
 * @xref    web: apps/web/patterns/chat/GuidanceNextSteps — not built
 */
import { HEALING_PLAN_VIEW_CTA, WELLNESS_PLAN_DISCLAIMER } from '@shared/copy/healingPlan';
import { OptionList, OptionRow } from '@web/ui';
import styles from './GuidanceNextSteps.module.css';

export type GuidanceNextId =
  | 'followUp'
  | 'provider'
  | 'save'
  | 'labs'
  | 'product'
  | 'plan';

export interface GuidanceNextStepsProps {
  onSelect: (id: GuidanceNextId) => void;
  /** Hide product row when no product on the answer. */
  showProduct?: boolean;
  /** Hide 90-day plan when none exists. */
  showPlan?: boolean;
  disabled?: boolean;
}

/** Booking is EscalationCard above this list (designer 2026-10-21), not an OptionRow. */
const ROWS: { id: GuidanceNextId; label: string; gate?: 'product' | 'plan' }[] = [
  { id: 'followUp', label: 'Ask a follow-up' },
  { id: 'provider', label: 'Discuss with provider' },
  { id: 'save', label: 'Save summary' },
  { id: 'product', label: 'Buy recommended product', gate: 'product' },
  { id: 'plan', label: HEALING_PLAN_VIEW_CTA, gate: 'plan' },
];

export function GuidanceNextSteps({ onSelect, showProduct, showPlan, disabled }: GuidanceNextStepsProps) {
  const visible = ROWS.filter((r) => {
    if (r.gate === 'product') return Boolean(showProduct);
    if (r.gate === 'plan') return Boolean(showPlan);
    return true;
  });
  if (!visible.length) return null;
  return (
    <div className={styles.root}>
      <p className={styles.label}>What’s next?</p>
      <OptionList label="What’s next after guidance">
        {visible.map((r) => (
          <OptionRow key={r.id} chevron disabled={disabled} onSelect={() => onSelect(r.id)}>
            {r.label}
          </OptionRow>
        ))}
      </OptionList>
      {showPlan && <p className={styles.disclaimer}>{WELLNESS_PLAN_DISCLAIMER}</p>}
    </div>
  );
}
