/**
 * @pattern HealingPlanSection — titled block on My Healing Plan detail (M-7.3).
 * @usedBy  M-7.3 NinetyDayPlan · Widget lab
 * @status  placeholder
 */
import type { ReactNode } from 'react';
import styles from './HealingPlanSection.module.css';

export interface HealingPlanSectionProps {
  title: string;
  empty?: string;
  children?: ReactNode;
}

export function HealingPlanSection({ title, empty, children }: HealingPlanSectionProps) {
  const has = Boolean(children);
  return (
    <section className={styles.root} aria-labelledby={`hps-${title.replace(/\s+/g, '-')}`} data-placeholder>
      <h2 id={`hps-${title.replace(/\s+/g, '-')}`} className={styles.title}>
        {title}
      </h2>
      {has ? <div className={styles.body}>{children}</div> : empty ? <p className={styles.empty}>{empty}</p> : null}
    </section>
  );
}
