/** useNav() — navigation API for screens (docs/04-navigation.md §4). */
import { createContext, useContext } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { meta } from './registry';
import { useNavStore } from './nav.store';
import type { Params, Route } from './types';

export function useNav() {
  const api = useNavStore(
    useShallow((s) => ({
      push: s.push,
      pop: s.pop,
      popToRoot: s.popToRoot,
      replace: s.replace,
      switchTab: s.switchTab,
      presentSheet: s.presentSheet,
      dismissSheet: s.dismissSheet,
      presentModal: s.presentModal,
      dismissModal: s.dismissModal,
      resetTo: s.resetTo,
      openDeepLink: s.openDeepLink,
      returnToConversation: s.returnToConversation,
      switchProfile: s.switchProfile,
      openAsk: s.openAsk,
      setSidebarOpen: s.setSidebarOpen,
    })),
  );
  /** Open a screen with the presentation its registry entry declares. */
  const open = (id: string, params?: Params) => {
    const p = meta(id)?.presentation;
    if (p === 'sheet') api.presentSheet(id, params);
    else if (p === 'modal') api.presentModal(id, params);
    else api.push(id, params);
  };
  return { ...api, open };
}

export interface RouteContextValue {
  route: Route;
  /** Title of the screen below this one in its stack (for the back label). */
  previousTitle?: string;
  canGoBack: boolean;
  container: 'stack' | 'sheet' | 'modal';
}

export const RouteContext = createContext<RouteContextValue | null>(null);

export function useRoute(): RouteContextValue {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error('useRoute() must be used inside a navigator screen');
  return ctx;
}

export function useScreenParams<T extends Params>(): Partial<T> {
  return (useRoute().route.params ?? {}) as Partial<T>;
}
