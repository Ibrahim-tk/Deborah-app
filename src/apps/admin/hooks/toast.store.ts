/** Admin toasts: one at a time, 2.5 s. Wording matches the action that caused it ("Resolve case" → "Case resolved"). */
import { create } from 'zustand';

interface ToastState {
  toast: { id: number; message: string } | null;
  show: (message: string) => void;
  clear: () => void;
}

export const useAdminToastStore = create<ToastState>()((set) => ({
  toast: null,
  show: (message) => set({ toast: { id: Date.now(), message } }),
  clear: () => set({ toast: null }),
}));

export const useAdminToast = () => useAdminToastStore((s) => s.show);
