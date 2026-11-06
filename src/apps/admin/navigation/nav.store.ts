/** Admin navigator: section switch resets the stack; detail pages push on top. */
import { create } from 'zustand';
import type { AdminRoute, AuthStep, DrawerTarget, SectionId } from './types';

interface AdminNavState {
  stack: AdminRoute[];
  auth: AuthStep;
  railCollapsed: boolean;
  /** Width class of the admin stage: phone ≤ 640, tablet ≤ 1024 (measured by AdminNavigator). */
  layout: 'desktop' | 'tablet' | 'phone';
  setLayout: (layout: 'desktop' | 'tablet' | 'phone') => void;
  /** Phone only: the navigation sheet is open. */
  navOpen: boolean;
  /** Which Settings tab shows. */
  settingsTab: 'profile' | 'security' | 'notifications';
  openSettings: (tab: 'profile' | 'security' | 'notifications') => void;
  setNavOpen: (open: boolean) => void;
  /** Sign-out asks first (story 12.1): true while the confirm is showing. */
  confirmingSignOut: boolean;
  setConfirmingSignOut: (open: boolean) => void;
  /** Side drawer over the current page (one at a time): any record a table row opens. */
  drawer: DrawerTarget | null;
  openDrawer: (target: DrawerTarget) => void;
  /** Opens a notification's record (drawer) or section page. */
  openTarget: (target: { kind: string; id: string } | { section: string }) => void;
  openClient: (id: string) => void;
  openEscalation: (id: string) => void;
  closeDrawer: () => void;
  /** True while the drawer plays its slide-out; `finishDrawerClose` removes it after. */
  drawerClosing: boolean;
  finishDrawerClose: () => void;
  /** Table filter state per list (search, filters, quick filter, sort), kept while drawers open and close;
   *  cleared when the admin moves to another section. */
  filters: Record<string, unknown>;
  setFilters: (key: string, value: unknown) => void;
  go: (section: SectionId) => void;
  push: (route: AdminRoute) => void;
  pop: () => void;
  setAuth: (step: AuthStep) => void;
  setRailCollapsed: (v: boolean) => void;
}

const RAIL_KEY = 'admin.railCollapsed';
const readCollapsed = () => {
  try {
    return localStorage.getItem(RAIL_KEY) === '1';
  } catch {
    return false;
  }
};

export const useAdminNav = create<AdminNavState>((set) => ({
  stack: [{ id: 'dashboard' }],
  auth: 'signIn',
  railCollapsed: readCollapsed(),
  layout: 'desktop',
  setLayout: (layout) => set({ layout }),
  navOpen: false,
  settingsTab: 'profile',
  confirmingSignOut: false,
  setConfirmingSignOut: (confirmingSignOut) => set({ confirmingSignOut, navOpen: false }),
  openSettings: (settingsTab) => set({ settingsTab, stack: [{ id: 'settings' }], drawer: null, navOpen: false, filters: {} }),
  setNavOpen: (navOpen) => set({ navOpen }),
  drawer: null,
  openDrawer: (drawer) => set({ drawer, drawerClosing: false }),
  openTarget: (target) =>
    'section' in target
      ? set({ stack: [{ id: target.section as SectionId }], drawer: null, navOpen: false, filters: {} })
      : set({ drawer: target as DrawerTarget, drawerClosing: false, navOpen: false }),
  drawerClosing: false,
  finishDrawerClose: () => set({ drawer: null, drawerClosing: false }),
  openClient: (id) => set({ drawer: { kind: 'client', id }, drawerClosing: false }),
  openEscalation: (id) => set({ drawer: { kind: 'escalation', id }, drawerClosing: false }),
  closeDrawer: () => set((s) => (s.drawer ? { drawerClosing: true } : {})),
  filters: {},
  setFilters: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  go: (section) => set({ stack: [{ id: section }], drawer: null, navOpen: false, filters: {} }),
  push: (route) => set((s) => ({ stack: [...s.stack, route], drawer: null })),
  pop: () => set((s) => ({ stack: s.stack.length > 1 ? s.stack.slice(0, -1) : s.stack })),
  setAuth: (auth) => set({ auth }),
  setRailCollapsed: (railCollapsed) => {
    try {
      localStorage.setItem(RAIL_KEY, railCollapsed ? '1' : '0');
    } catch {
      /* storage unavailable: the choice just won't persist */
    }
    set({ railCollapsed });
  },
}));

export const useAdminRoute = () => useAdminNav((s) => s.stack[s.stack.length - 1]);
export const useAdminSection = () => useAdminNav((s) => s.stack[0].id as SectionId);
