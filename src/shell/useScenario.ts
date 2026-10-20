/** Scenario selection for the shell (State menu, Reset, ?scenario= URL). */
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { findScenario } from '@shared/scenarios';
import { clearSignup, loadScenario, restoreSignup } from '@shared/store';
import { useShellStore } from './shell.store';

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

  const reset = useCallback(() => {
    clearSignup();
    const result = loadScenario(scenarioId);
    const scenario = findScenario(scenarioId);
    showToast(result.ok ? `Reset: ${scenario?.label ?? scenarioId}` : result.error);
  }, [scenarioId, showToast]);

  return { scenarioId, scenario: findScenario(scenarioId), select, reset };
}
