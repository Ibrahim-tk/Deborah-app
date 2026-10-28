/** Mobile navigation public API for screens and hooks. */
import { lazy } from 'react';
export { RouteContext, useNav, useRoute, useScreenParams } from './useNav';
export { useNavStore } from './nav.store';
export { meta, registry } from './registry';
export type { Params, Route, TabId } from './types';
/** The widget lab (/wid): a design tool, loaded through navigation so the entry never imports screens. */
export const WidgetLabScreen = lazy(() => import('@mobile/screens/lab/WidgetLab'));
/** The design system (/design-system): every token and component, rendered live from this app's own code. */
export const DesignSystemScreen = lazy(() => import('@mobile/screens/lab/DesignSystem'));
/** Simple Home layout lab (/internal/home). */
export const SimpleHomeScreen = lazy(() => import('@mobile/screens/lab/SimpleHome'));
/** Tree sandbox (/internal/tree): onboarding profile with BloomTree2 and a dev panel. */
export const TreeLabScreen = lazy(() => import('@mobile/screens/lab/TreeLab'));
