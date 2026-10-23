/**
 * @screen  M-1.0 · Hero
 * @flow    F01 First launch & onboarding (web cold start)
 * @states  default — Get Started opens classic Welcome (M-1.2)
 * @figma   —
 * @spec    web guest-chat onboarding (Hero cold start → Welcome → CreateProfile)
 * @xref    web: W-1.0 (apps/web/screens/onboarding/Hero)
 */
import { useNav } from '@web/navigation';
import DeborahLanding from './DeborahLanding';
import styles from './Hero.module.css';

export default function Hero() {
  const { replace } = useNav();

  return (
    <div className={styles.root} data-xref="M-1.0 · Hero">
      <DeborahLanding
        onGetStarted={() => replace('M-1.2', undefined, 'fade')}
        onLogin={() => replace('M-1.4', { mode: 'signin' }, 'fade')}
      />
    </div>
  );
}
