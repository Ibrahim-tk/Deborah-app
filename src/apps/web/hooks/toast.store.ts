/** In-app toasts (DESIGN.md › Toasts): one at a time, 2.5 s, rendered above the tab bar by the Navigator. */
import { create } from 'zustand';

/** Icon names the Toast UI accepts — kept local so hooks never import `@web/ui`. */
type ToastIcon = 'check';

interface ToastState {
  toast: { id: number; message: string; icon?: ToastIcon } | null;
  /** Optional leading icon, e.g. `{ icon: 'check' }` for a confirmation. */
  show: (message: string, opts?: { icon?: ToastIcon }) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toast: null,
  show: (message, opts) => set({ toast: { id: Date.now(), message, icon: opts?.icon } }),
  clear: () => set({ toast: null }),
}));

export const useToast = () => useToastStore((s) => s.show);
