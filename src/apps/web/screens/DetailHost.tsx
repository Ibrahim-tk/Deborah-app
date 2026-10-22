/**
 * Desktop master–detail: embed a push-detail screen inside a list host.
 * Back/clear goes to the host, not nav.pop (which would leave the list screen).
 */
import { createContext, useContext, type ReactNode } from 'react';
import { RouteContext, type RouteContextValue } from '@web/navigation/useNav';
import type { Params, Route } from '@web/navigation/types';

export interface DetailHostValue {
  clear: () => void;
}

const DetailHostContext = createContext<DetailHostValue | null>(null);

export function useDetailHost(): DetailHostValue | null {
  return useContext(DetailHostContext);
}

export function DetailHostProvider({
  screenId,
  params,
  onClear,
  previousTitle = 'Back',
  children,
}: {
  screenId: string;
  params: Params;
  onClear: () => void;
  previousTitle?: string;
  children: ReactNode;
}) {
  const route: Route = { key: `embed-${screenId}`, id: screenId, params };
  const routeValue: RouteContextValue = {
    route,
    previousTitle,
    canGoBack: true,
    container: 'stack',
  };
  return (
    <DetailHostContext.Provider value={{ clear: onClear }}>
      <RouteContext.Provider value={routeValue}>{children}</RouteContext.Provider>
    </DetailHostContext.Provider>
  );
}
