/** Renders one route: Suspense for the lazy screen + RouteContext for params and back labels. */
import { Suspense, useMemo } from 'react';
import { meta } from '../registry';
import { RouteContext, type RouteContextValue } from '../useNav';
import type { Route } from '../types';

export interface ScreenHostProps {
  route: Route;
  previous?: Route;
  container: RouteContextValue['container'];
}

export function ScreenHost({ route, previous, container }: ScreenHostProps) {
  const m = meta(route.id);
  const value = useMemo<RouteContextValue>(
    () => ({ route, previousTitle: previous ? meta(previous.id)?.title : undefined, canGoBack: Boolean(previous), container }),
    [route, previous, container],
  );
  if (!m) return null;
  const Screen = m.component;
  return (
    <RouteContext.Provider value={value}>
      <Suspense fallback={null}>
        <Screen />
      </Suspense>
    </RouteContext.Provider>
  );
}
