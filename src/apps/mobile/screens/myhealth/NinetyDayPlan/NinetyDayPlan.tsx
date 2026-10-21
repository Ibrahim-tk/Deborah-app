/**
 * @screen  M-7.3 · My Healing Plan
 * @flow    F07 My Health hub
 * @states  empty (no plan) · document (one plan: newest concern, medicine box, letter)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280
 * @spec    docs/ux/F07-my-health-hub.md#m-73--your-90-day-plan
 * @xref    web: W-7.3 (apps/web/screens/myhealth/NinetyDayPlan) — not built
 *
 * One plan per person. New concerns lead; the clinical letter stays underneath.
 */
import { HEALING_PLAN_TITLE } from '@shared/copy/healingPlan';
import { guardrailsData } from '@shared/data';
import { careTeamFromNotes, profileHasMedicines, withConcerns } from '@shared/engine/planConcerns';
import { selectActiveProfile, selectPlan90, selectProfileNotes, useAppStore, type AppState } from '@shared/store';
import { Button, Header, useAlert } from '@mobile/ui';
import { EmptyState } from '@mobile/patterns/health';
import { useNav, useRoute } from '@mobile/navigation';
import { PlanDocument } from './parts/PlanDocument';
import styles from './NinetyDayPlan.module.css';

/** Primitive snapshots. Arrays and plan objects are new references often enough to loop useSyncExternalStore. */
function selectPlanKey(s: AppState): string {
  const plan = selectPlan90(s);
  if (!plan) return '';
  return `${plan.startDate}|${(plan.concerns ?? []).map((c) => `${c.id}:${c.status}:${c.actions.map((a) => (a.done ? 1 : 0)).join('')}`).join(';')}`;
}

function selectCareTeam(s: AppState): string {
  return careTeamFromNotes(selectProfileNotes(s));
}

export default function NinetyDayPlan() {
  const { pop, open, openAsk } = useNav();
  const { previousTitle } = useRoute();
  const alert = useAlert();
  const planKey = useAppStore(selectPlanKey);
  const profile = useAppStore(selectActiveProfile);
  const careTeam = useAppStore(selectCareTeam);
  const plan = planKey ? selectPlan90(useAppStore.getState()) : undefined;
  const patientName = profile?.name?.trim() || 'you';
  const advocate = Boolean(profile && profile.relationship !== 'self');
  const concerns = plan ? withConcerns(plan).concerns ?? [] : [];
  const hasMedicines = profileHasMedicines(profile);

  const toggle = (concernId: string, actionId: string) => {
    if (!profile) return;
    useAppStore.getState().togglePlanAction(profile.id, concernId, actionId);
  };

  const resolve = async (concernId: string) => {
    if (!profile) return;
    const concern = concerns.find((c) => c.id === concernId);
    const choice = await alert({
      title: 'This concern is resolved?',
      message: concern
        ? `${concern.title} leaves the active plan. Deborah still keeps it with your history.`
        : 'It leaves the active plan. Deborah still keeps it with your history.',
      buttons: [{ label: 'Not yet', style: 'cancel' }, { label: 'It’s resolved' }],
    });
    if (choice !== 1) return;
    useAppStore.getState().resolvePlanConcern(profile.id, concernId);
  };

  return (
    <div className={styles.root} data-xref="M-7.3 · My Healing Plan">
      <Header title={HEALING_PLAN_TITLE} onBack={pop} backLabel={previousTitle} />
      <div className={styles.scroll}>
        {!plan ? (
          <div className={styles.body}>
            <EmptyState
              icon="calendar"
              text={advocate ? `What are your concerns for ${patientName}?` : 'Your healing plan appears after your first consultation with Deborah.'}
              actionLabel="Ask Oracle"
              actionIcon="deborah"
              onAction={() => openAsk({ focus: true })}
            />
          </div>
        ) : (
          <div className={styles.body}>
            <PlanDocument
              patientName={patientName}
              advocate={advocate}
              concerns={concerns}
              careTeam={careTeam || undefined}
              hasMedicines={hasMedicines}
              onToggle={toggle}
              onResolve={(id) => void resolve(id)}
              onCheckInteractions={() => open('M-2.7', { url: guardrailsData.medication.interactionLink.url, title: 'Drug interaction checker' })}
              onShopProduct={(productId) => open('M-2.7', { productId })}
              onOpenExternal={(url, title) => open('M-2.7', { url, title })}
            />
            <Button fullWidth leadingIcon="deborah" onClick={() => openAsk({ mode: 'checkin' })}>
              {advocate ? `Tell Deborah how ${patientName} is doing` : 'Tell Deborah how it’s going'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
