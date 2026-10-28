/**
 * @screen  LAB · Tree sandbox (route /internal/tree) — not a product screen
 * @flow    — BloomTree2 build-out (tree plan Phase 0): the real onboarding profile (M-1.8) with the new tree on
 * @states  live form · progress override · gust · pluck · reduced motion
 * @spec    tools/tree-assets/README.md
 * @xref    web: — not built
 *
 * Mounts the real HealthBasics screen with `useNewTree` switched on, so the tree is judged in its true
 * context (questions, backdrop, type), plus a dev panel outside the phone. The flag resets on leave.
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RouteContext } from '@mobile/navigation';
import HealthBasics from '@mobile/screens/onboarding/HealthBasics';
import { useTreeDev } from '@mobile/screens/onboarding/HealthBasics/parts/BloomReveal2';
import { DevPanel } from './DevPanel';

// A stand-in route so the screen's navigation hooks work outside the Navigator (opens on basic details).
const ROUTE = { route: { key: 'tree-lab', id: 'M-1.8', params: { start: 'details' } }, canGoBack: false, container: 'stack' } as const;

export default function TreeLab() {
  useEffect(() => {
    useTreeDev.getState().set({ useNewTree: true });
    return () => useTreeDev.getState().set({ useNewTree: false, progressOverride: null, reduceMotion: null });
  }, []);
  return (
    <>
      <RouteContext.Provider value={ROUTE}>
        <HealthBasics />
      </RouteContext.Provider>
      {createPortal(<DevPanel />, document.body)}
    </>
  );
}
