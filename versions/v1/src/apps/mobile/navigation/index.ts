/** Mobile navigation public API for screens and hooks. */
import { lazy } from 'react';
export { useNav, useRoute, useScreenParams } from './useNav';
export { useNavStore } from './nav.store';
export { meta, registry } from './registry';
export type { Params, Route, TabId } from './types';
/** The widget lab (/wid): a design tool, loaded through navigation so the entry never imports screens. */
export const WidgetLabScreen = lazy(() => import('@flow-v1/apps/mobile/screens/lab/WidgetLab'));
/** The design system (/design-system): every token and component, rendered live from this app's own code. */
export const DesignSystemScreen = lazy(() => import('@flow-v1/apps/mobile/screens/lab/DesignSystem'));
