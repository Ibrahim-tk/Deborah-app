/**
 * @screen  M-1.1 · Splash
 * @flow    F01 First launch & onboarding
 * @states  default
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=47-184
 * @spec    docs/ux/F01-onboarding.md#m-11--splash
 * @xref    web: W-1.1 (apps/web/screens/onboarding/Splash) — not built
 */
import { useEffect } from 'react';
import { persona } from '@shared/data';
import { useAppStore } from '@shared/store';
import { Aura, HelixRing, TextReveal, EASE_OUT, MotionDiv, useReducedMotionPref } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import styles from './Splash.module.css';

// OPEN: spec says ~1.6 s; extended to 3 s per design direction (2026-10-08) so the mark can form.
const SPLASH_MS = 3000;

export default function Splash() {
  const { replace, resetTo } = useNav();
  const consented = useAppStore((s) => Boolean(s.consentAcceptedAt));
  const reduced = useReducedMotionPref();

  useEffect(() => {
    const id = window.setTimeout(() => {
      // Returning users who already consented go straight to Main.
      if (consented) resetTo('main', 'M-2.0');
      else replace('M-1.2', undefined, 'fade');
    }, SPLASH_MS);
    return () => window.clearTimeout(id);
  }, [consented, replace, resetTo]);

  const enter = reduced ? { initial: { opacity: 0 }, animate: { opacity: 1 } } : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 } };

  return (
    <div className={styles.root} data-xref="M-1.1 · Splash">
      <Aura reach={0.75} />
      <MotionDiv className={styles.brand} {...enter} transition={{ duration: 0.6, ease: EASE_OUT }}>
        <HelixRing size={208} cols={60} />
        <TextReveal as="h1" className={styles.wordmark} text={persona.brand.appName} delay={900} stagger={40} />
      </MotionDiv>
      <TextReveal className={styles.byline} text={persona.brand.byline} delay={1600} stagger={22} />
    </div>
  );
}
