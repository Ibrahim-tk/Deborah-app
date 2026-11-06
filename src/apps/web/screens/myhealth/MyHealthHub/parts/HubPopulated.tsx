/** M-7.2 — populated hub (Home hierarchy, 2026-10-21): healing plan (Home dot card) · symptoms map · check-in · health profile. */
import { useMemo } from 'react';
import { CheckInCard, SymptomMapCard } from '@web/patterns/health';
import { FLAGS } from '@shared/flags';
import { resolveSymptomMap, summarizeSymptomMap } from '@shared/engine';
import { HealingPlanCard } from '@web/patterns/widgets';
import { selectActiveProfile, selectIsTeenAccount, useAppStore } from '@shared/store';
import { useNav } from '@web/navigation';
import { useHubData } from '@web/screens/myhealth/useHubData';
import { HealthDetails } from './HealthDetails';
import { useAccountGate } from '@web/hooks/useAccountGate';

export function HubPopulated() {
  const { push, openAsk } = useNav();
  const gate = useAccountGate();
  const { plan, checkIn, upcoming } = useHubData();
  // Teen accounts have no Wellness Plan (F06 teen invite).
  const teen = useAppStore(selectIsTeenAccount);
  // Symptoms map entry (M-7.9): same merge as the map — health profile + this profile's chats.
  const profile = useAppStore(selectActiveProfile);
  const byId = useAppStore((s) => s.conversations.byId);
  const mapSummary = useMemo(() => {
    const conversations = Object.values(byId).filter((c) => c.profileId === profile?.id);
    return summarizeSymptomMap(resolveSymptomMap(profile, conversations, FLAGS.symptomMapDemo)).sentence || 'See how symptoms can share one root.';
  }, [byId, profile]);

  return (
    <>
      {/* Focus card removed from My Health (designer, 2026-10-21); the last conversation lives on Home. */}
      {plan && !teen && (
        <HealingPlanCard
          concern={plan.concern}
          done={plan.done}
          total={plan.total}
          onPress={() => gate('journey', () => push('M-7.3'))}
        />
      )}
      <SymptomMapCard summary={mapSummary} onPress={() => push('M-7.9')} />
      <CheckInCard state={checkIn} upcoming={upcoming} onCheckIn={() => openAsk({ mode: 'checkin' })} onReminders={() => push('M-10.4')} />
      {/* History and Visit Notes live on My Notes (M-9.1), not here (design 2026-10-20). */}
      {/* Design request 2026-10-20: the health profile lives here (lab reports removed 2026-10-28). */}
      <HealthDetails />
      {/* "For you from the Oracle" and the library link removed from My Health (designer, 2026-10-21). */}
    </>
  );
}
