/**
 * @shell Shell — fixed TopNav + stage. Mobile: scaled IPhoneFrame. Web: BrowserFrame or full-bleed.
 * Widgets: the widget lab (/internal/wid) in the IPhoneFrame. Design system: (/internal/design-system), full-bleed.
 */
import MobileApp from '@mobile/MobileApp';
import WidgetLabApp from '@mobile/WidgetLabApp';
import DesignSystemApp from '@mobile/DesignSystemApp';
import WebApp from '@web/WebApp';
import { useShellStore } from '../shell.store';
import { TopNav } from '../nav/TopNav';
import { IPhoneFrame } from '../device/IPhoneFrame';
import { BrowserFrame } from '../browser/BrowserFrame';
import { ScreenCaption } from './parts/ScreenCaption';
import { ShellToast } from './parts/ShellToast';
import { ScreenNote } from '../notes/ScreenNote';
import { JourneyReadout } from '../notes/JourneyReadout';
import { useShellEffects } from './useShellEffects';
import './dev-overlays.css';
import styles from './Shell.module.css';

export interface ShellProps {
  /** `widgets`: the widget lab (/wid), shown in the phone frame. `design-system`: the component library (/design-system). */
  platform: 'mobile' | 'web' | 'widgets' | 'design-system';
}

export function Shell({ platform }: ShellProps) {
  useShellEffects();
  const theme = useShellStore((s) => s.theme);
  const showCaption = useShellStore((s) => s.showCaption);
  const showNotes = useShellStore((s) => s.showNotes);
  const showJourney = useShellStore((s) => s.toggles.showJourney);
  const webFullBleed = useShellStore((s) => s.webFullBleed);

  return (
    <div className={styles.root} data-theme={theme}>
      <TopNav />
      <main className={styles.stage}>
        {platform === 'design-system' ? (
          <div className={styles.fullBleed}>
            <DesignSystemApp />
          </div>
        ) : platform === 'widgets' ? (
          <IPhoneFrame>
            <WidgetLabApp />
          </IPhoneFrame>
        ) : platform === 'mobile' ? (
          <>
            <IPhoneFrame>
              <MobileApp />
            </IPhoneFrame>
            {showCaption && <ScreenCaption />}
            {showNotes && <ScreenNote />}
            {showJourney && <JourneyReadout />}
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
