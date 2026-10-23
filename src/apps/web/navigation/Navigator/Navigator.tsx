/**
 * @nav Navigator (web) — same story as mobile navigator: pre-auth / main stacks, sheets, modals.
 * Desktop: persistent Sidebar rail beside the stage (L-shell).
 */
import { useEffect, useRef } from 'react';
import { consentDoc } from '@shared/data';
import { useAppStore } from '@shared/store';
import { useDevice } from '@shell/device';
import { AnimatePresence, MotionDiv, OVERLAY_HOST_ID, useReducedMotionPref } from '@web/ui';
import { pageTransition } from '../transitions';
import { useNavStore } from '../nav.store';
import { meta } from '../registry';
import { BrandNav } from '@web/patterns/shell';
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
  const accountId = useAppStore((s) => s.accountId);
  const deepLink = useAppStore((s) => s.deepLink);
  const reconsentShown = useRef(false);

  useEffect(() => {
    if (scenario.loadNonce !== nav.appliedNonce) nav.applyStart(scenario.start, scenario.loadNonce);
  }, [scenario, nav]);

  // Guests may stay on main (guest chat). Only kick signed-in accounts missing consent.
  useEffect(() => {
    if (nav.root === 'main' && accountId && !consented) nav.resetTo('preauth', 'M-1.0');
  }, [nav, accountId, consented]);

  useEffect(() => {
    if (nav.root !== 'main' || !accountId || !consented || reconsentShown.current) return;
    if (consentVersion && consentVersion !== consentDoc.version) {
      reconsentShown.current = true;
      nav.presentModal('M-2.15');
    }
  }, [nav, accountId, consented, consentVersion]);

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
  const preauthTop = nav.root === 'preauth' ? nav.preauth.at(-1)?.id : undefined;
  /** Logo fade bar on preauth (skip Splash brand beat). */
  /** Logo-only bar after Hero; Hero owns full nav. Splash has its own brand beat. */
  const showBrandNav = Boolean(preauthTop && preauthTop !== 'M-1.0' && preauthTop !== 'M-1.1');
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
    <div
      className={styles.root}
      data-main={nav.root === 'main' || undefined}
      data-rail-collapsed={(nav.root === 'main' && nav.railCollapsed) || undefined}
    >
      <div ref={baseRef} className={styles.base}>
        {nav.root === 'main' && <Sidebar />}
        <AnimatePresence initial={false}>
          <MotionDiv
            key={nav.root}
            className={styles.rootView}
            data-tabbar={tabBarVisible || undefined}
            data-rail={nav.root === 'main' || undefined}
            // Standard web page change: old page leaves at once, new one fades in (no overlap, no slide).
            {...pageTransition(reduced)}
          >
            {nav.root === 'preauth' ? (
              <>
                {showBrandNav && <BrandNav />}
                <StackView routes={nav.preauth} action={nav.lastAction} container="stack" onBack={nav.pop} />
              </>
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
