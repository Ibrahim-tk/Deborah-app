/**
 * @ui Overlay — portals content into the phone's overlay host (above tab bar and sheets) so
 * action sheets and menus are never clipped by transformed screens.
 */
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export const OVERLAY_HOST_ID = 'mobile-overlay-host';

export function Overlay({ children }: { children: ReactNode }) {
  const host = document.getElementById(OVERLAY_HOST_ID);
  return host ? createPortal(children, host) : null;
}
