/**
 * @shell IPhoneFrame — device body at 393 × 852 points, scaled with transform to fit the stage.
 * Provides useDevice() to the app and the --safe-top / --safe-bottom / --keyboard-height variables.
 * Owns the device overlays: LockScreen (M-5.1), NotificationBanner and SystemAlert.
 */
import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useAppStore } from '@shared/store';
import { useShellStore } from '../../shell.store';
import { DEVICE, DEVICE_OUTER } from '../constants';
import { DeviceContext, type DeviceApi } from '../useDevice';
import { StatusBar } from '../StatusBar';
import { DynamicIsland } from '../DynamicIsland';
import { HomeIndicator } from '../HomeIndicator';
import { SimKeyboard } from '../SimKeyboard';
import { TapTargets } from '../TapTargets';
import { SystemAlert } from '../SystemAlert';
import { LockScreen } from '../LockScreen';
import { NotificationBanner } from '../NotificationBanner';
import type { DeviceAlertOptions } from '../useDevice';
import { useDeviceNotifications } from './useDeviceNotifications';
import { useFitScale } from './useFitScale';
import { useSimKeyboard } from './useSimKeyboard';
import styles from './IPhoneFrame.module.css';

export interface IPhoneFrameProps {
  children: ReactNode;
}

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const scaleMode = useShellStore((s) => s.scale);
  const simKeyboard = useShellStore((s) => s.simKeyboard);
  const showTapTargets = useShellStore((s) => s.toggles.showTapTargets);
  const screenTone = useShellStore((s) => s.screen?.statusBarStyle ?? 'dark');
  const isLocked = useAppStore((s) => s.isLocked);
  const tone = isLocked ? 'light' : screenTone;
  const setScreen = useShellStore((s) => s.setScreen);

  const scale = useFitScale(stageRef, scaleMode);
  const [alert, setAlert] = useState<{ options: DeviceAlertOptions; resolve: (i: number) => void } | null>(null);
  const keyboardOpen = useSimKeyboard(screenRef, simKeyboard);
  const keyboardHeight = keyboardOpen ? DEVICE.keyboardHeight : 0;
  const { banner, notify, open, dismiss } = useDeviceNotifications();

  const api = useMemo<DeviceApi>(
    () => ({
      safeArea: { top: DEVICE.safeTop, bottom: DEVICE.safeBottom },
      keyboardHeight,
      alert: (options) => new Promise<number>((resolve) => setAlert({ options, resolve })),
      notify,
      haptic: () => {},
      setScreen,
    }),
    [keyboardHeight, setScreen, notify],
  );

  const vars = {
    '--device-scale': scale,
    '--sized-w': `${DEVICE_OUTER.width * scale}px`,
    '--sized-h': `${DEVICE_OUTER.height * scale}px`,
    '--safe-top': `${DEVICE.safeTop}px`,
    '--safe-bottom': `${keyboardOpen ? 0 : DEVICE.safeBottom}px`,
    '--keyboard-height': `${keyboardHeight}px`,
  } as CSSProperties;

  return (
    <div ref={stageRef} className={styles.stage}>
      <div className={styles.sizer} style={vars}>
        <div className={styles.device}>
          <span className={`${styles.button} ${styles.action}`} />
          <span className={`${styles.button} ${styles.volUp}`} />
          <span className={`${styles.button} ${styles.volDown}`} />
          <span className={`${styles.button} ${styles.power}`} />
          <div ref={screenRef} className={styles.screen}>
            <div className={styles.app}>
              <DeviceContext.Provider value={api}>{children}</DeviceContext.Provider>
            </div>
            {isLocked && <LockScreen />}
            {banner && <NotificationBanner key={banner.key} item={banner} onOpen={open} onDismiss={dismiss} />}
            <StatusBar tone={tone} />
            <DynamicIsland />
            <SimKeyboard visible={keyboardOpen && !isLocked} />
            {(!keyboardOpen || isLocked) && <HomeIndicator tone={tone} />}
            {alert && (
              <SystemAlert
                options={alert.options}
                onChoose={(i) => {
                  alert.resolve(i);
                  setAlert(null);
                }}
              />
            )}
            {showTapTargets && <TapTargets containerRef={screenRef} scale={scale} />}
          </div>
        </div>
      </div>
    </div>
  );
}
