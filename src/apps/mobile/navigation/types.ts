/** Navigation types (docs/04-navigation.md §2–4). */
import type { ComponentType, LazyExoticComponent } from 'react';
import type { TabId } from '@shared/types/scenario';

export type { TabId };
export type Params = Record<string, string | number | boolean | undefined>;

export interface Route {
  key: string;
  id: string;
  params?: Params;
}

export type Presentation = 'root' | 'tabRoot' | 'push' | 'sheet' | 'modal';

export interface ScreenMeta {
  title: string;
  component: LazyExoticComponent<ComponentType>;
  presentation: Presentation;
  tab?: TabId;
  stack?: 'preauth' | 'main';
  detent?: 'medium' | 'large';
  /** Sheets: false disables scrim tap and drag-to-dismiss. */
  dismissible?: boolean;
  tabBar?: boolean;
  statusBar?: 'dark' | 'light';
  figma: string;
  spec: string;
  /** Not built yet: rendered by the Planned placeholder, arriving in this phase. */
  planned?: number;
}

export type Layer =
  | { kind: 'sheet'; key: string; route: Route; detent: 'medium' | 'large'; dismissible: boolean }
  | { kind: 'modal'; key: string; routes: Route[] };

export type NavAction = 'push' | 'pop' | 'replace' | 'fade' | 'reset' | 'tab';
