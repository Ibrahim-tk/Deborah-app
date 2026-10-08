/** @shell Shell — fixed TopNav + stage. Mobile: scaled IPhoneFrame. Web: BrowserFrame or full-bleed. */
import MobileApp from '@mobile/MobileApp';
import WebApp from '@web/WebApp';
import { useShellStore } from '../shell.store';
import { TopNav } from '../nav/TopNav';
import { IPhoneFrame } from '../device/IPhoneFrame';
import { BrowserFrame } from '../browser/BrowserFrame';
import { ScreenCaption } from './parts/ScreenCaption';
import { ShellToast } from './parts/ShellToast';
import { ScreenNote } from '../notes/ScreenNote';
import { useShellEffects } from './useShellEffects';
import './dev-overlays.css';
import styles from './Shell.module.css';

export interface ShellProps {
  platform: 'mobile' | 'web';
}

export function Shell({ platform }: ShellProps) {
  useShellEffects();
  const theme = useShellStore((s) => s.theme);
  const showCaption = useShellStore((s) => s.showCaption);
  const showNotes = useShellStore((s) => s.showNotes);
  const webFullBleed = useShellStore((s) => s.webFullBleed);

  return (
    <div className={styles.root} data-theme={theme}>
      <TopNav />
      <main className={styles.stage}>
        {platform === 'mobile' ? (
          <>
            <IPhoneFrame>
              <MobileApp />
            </IPhoneFrame>
            {showCaption && <ScreenCaption />}
            {showNotes && <ScreenNote />}
          </>
        ) : webFullBleed ? (
          <div className={styles.fullBleed}>
            <WebApp />
          </div>
        ) : (
          <BrowserFrame>
            <WebApp />
          </BrowserFrame>
        )}
      </main>
      <ShellToast />
    </div>
  );
}
