/** Admin navigator: section switch resets the stack; detail pages push on top. */
import { create } from 'zustand';
import type { AdminRoute, AuthStep, SectionId } from './types';

interface AdminNavState {
  stack: AdminRoute[];
  auth: AuthStep;
  railCollapsed: boolean;
  go: (section: SectionId) => void;
  push: (route: AdminRoute) => void;
  pop: () => void;
  setAuth: (step: AuthStep) => void;
  setRailCollapsed: (v: boolean) => void;
}

export const useAdminNav = create<AdminNavState>((set) => ({
  stack: [{ id: 'dashboard' }],
  auth: 'signIn',
  railCollapsed: false,
  go: (section) => set({ stack: [{ id: section }] }),
  push: (route) => set((s) => ({ stack: [...s.stack, route] })),
  pop: () => set((s) => ({ stack: s.stack.length > 1 ? s.stack.slice(0, -1) : s.stack })),
  setAuth: (auth) => set({ auth }),
  setRailCollapsed: (railCollapsed) => set({ railCollapsed }),
}));

export const useAdminRoute = () => useAdminNav((s) => s.stack[s.stack.length - 1]);
export const useAdminSection = () => useAdminNav((s) => s.stack[0].id as SectionId);
