/** Admin navigator: section switch resets the stack; detail pages push on top. */
import { create } from 'zustand';
import type { AdminRoute, AuthStep, DrawerTarget, SectionId } from './types';

interface AdminNavState {
  stack: AdminRoute[];
  auth: AuthStep;
  railCollapsed: boolean;
  /** Side drawer over the current page (one at a time): any record a table row opens. */
  drawer: DrawerTarget | null;
  openDrawer: (target: DrawerTarget) => void;
  openClient: (id: string) => void;
  openEscalation: (id: string) => void;
  closeDrawer: () => void;
  /** True while the drawer plays its slide-out; `finishDrawerClose` removes it after. */
  drawerClosing: boolean;
  finishDrawerClose: () => void;
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
  drawer: null,
  openDrawer: (drawer) => set({ drawer, drawerClosing: false }),
  drawerClosing: false,
  finishDrawerClose: () => set({ drawer: null, drawerClosing: false }),
  openClient: (id) => set({ drawer: { kind: 'client', id }, drawerClosing: false }),
  openEscalation: (id) => set({ drawer: { kind: 'escalation', id }, drawerClosing: false }),
  closeDrawer: () => set((s) => (s.drawer ? { drawerClosing: true } : {})),
  go: (section) => set({ stack: [{ id: section }], drawer: null }),
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
