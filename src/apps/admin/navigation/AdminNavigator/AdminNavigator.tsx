/** @nav AdminNavigator — signed out: the auth step. Signed in: sidebar + the top route of the stack. */
import { useEffect, useRef } from 'react';
import { useAdminStore } from '@shared/admin';
import SignIn from '@admin/screens/auth/SignIn';
import ForgotPassword from '@admin/screens/auth/ForgotPassword';
import TwoFactor from '@admin/screens/auth/TwoFactor';
import { AdminSidebar } from '../AdminSidebar';
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

  // A new page starts at the top.
  useEffect(() => scroller.current?.scrollTo({ top: 0 }), [route, depth]);

  if (!signedIn) {
    const Auth = AUTH[auth];
    return <Auth />;
  }

  const { screenId, component: Screen } = REGISTRY[route.id];
  return (
    <div className={styles.root}>
      <AdminSidebar />
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
