/**
 * @screen  M-7.3 · Your 90-day plan
 * @flow    F07 My Health hub
 * @states  default · habit toggled (today) · remove habit (action sheet) · no habits · no plan (empty) · plan complete
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280
 * @spec    docs/ux/F07-my-health-hub.md#m-73--your-90-day-plan
 * @xref    web: W-7.3 (apps/web/screens/myhealth/NinetyDayPlan) — not built
 */
// OPEN: "habit tracking/90-day plan is a design proposal, not in the brief — needs Deborah's approval."
import { useState } from 'react';
import { HEALING_PLAN_TITLE } from '@shared/copy/healingPlan';
import { findProduct } from '@shared/data';
import { selectPlan90, selectPlanDay, useAppStore } from '@shared/store';
import type { Habit } from '@shared/types/domain';
import { dayKey, nowFrom } from '@shared/utils';
import { ActionSheet, Button, Header, ListRow, Panel } from '@mobile/ui';
import { EmptyState, HabitRow } from '@mobile/patterns/health';
import { HealingPlanSection } from '@mobile/patterns/widgets';
import { useNav, useRoute } from '@mobile/navigation';
import styles from './NinetyDayPlan.module.css';

const PLAN_DAYS = 90;

export default function NinetyDayPlan() {
  const { pop, open, openAsk } = useNav();
  const { previousTitle } = useRoute();
  const profileId = useAppStore((s) => s.activeProfileId);
  const plan = useAppStore(selectPlan90);
  // Goal and habits come from a script; flag them until Deborah approves it.
  const placeholder = plan?.status !== 'approved' || undefined;
  const day = useAppStore(selectPlanDay) ?? 1;
  const today = useAppStore((s) => dayKey(nowFrom(s)));
  const [removing, setRemoving] = useState<Habit | null>(null);
  const product = findProduct(plan?.productId);
  const checkIn = () => openAsk({ mode: 'checkin' });
  const immediate = plan?.habits.slice(0, 2) ?? [];
  const longer = plan?.habits.slice(2) ?? [];

  return (
    <div className={styles.root} data-xref="M-7.3 · My Healing Plan">
      <Header title={HEALING_PLAN_TITLE} onBack={pop} backLabel={previousTitle} />
      <div className={styles.scroll}>
        {!plan ? (
          <div className={styles.body}>
            <EmptyState
              icon="calendar"
              text="Your healing plan appears after your first consultation with Deborah."
              actionLabel="Ask Deborah"
              actionIcon="deborah"
              onAction={() => openAsk({ focus: true })}
            />
          </div>
        ) : (
          <div className={styles.body}>
            <p className={styles.day}>{day > PLAN_DAYS ? `You finished your ${PLAN_DAYS} days` : `Day ${day} of ${PLAN_DAYS}`}</p>
            <Panel tone="linen" goldRule>
              <p className={styles.goalLabel}>Your goal, in Deborah’s words</p>
              <p className={styles.goal} data-placeholder={placeholder}>{plan.goal}</p>
            </Panel>

            <HealingPlanSection title="Immediate priorities" empty="No immediate actions yet.">
              {immediate.length > 0 && (
                <div className={styles.group} data-placeholder={placeholder}>
                  {immediate.map((h) => (
                    <HabitRow
                      key={h.id}
                      text={h.text}
                      done={h.doneDates.includes(today)}
                      source="from section 6"
                      onToggle={() => useAppStore.getState().toggleHabit(profileId, h.id, today)}
                      onLongPress={() => setRemoving(h)}
                    />
                  ))}
                </div>
              )}
            </HealingPlanSection>

            <HealingPlanSection title="Longer-term goals" empty="Longer-term goals appear as your plan grows.">
              {longer.length > 0 && (
                <div className={styles.group} data-placeholder={placeholder}>
                  {longer.map((h) => (
                    <HabitRow
                      key={h.id}
                      text={h.text}
                      done={h.doneDates.includes(today)}
                      source="from section 6"
                      onToggle={() => useAppStore.getState().toggleHabit(profileId, h.id, today)}
                      onLongPress={() => setRemoving(h)}
                    />
                  ))}
                </div>
              )}
            </HealingPlanSection>

            <HealingPlanSection title="Lifestyle areas" empty="Diet, exercise, sleep, and stress guidance will show here.">
              <p className={styles.hint} data-placeholder>Diet · Exercise · Sleep · Stress — personalized as consultations continue.</p>
            </HealingPlanSection>

            <HealingPlanSection title="Follow-ups" empty="No follow-ups scheduled.">
              <p className={styles.hint}>Check in with Deborah when you’re ready — no daily tracker required.</p>
            </HealingPlanSection>

            <section className={styles.section} aria-labelledby="plan-week">
              <h2 id="plan-week" className={styles.heading}>This week</h2>
              {plan.habits.length === 0 ? (
                <p className={styles.empty}>No habits on your plan right now. Deborah can suggest new ones at your next check-in.</p>
              ) : (
                <div className={styles.group} data-placeholder={placeholder}>
                  {plan.habits.map((h) => (
                    <HabitRow
                      key={h.id}
                      text={h.text}
                      done={h.doneDates.includes(today)}
                      source="from section 6"
                      onToggle={() => useAppStore.getState().toggleHabit(profileId, h.id, today)}
                      onLongPress={() => setRemoving(h)}
                    />
                  ))}
                </div>
              )}
              <p className={styles.hint}>Tap to mark today. Press and hold to remove.</p>
            </section>

            {product && (
              <div className={styles.group} data-placeholder={product.status === 'placeholder' || undefined}>
                <ListRow
                  leading={<img src={product.image} alt="" className={styles.productImage} />}
                  title={product.name}
                  subtitle={`Day ${Math.min(day, PLAN_DAYS)} of ${PLAN_DAYS}`}
                  trailing={<span className={styles.reorder}>Reorder →</span>}
                  onPress={() => open('M-2.7', { productId: product.id })}
                />
              </div>
            )}

            <Button fullWidth leadingIcon="deborah" onClick={checkIn}>Tell Deborah how it’s going</Button>
          </div>
        )}
      </div>
      <ActionSheet
        open={removing !== null}
        title={removing?.text}
        actions={[{ label: 'Remove habit', destructive: true, onSelect: () => removing && useAppStore.getState().removeHabit(profileId, removing.id) }]}
        onClose={() => setRemoving(null)}
      />
    </div>
  );
}
