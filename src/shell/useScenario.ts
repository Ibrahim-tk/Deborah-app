/** Scenario selection for the shell (State menu, Reset, ?scenario= URL). */
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { findScenario } from '@shared/scenarios';
import { clearSignup, loadScenario, restoreSignup } from '@shared/store';
import { useShellStore } from './shell.store';

/** The brand-new user, opening on the splash. */
const FIRST_RUN_SCENARIO = 'S01';

export function useScenario() {
  const [, setParams] = useSearchParams();
  const scenarioId = useShellStore((s) => s.scenarioId);
  const setScenario = useShellStore((s) => s.setScenario);
  const showToast = useShellStore((s) => s.showToast);

  const select = useCallback(
    (id: string, opts?: { restore?: boolean }) => {
      const scenario = findScenario(id);
      // A page load picks a saved sign-up back up; any explicit pick starts the scenario fresh.
      if (opts?.restore && scenario && restoreSignup(id)) {
        setScenario(id);
        return;
      }
      clearSignup();
      const result = loadScenario(id);
      if (!scenario || !result.ok) {
        showToast(result.ok ? `Unknown scenario: ${id}` : result.error);
        return;
      }
      setScenario(id);
      setParams((p) => {
        p.set('scenario', id);
        return p;
      }, { replace: true });
      showToast(`Loaded: ${scenario.group} — ${scenario.label}`);
    },
    [setParams, setScenario, showToast],
  );

  // Reset = start over (designer, 2026-10-21): first-run scenario from the splash, via a full reload so every
  // in-memory screen, sheet and timer is gone. Toggles live in the shell store and are kept.
  const reset = useCallback(() => {
    clearSignup();
    loadScenario(FIRST_RUN_SCENARIO);
    setScenario(FIRST_RUN_SCENARIO);
    const url = new URL(window.location.href);
    url.searchParams.set('scenario', FIRST_RUN_SCENARIO);
    window.location.assign(url.toString());
  }, [setScenario]);

  return { scenarioId, scenario: findScenario(scenarioId), select, reset };
}
