/** Newest concern stays open. Earlier ones stay on the plan, collapsed. Resolved names stay as history. */
import { useState } from 'react';
import type { PlanConcern } from '@shared/types/domain';
import { Icon } from '@mobile/ui';
import { MedicineBox } from './MedicineBox';
import styles from './LivingPlan.module.css';

export interface LivingPlanProps {
  concerns: PlanConcern[];
  /** Visit specialties on file. The mismatch sentence stays hidden until one exists. */
  careTeam: string;
  hasMedicines: boolean;
  onToggle: (concernId: string, actionId: string) => void;
  onResolve: (concernId: string) => void;
  onCheckInteractions: () => void;
}

export function LivingPlan({ concerns, careTeam, hasMedicines, onToggle, onResolve, onCheckInteractions }: LivingPlanProps) {
  const active = concerns.filter((c) => c.status === 'active');
  const resolved = concerns.filter((c) => c.status === 'resolved');
  const [openId, setOpenId] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const newest = active[0];
  const earlier = active.slice(1);

  return (
    <div className={styles.root}>
      {newest ? (
        <Concern
          concern={newest}
          newest
          careTeam={careTeam}
          hasMedicines={hasMedicines}
          onToggle={onToggle}
          onResolve={onResolve}
          onCheckInteractions={onCheckInteractions}
        />
      ) : (
        <p className={styles.quiet}>Nothing active. The Oracle still has your history.</p>
      )}

      {earlier.length > 0 && (
        <div className={styles.earlier}>
          <h2 className={styles.earlierTitle}>Earlier concerns</h2>
          {earlier.map((concern) => {
            const open = openId === concern.id;
            return (
              <div key={concern.id} className={styles.fold} data-open={open || undefined}>
                <button
                  type="button"
                  className={styles.foldHead}
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? '' : concern.id)}
                >
                  <span className={styles.foldText}>
                    <span className={styles.foldName}>{concern.title}</span>
                  </span>
                  <Icon name="chevronDown" size={18} className={styles.chevron} />
                </button>
                {open && (
                  <Concern
                    concern={concern}
                    careTeam={careTeam}
                    hasMedicines={hasMedicines}
                    onToggle={onToggle}
                    onResolve={onResolve}
                    onCheckInteractions={onCheckInteractions}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {resolved.length > 0 && (
        <div className={styles.fold} data-open={showResolved || undefined}>
          <button type="button" className={styles.foldHead} aria-expanded={showResolved} onClick={() => setShowResolved((v) => !v)}>
            <span className={styles.foldText}>
              <span className={styles.foldName}>Resolved</span>
            </span>
            <Icon name="chevronDown" size={18} className={styles.chevron} />
          </button>
          {showResolved && (
            <ul className={styles.resolved}>
              {resolved.map((c) => (
                <li key={c.id}>{c.title}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}


function Concern({
  concern,
  newest,
  careTeam,
  hasMedicines,
  onToggle,
  onResolve: _onResolve,
  onCheckInteractions,
}: {
  concern: PlanConcern;
  newest?: boolean;
  careTeam: string;
  hasMedicines: boolean;
  onToggle: (concernId: string, actionId: string) => void;
  onResolve: (concernId: string) => void;
  onCheckInteractions: () => void;
}) {
  return (
    <section className={styles.concern} aria-label={newest ? undefined : concern.title} aria-labelledby={newest ? `concern-${concern.id}` : undefined}>
      {newest && (
        <>
          <h2 id={`concern-${concern.id}`} className={styles.title}>{concern.title}</h2>
        </>
      )}
      {concern.mismatch && careTeam && <p className={styles.mismatch}>{concern.mismatch}</p>}
      <MedicineBox
        actions={concern.actions}
        hasMedicines={hasMedicines}
        onToggle={(actionId) => onToggle(concern.id, actionId)}
        onCheckInteractions={onCheckInteractions}
      />
    </section>
  );
}
