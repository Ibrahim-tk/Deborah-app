/**
 * @nav Navigator (web) — same story as mobile navigator: pre-auth / main stacks, sheets, modals.
 * Desktop: persistent Sidebar rail beside the stage (L-shell).
 */
import { useEffect, useRef } from 'react';
import { consentDoc } from '@shared/data';
import { useAppStore } from '@shared/store';
import { useDevice } from '@shell/device';
import { AnimatePresence, DURATION, MotionDiv, OVERLAY_HOST_ID, useReducedMotionPref } from '@web/ui';
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
  const consentVersion = useAppStore((s) => s.consentVersion);
  const deepLink = useAppStore((s) => s.deepLink);
  const reconsentShown = useRef(false);

  useEffect(() => {
    if (scenario.loadNonce !== nav.appliedNonce) nav.applyStart(scenario.start, scenario.loadNonce);
  }, [scenario, nav]);

  useEffect(() => {
    if (nav.root === 'main' && !consented) nav.resetTo('preauth', 'M-1.1');
  }, [nav, consented]);

  useEffect(() => {
    if (nav.root !== 'main' || !consented || reconsentShown.current) return;
    if (consentVersion && consentVersion !== consentDoc.version) {
      reconsentShown.current = true;
      nav.presentModal('M-2.15');
    }
  }, [nav, consented, consentVersion]);

  useEffect(() => {
    if (!deepLink) return;
    useAppStore.getState().clearDeepLink();
    if (consented) nav.openDeepLink(deepLink.link);
  }, [deepLink, consented, nav]);

  const front = nav.root === 'preauth' ? nav.preauth : nav.tabs[nav.activeTab];
  const topLayer = nav.layers[nav.layers.length - 1];
  const visibleRoute: Route | undefined =
    topLayer?.kind === 'sheet' ? topLayer.route : topLayer?.kind === 'modal' ? topLayer.routes.at(-1) : front.at(-1);

  useEffect(() => {
    const m = visibleRoute && meta(visibleRoute.id);
    setScreen(
      m && visibleRoute
        ? { id: visibleRoute.id, title: m.planned ? `${m.title} (planned)` : m.title, statusBarStyle: m.statusBar ?? 'dark' }
        : null,
    );
  }, [visibleRoute, setScreen]);

  const tabBarVisible = false;
  const overlayOpen = nav.layers.length > 0;
  const baseRef = useRef<HTMLDivElement>(null);
  // Desktop: keep the stage still under a dialog (no iOS card shrink).
  // `inert` not in React 18 typings — set the DOM attribute directly.
  useEffect(() => {
    const el = baseRef.current;
    if (!el) return;
    if (overlayOpen) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  }, [overlayOpen]);

  return (
    <div className={styles.root} data-main={nav.root === 'main' || undefined}>
      <div ref={baseRef} className={styles.base}>
        {nav.root === 'main' && <Sidebar />}
        <AnimatePresence initial={false}>
          <MotionDiv
            key={nav.root}
            className={styles.rootView}
            data-tabbar={tabBarVisible || undefined}
            data-rail={nav.root === 'main' || undefined}
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
                  homeBackdrop
                />
              ))
            )}
          </MotionDiv>
        </AnimatePresence>
      </div>
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
