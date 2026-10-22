/**
 * @shell WebDeviceHost — DeviceContext for WebApp (BrowserFrame / full-bleed).
 * Same API as IPhoneFrame so copied web screens can call useDevice() without the phone chrome.
 */
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useShellStore } from '../../shell.store';
import { DeviceContext, type DeviceApi, type DeviceAlertOptions } from '../../device/useDevice';
import { SystemAlert } from '../../device/SystemAlert';
import { NotificationBanner } from '../../device/NotificationBanner';
import { useDeviceNotifications } from '../../device/IPhoneFrame/useDeviceNotifications';
import styles from './WebDeviceHost.module.css';

export interface WebDeviceHostProps {
  children: ReactNode;
}

export function WebDeviceHost({ children }: WebDeviceHostProps) {
  const setScreen = useShellStore((s) => s.setScreen);
  const setClientGuide = useShellStore((s) => s.setClientGuide);
  const [alert, setAlert] = useState<{ options: DeviceAlertOptions; resolve: (i: number) => void } | null>(null);
  const { banner, notify, open, dismiss } = useDeviceNotifications();

  const api = useMemo<DeviceApi>(
    () => ({
      safeArea: { top: 0, bottom: 0 },
      keyboardHeight: 0,
      alert: (options) => new Promise<number>((resolve) => setAlert({ options, resolve })),
      notify,
      haptic: () => {},
      setScreen,
      setClientGuide,
    }),
    [setScreen, setClientGuide, notify],
  );

  const vars = {
    '--safe-top': '0px',
    '--safe-bottom': '0px',
    '--keyboard-height': '0px',
  } as CSSProperties;

  return (
    <div className={styles.root} style={vars}>
      <DeviceContext.Provider value={api}>{children}</DeviceContext.Provider>
      {banner && <NotificationBanner key={banner.key} item={banner} onOpen={open} onDismiss={dismiss} />}
      {alert && (
        <SystemAlert
          options={alert.options}
          onChoose={(i) => {
            alert.resolve(i);
            setAlert(null);
          }}
        />
      )}
    </div>
  );
}
