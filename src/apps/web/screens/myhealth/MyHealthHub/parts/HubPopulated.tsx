/** M-7.2 — populated hub (Home hierarchy, 2026-10-21): healing plan (Home dot card) · check-in · health profile. */
import { CheckInCard } from '@web/patterns/health';
import { HealingPlanCard } from '@web/patterns/widgets';
import { useNav } from '@web/navigation';
import { useHubData } from '@web/screens/myhealth/useHubData';
import { HealthDetails } from './HealthDetails';
import { useAccountGate } from '@web/hooks/useAccountGate';

export function HubPopulated() {
  const { push, openAsk } = useNav();
  const gate = useAccountGate();
  const { plan, checkIn, upcoming } = useHubData();


  return (
    <>
      {/* Focus card removed from My Health (designer, 2026-10-21); the last conversation lives on Home. */}
      {plan && (
        <HealingPlanCard
          concern={plan.concern}
          done={plan.done}
          total={plan.total}
          onPress={() => gate('journey', () => push('M-7.3'))}
        />
      )}
      <CheckInCard state={checkIn} upcoming={upcoming} onCheckIn={() => openAsk({ mode: 'checkin' })} onReminders={() => push('M-10.4')} />
      {/* History and Visit Notes live on My Notes (M-9.1), not here (design 2026-10-20). */}
      {/* Design request 2026-10-20: the health profile lives here; labs and documents have their own tab. */}
      <HealthDetails />
      {/* "For you from Deborah" and the library link removed from My Health (designer, 2026-10-21). */}
    </>
  );
}
