/**
 * useDevice() — the only shell API the mobile app may use (docs/03-prototype-shell.md §3).
 * Provided by IPhoneFrame. alert() shows SystemAlert; notify() shows a NotificationBanner.
 */
import { createContext, useContext } from 'react';
import type { ScreenInfo } from '../shell.store';

export interface DeviceAlertButton {
  label: string;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface DeviceAlertOptions {
  title: string;
  message?: string;
  buttons: DeviceAlertButton[];
}

export interface DeviceNotification {
  title: string;
  body: string;
  deepLink?: string;
}

export type HapticType = 'light' | 'medium' | 'success' | 'warning' | 'error';

export interface DeviceApi {
  safeArea: { top: number; bottom: number };
  keyboardHeight: number;
  /** Resolves with the index of the tapped button. */
  alert: (options: DeviceAlertOptions) => Promise<number>;
  notify: (notification: DeviceNotification) => void;
  /** Visual-only; no-op in the prototype. */
  haptic: (type: HapticType) => void;
  /**
   * ASSUMPTION: not in the §3 API list. The top-most screen reports its registry meta so the
   * shell caption and status bar colour can follow it without the shell importing app internals.
   */
  setScreen: (screen: ScreenInfo | null) => void;
}

export const DeviceContext = createContext<DeviceApi | null>(null);

export function useDevice(): DeviceApi {
  const api = useContext(DeviceContext);
  if (!api) throw new Error('useDevice() must be used inside IPhoneFrame');
  return api;
}
