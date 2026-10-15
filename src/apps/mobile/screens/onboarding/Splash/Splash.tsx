/**
 * @screen  M-1.1 · Splash
 * @flow    F01 First launch & onboarding
 * @states  default (tree of life grows in (trunk, roots, branches, leaves), then the wordmark and byline reveal)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=161-386
 * @spec    docs/ux/F01-onboarding.md#m-11--splash
 * @xref    web: W-1.1 (apps/web/screens/onboarding/Splash) — not built
 */
import { useEffect } from 'react';
import { persona } from '@shared/data';
import { useAppStore } from '@shared/store';
import { GradientShift, GrowReveal, TextReveal } from '@mobile/ui';
import { useNav, useNavStore } from '@mobile/navigation';
import styles from './Splash.module.css';

// OPEN: spec says ~1.6 s; extended to 3 s per design direction (2026-10-08) so the mark can form.
const SPLASH_MS = 3000;
/** PDF persona auto-run: leave Splash immediately (sign-up sheet is the focus). */
const splashMs = () => (document.documentElement.dataset.yocFastSignup === '1' ? 40 : SPLASH_MS);

/** Silent deep-link attribution (?ref= or utm_source=); never asked. */
function referralFrom(search: string): string {
  const p = new URLSearchParams(search);
  const raw = (p.get('ref') ?? p.get('utm_source') ?? '').toLowerCase();
  if (/genesis|gold|gg/.test(raw)) return 'genesis-gold';
  if (/newsletter|email/.test(raw)) return 'newsletter';
  if (/social|instagram|facebook|tiktok|youtube/.test(raw)) return 'social';
  return 'direct';
}

export default function Splash() {
  const { replace, resetTo } = useNav();
  const consented = useAppStore((s) => Boolean(s.consentAcceptedAt));

  useEffect(() => {
    const s = useAppStore.getState();
    const source = referralFrom(window.location.search);
    s.setReferralSource(source);
    if (source === 'genesis-gold') s.setGenesisGoldCustomer(true);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      // Only while Splash is still on top: a scenario that starts elsewhere (e.g. S03 on the health
      // questions) replaces it, and this timer must not then override that start.
      if (useNavStore.getState().preauth.at(-1)?.id !== 'M-1.1' || useNavStore.getState().root !== 'preauth') return;
      // Returning users who already consented go straight to Main.
      if (consented) resetTo('main', 'M-2.0');
      else replace('M-1.2', undefined, 'fade');
    }, splashMs());
    return () => window.clearTimeout(id);
  }, [consented, replace, resetTo]);

  return (
    <div className={styles.root} data-xref="M-1.1 · Splash">
      {/* Figma 161:386: grainy violet/gold photo backdrop, melted into parchment. */}
      <span className={styles.backdrop} aria-hidden />
      <GradientShift />
      {/* Tree of life and positions are taken 1:1 from Figma 161:386 (390×844 frame). */}
      <div className={styles.tree}>
        <GrowReveal src="/images/splash/tree-of-life.svg" width={141} height={141} delay={100} duration={2000} />
      </div>
      <TextReveal as="h1" className={styles.wordmark} text={persona.brand.appName} delay={1300} stagger={40} />
      <TextReveal className={styles.byline} text={persona.brand.byline} delay={1900} stagger={22} />
    </div>
  );
}
