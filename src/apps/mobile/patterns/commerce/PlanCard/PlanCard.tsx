/**
 * @pattern PlanCard — one plan as a radio card: name, price per period (crossfades on billing
 *          change), 2–3 feature lines, profile count. Selected = 2 pt Deborah Purple border +
 *          check. Recommended = Linen fill + "Most chosen" in Gold Ink. No badges.
 * @usedBy  M-4.2
 * @spec    docs/ux/F04-plans-account.md#m-42--choose-your-plan · DESIGN.md › Cards
 * @xref    web: apps/web/patterns/commerce/PlanCard — not built
 */
import type { PlanOption } from '@shared/types/content';
import type { Billing } from '@shared/types/domain';
import { AnimatePresence, DURATION, Icon, MotionSpan } from '@mobile/ui';
import { planPrice } from './planPrice';
import styles from './PlanCard.module.css';

export interface PlanCardProps {
  plan: PlanOption;
  billing: Billing;
  selected: boolean;
  /** Subscriber's active plan. */
  current?: boolean;
  onSelect: () => void;
}

export function PlanCard({ plan, billing, selected, current, onSelect }: PlanCardProps) {
  const price = planPrice(plan, billing);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={styles.root}
      data-selected={selected || undefined}
      data-recommended={plan.recommended || undefined}
      onClick={onSelect}
    >
      <span className={styles.head}>
        <span className={styles.nameRow}>
          <span className={styles.name}>{plan.name}</span>
          {/* User-requested exception to the DESIGN.md "no pills" rule (2026-10-08). */}
            </span>
        <span className={styles.check} aria-hidden="true">{selected && <Icon name="check" size={20} strokeWidth={2} />}</span>
      </span>
      {current && <span className={styles.current}>Current plan</span>}
      <span className={styles.price}>
        <AnimatePresence mode="wait" initial={false}>
          <MotionSpan key={price} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: DURATION.quick }}>
            {price}
          </MotionSpan>
        </AnimatePresence>
      </span>
      <span className={styles.features}>
        {plan.features.map((f) => (
          <span key={f} className={styles.feature}>{f}</span>
        ))}
      </span>
      <span className={styles.profiles}>{plan.profiles === 1 ? '1 profile' : `Up to ${plan.profiles} profiles`}</span>
    </button>
  );
}
