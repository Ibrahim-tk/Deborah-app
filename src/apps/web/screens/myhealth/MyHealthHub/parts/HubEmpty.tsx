/** M-7.1 — first time: complete-your-intake card (as on Home), health profile. */
import { selectActiveProfile, useAppStore } from '@shared/store';
import { IntakeCompletionCard } from '@web/patterns/widgets';
import { healthProfileCompletion } from '@web/screens/onboarding/HealthBasics/healthProfile';
import { useNav } from '@web/navigation';
import { HealthDetails } from './HealthDetails';

export function HubEmpty() {
  const { push } = useNav();
  const profile = useAppStore(selectActiveProfile);
  const progress = profile ? healthProfileCompletion(profile) : 0;

  return (
    <>
      {/* Designer, 2026-10-21: no empty block or "Start my first consultation" — the Home intake card instead. */}
      {progress < 1 && <IntakeCompletionCard progress={progress} onAction={() => push('M-2.14')} />}
      {/* Design request 2026-10-20: My Health holds the health profile (lab reports removed 2026-10-28). */}
      <HealthDetails />
      {/* "Popular starting points" removed (designer, 2026-10-21): not offered. */}
    </>
  );
}
