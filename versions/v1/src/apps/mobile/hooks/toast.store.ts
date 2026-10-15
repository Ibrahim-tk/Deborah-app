/** In-app toasts (DESIGN.md › Toasts): one at a time, 2.5 s, rendered above the tab bar by the Navigator. */
import { create } from 'zustand';

interface ToastState {
  toast: { id: number; message: string } | null;
  show: (message: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toast: null,
  show: (message) => set({ toast: { id: Date.now(), message } }),
  clear: () => set({ toast: null }),
}));

export const useToast = () => useToastStore((s) => s.show);
