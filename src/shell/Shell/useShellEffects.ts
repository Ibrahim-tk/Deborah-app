/** Global shell side effects: dev-toggle classes on <html>, ?scenario= on open, last web route. */
import { useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@shared/store';
import { useShellStore } from '../shell.store';
import { useScenario } from '../useScenario';

export function useShellEffects() {
  const toggles = useShellStore((s) => s.toggles);
  const setLastWebPath = useShellStore((s) => s.setLastWebPath);
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const { scenarioId, select } = useScenario();
  const handledUrl = useRef(false);

  useEffect(() => {
    const html = document.documentElement.classList;
    html.toggle('reduced-motion', toggles.reducedMotion);
    html.toggle('highlight-placeholders', toggles.highlightPlaceholders);
    html.toggle('show-ids', toggles.showIds);
  }, [toggles.reducedMotion, toggles.highlightPlaceholders, toggles.showIds]);

  // The engine bridge reads network speed from the app store's (non-persisted) dev slice.
  useEffect(() => {
    useAppStore.getState().setDev({ speed: toggles.network });
  }, [toggles.network]);

  // Nothing is stored, so every page load starts the scenario fresh: `?scenario=S04` or the default.
  useEffect(() => {
    if (handledUrl.current) return;
    handledUrl.current = true;
    const fromUrl = params.get('scenario');
    select(fromUrl ?? scenarioId);
  }, [params, scenarioId, select]);

  useEffect(() => {
    if (pathname.startsWith('/web')) setLastWebPath(pathname);
  }, [pathname, setLastWebPath]);
}
