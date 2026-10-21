/**
 * @screen  M-7.3 · My Healing Plan
 * @flow    F07 My Health hub
 * @states  empty (no plan) · document (clinical plan structure)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280
 * @spec    docs/ux/F07-my-health-hub.md#m-73--your-90-day-plan
 * @xref    web: W-7.3 (apps/web/screens/myhealth/NinetyDayPlan) — not built
 *
 * Document-style healing plan (header · clinical summary · conditions · to-do ·
 * five pillars · resources · signature), skinned with Oracle ui + tokens.
 */
import { HEALING_PLAN_TITLE } from '@shared/copy/healingPlan';
import { selectActiveProfile, selectPlan90, useAppStore } from '@shared/store';
import { Button, Header } from '@mobile/ui';
import { EmptyState } from '@mobile/patterns/health';
import { useNav, useRoute } from '@mobile/navigation';
import { PlanDocument } from './parts/PlanDocument';
import styles from './NinetyDayPlan.module.css';

export default function NinetyDayPlan() {
  const { pop, open, openAsk } = useNav();
  const { previousTitle } = useRoute();
  const plan = useAppStore(selectPlan90);
  const profile = useAppStore(selectActiveProfile);
  const patientName = profile?.name?.trim() || 'you';

  return (
    <div className={styles.root} data-xref="M-7.3 · My Healing Plan">
      <Header title={HEALING_PLAN_TITLE} onBack={pop} backLabel={previousTitle} />
      <div className={styles.scroll}>
        {!plan ? (
          <div className={styles.body}>
            <EmptyState
              icon="calendar"
              text="Your healing plan appears after your first consultation with Deborah."
              actionLabel="Ask Oracle"
              actionIcon="deborah"
              onAction={() => openAsk({ focus: true })}
            />
          </div>
        ) : (
          <div className={styles.body}>
            <PlanDocument
              patientName={patientName}
              onShopProduct={(productId) => open('M-2.7', { productId })}
              onOpenExternal={(url, title) => open('M-2.7', { url, title })}
            />
            <Button fullWidth leadingIcon="deborah" onClick={() => openAsk({ mode: 'checkin' })}>
              Tell Deborah how it’s going
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
