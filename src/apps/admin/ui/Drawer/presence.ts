/** Lets whoever mounts a Drawer drive its exit: `open` false plays the slide-out, then `onExited` unmounts it. */
import { createContext } from 'react';

export interface DrawerPresenceValue {
  open: boolean;
  onExited: () => void;
}

export const DrawerPresence = createContext<DrawerPresenceValue | null>(null);
