/** useAdminSettings — the signed-in admin's own preferences (A-11.1). Kept apart from useAdminStore so the
 *  console store stays focused on records. Password and session changes are simulated (CLAUDE.md §1). */
import { create } from 'zustand';
import { useAdminStore } from './store';

export interface AdminSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

interface SettingsState {
  passwordChangedAt: string;
  sessions: AdminSession[];
  setName: (firstName: string, lastName: string) => void;
  changePassword: () => void;
  signOutOthers: () => void;
}

const log = (text: string) => useAdminStore.getState().log(text);

export const useAdminSettings = create<SettingsState>((set) => ({
  passwordChangedAt: '2026-08-14',
  sessions: [
    { id: 's1', device: 'Chrome on Mac', location: 'Austin, TX', lastActive: 'Now', current: true },
    { id: 's2', device: 'Safari on iPhone', location: 'Austin, TX', lastActive: '2 hours ago', current: false },
    { id: 's3', device: 'Chrome on Windows', location: 'Denver, CO', lastActive: '3 days ago', current: false },
  ],
  setName: (firstName, lastName) => {
    const email = useAdminStore.getState().email;
    useAdminStore.setState((s) => ({ admins: s.admins.map((a) => (a.email === email ? { ...a, firstName, lastName } : a)) }));
    log(`Changed own name to ${firstName} ${lastName}`);
  },
  changePassword: () => {
    set((s) => ({ passwordChangedAt: new Date().toISOString().slice(0, 10), sessions: s.sessions.filter((x) => x.current) }));
    log('Changed own password');
  },
  signOutOthers: () => {
    set((s) => ({ sessions: s.sessions.filter((x) => x.current) }));
    log('Signed out of all other sessions');
  },
}));
