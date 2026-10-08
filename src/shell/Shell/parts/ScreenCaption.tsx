/** Bottom-left caption: ID + title of the top-most screen, as reported via useDevice().setScreen(). Click copies the ID. */
import { useAppStore } from '@shared/store';
import { useShellStore } from '../../shell.store';
import styles from '../Shell.module.css';

export function ScreenCaption() {
  const appScreen = useShellStore((s) => s.screen);
  // The lock screen is a device overlay above the app: it is the visible "screen" while locked.
  const isLocked = useAppStore((s) => s.isLocked);
  const screen = isLocked ? { id: 'M-5.1', title: 'Lock screen' } : appScreen;
  const showToast = useShellStore((s) => s.showToast);

  if (!screen) {
    return <span className={styles.caption}>No screen registered yet</span>;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(screen.id);
      showToast(`Copied ${screen.id}`);
    } catch {
      showToast(`Couldn't copy — ID is ${screen.id}`);
    }
  };

  return (
    <button type="button" className={styles.caption} onClick={copy} title="Copy screen ID">
      {screen.id} {screen.title}
    </button>
  );
}
