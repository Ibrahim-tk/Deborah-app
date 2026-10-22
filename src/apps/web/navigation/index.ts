/** Mobile navigation public API for screens and hooks. */
import { lazy } from 'react';
export { useNav, useRoute, useScreenParams } from './useNav';
export { useNavStore } from './nav.store';
export { meta, registry } from './registry';
export type { Params, Route, TabId } from './types';
/** The widget lab (/wid): a design tool, loaded through navigation so the entry never imports screens. */
export const WidgetLabScreen = lazy(() => import('@web/screens/lab/WidgetLab'));
/** The design system (/design-system): every token and component, rendered live from this app's own code. */
export const DesignSystemScreen = lazy(() => import('@web/screens/lab/DesignSystem'));
/** Simple Home layout lab (/internal/home). */
export const SimpleHomeScreen = lazy(() => import('@web/screens/lab/SimpleHome'));
