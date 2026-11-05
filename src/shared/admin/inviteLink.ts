/** Which admin invite the email link is opening. Set from the inbox; cleared once the password is saved. */
import { create } from 'zustand';

interface InviteLinkState {
  adminId: string | null;
  open: (adminId: string) => void;
  clear: () => void;
}

export const useInviteLink = create<InviteLinkState>((set) => ({
  adminId: null,
  open: (adminId) => set({ adminId }),
  clear: () => set({ adminId: null }),
}));
