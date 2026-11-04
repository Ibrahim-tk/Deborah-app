/** @nav AdminNavigator — signed out: the auth step. Signed in: navigation + the current page.
 *  Desktop: sidebar. Tablet (≤ 1024px): icon rail. Phone (≤ 640px): top bar + navigation sheet. */
import { useEffect, useRef } from 'react';
import { useAdminNotifications, useAdminStore } from '@shared/admin';
import SignIn from '@admin/screens/auth/SignIn';
import ForgotPassword from '@admin/screens/auth/ForgotPassword';
import TwoFactor from '@admin/screens/auth/TwoFactor';
import { AdminSidebar } from '../AdminSidebar';
import { AdminTopBar } from '../AdminTopBar';
import { NavSheet } from '../NavSheet';
import { useAdminNav, useAdminRoute } from '../nav.store';
import { REGISTRY } from '../registry';
import { DRAWERS } from '../drawers';
import { DrawerPresence } from '@admin/ui';
import styles from './AdminNavigator.module.css';

const AUTH = { signIn: SignIn, forgot: ForgotPassword, twoFactor: TwoFactor };

export function AdminNavigator() {
  const signedIn = useAdminStore((s) => s.signedIn);
  const auth = useAdminNav((s) => s.auth);
  const route = useAdminRoute();
  const depth = useAdminNav((s) => s.stack.length);
  const drawer = useAdminNav((s) => s.drawer);
  const closing = useAdminNav((s) => s.drawerClosing);
  const finishClose = useAdminNav((s) => s.finishDrawerClose);
  const scroller = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const layout = useAdminNav((s) => s.layout);

  // Measure the admin stage (not the window), so it adapts the same inside any prototype frame.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const next = w <= 640 ? 'phone' : w <= 1024 ? 'tablet' : 'desktop';
      if (useAdminNav.getState().layout !== next) useAdminNav.getState().setLayout(next);
      if (next !== 'phone' && useAdminNav.getState().navOpen) useAdminNav.getState().setNavOpen(false);
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  // A new page starts at the top.
  useEffect(() => scroller.current?.scrollTo({ top: 0 }), [route, depth]);

  // Simulated arrival: a support request comes in shortly after sign-in, so the bell visibly updates.
  useEffect(() => {
    if (!signedIn) return;
    const t = setTimeout(() => {
      useAdminNotifications.getState().post({ category: 'support', kind: 'support_request', title: 'New support request', body: '"Can I change my plan to yearly?" (billing).', audience: 'all', severity: 'normal', target: { section: 'support' } });
    }, 40_000);
    return () => clearTimeout(t);
  }, [signedIn]);

  if (!signedIn) {
    const Auth = AUTH[auth];
    return <Auth />;
  }

  const { screenId, component: Screen } = REGISTRY[route.id];
  return (
    <div ref={rootRef} className={styles.root} data-layout={layout}>
      {layout === 'phone' ? (
        <>
          <AdminTopBar />
          <NavSheet />
        </>
      ) : (
        <AdminSidebar />
      )}
      <div ref={scroller} className={styles.stage} data-screen-id={screenId}>
        <Screen key={JSON.stringify(route)} {...route} />
      </div>
      {drawer && (
        <DrawerPresence.Provider value={{ open: !closing, onExited: finishClose }}>
          <ActiveDrawer key={`${drawer.kind}:${drawer.id}`} kind={drawer.kind} id={drawer.id} />
        </DrawerPresence.Provider>
      )}
    </div>
  );
}

function ActiveDrawer({ kind, id }: { kind: keyof typeof DRAWERS; id: string | null }) {
  const Drawer = DRAWERS[kind];
  return <Drawer id={id} />;
}
