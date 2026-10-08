/**
 * @nav Navigator — renders the pre-auth stack or Main (per-tab stacks + tab bar), then sheet and
 * modal layers in z-order, toasts and the overlay host. Applies scenario starts, guards
 * onboarding, and reports the top-most screen to the shell caption.
 */
import { useEffect } from 'react';
import { useAppStore } from '@shared/store';
import { useDevice } from '@shell/device';
import { AnimatePresence, DURATION, EASE_IOS, MotionDiv, OVERLAY_HOST_ID, useReducedMotionPref } from '@mobile/ui';
import { useNavStore } from '../nav.store';
import { meta } from '../registry';
import { Sidebar } from '../Sidebar';
import type { Route, TabId } from '../types';
import { ModalLayer, SheetLayer } from './Layers';
import { StackView } from './StackView';
import { ToastHost } from './ToastHost';
import styles from './Navigator.module.css';

const TAB_IDS: TabId[] = ['ask', 'health', 'account'];

export function Navigator() {
  const nav = useNavStore();
  const reduced = useReducedMotionPref();
  const { setScreen } = useDevice();
  const scenario = useAppStore((s) => s.scenario);
  const consented = useAppStore((s) => Boolean(s.consentAcceptedAt));
  const deepLink = useAppStore((s) => s.deepLink);

  // A freshly loaded scenario resets the navigator to its start.
  useEffect(() => {
    if (scenario.loadNonce !== nav.appliedNonce) nav.applyStart(scenario.start, scenario.loadNonce);
  }, [scenario, nav]);

  // Onboarding cannot be skipped: Main is unreachable until consent exists (04 §7).
  useEffect(() => {
    if (nav.root === 'main' && !consented) nav.resetTo('preauth', 'M-1.1');
  }, [nav, consented]);

  // Deep links requested by the shell (lock screen card, notification banner).
  useEffect(() => {
    if (!deepLink) return;
    useAppStore.getState().clearDeepLink();
    // Before consent the app can't open anything but onboarding.
    if (consented) nav.openDeepLink(deepLink.link);
  }, [deepLink, consented, nav]);

  const front = nav.root === 'preauth' ? nav.preauth : nav.tabs[nav.activeTab];
  const topLayer = nav.layers[nav.layers.length - 1];
  const visibleRoute: Route | undefined =
    topLayer?.kind === 'sheet' ? topLayer.route : topLayer?.kind === 'modal' ? topLayer.routes.at(-1) : front.at(-1);

  useEffect(() => {
    const m = visibleRoute && meta(visibleRoute.id);
    setScreen(m && visibleRoute ? { id: visibleRoute.id, title: m.planned ? `${m.title} (planned)` : m.title, statusBarStyle: m.statusBar ?? 'dark' } : null);
  }, [visibleRoute, setScreen]);

  const hasModal = nav.layers.some((l) => l.kind === 'modal');
  // The bottom tab bar is replaced by the Sidebar drawer (design direction 2026-10-08).
  const tabBarVisible = false;

  // iOS card style: the content behind a modal shrinks and rounds.
  const behindModal = hasModal && !reduced ? { scale: 0.94, y: 10, borderRadius: 24 } : { scale: 1, y: 0, borderRadius: 0 };

  return (
    <div className={styles.root}>
      <MotionDiv className={styles.base} animate={behindModal} transition={{ duration: DURATION.modal, ease: EASE_IOS }}>
        <AnimatePresence initial={false}>
          <MotionDiv
            key={nav.root}
            className={styles.rootView}
            data-tabbar={tabBarVisible || undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? DURATION.reduced : DURATION.fade }}
          >
            {nav.root === 'preauth' ? (
              <StackView routes={nav.preauth} action={nav.lastAction} container="stack" onBack={nav.pop} />
            ) : (
              TAB_IDS.map((tab) => (
                <StackView
                  key={tab}
                  routes={nav.tabs[tab]}
                  action={tab === nav.activeTab ? nav.lastAction : 'tab'}
                  container="stack"
                  onBack={nav.pop}
                  active={tab === nav.activeTab}
                />
              ))
            )}
            {nav.root === 'main' && <Sidebar />}
          </MotionDiv>
        </AnimatePresence>
      </MotionDiv>
      <AnimatePresence>
        {nav.layers.map((layer) =>
          layer.kind === 'sheet' ? <SheetLayer key={layer.key} layer={layer} /> : <ModalLayer key={layer.key} layer={layer} action={nav.lastAction} />,
        )}
      </AnimatePresence>
      <ToastHost lifted={tabBarVisible} overComposer={!topLayer && visibleRoute?.id === 'M-2.1'} />
      <div id={OVERLAY_HOST_ID} className={styles.overlayHost} />
    </div>
  );
}
