/** @shell device — public API for apps. The only shell module apps may import (lint-enforced). */
export { useDevice } from './useDevice';
export type {
  DeviceApi,
  DeviceAlertOptions,
  DeviceAlertButton,
  DeviceNotification,
  HapticType,
} from './useDevice';
export type { ScreenInfo } from '../shell.store';
