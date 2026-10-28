/**
 * @screen  LAB · Design system (route /internal/design-system) — not a product screen
 * @flow    — design tool
 * @states  one long page: foundations (live .phone-root tokens) · V2 ui/ · V2 patterns · guidelines
 * @xref    web: — not built
 *
 * Living catalog for Version 2 mobile only. Values come from computed CSS on .phone-root;
 * specimens are components imported by product screens (not v1, not unused lab experiments).
 */
import { useEffect, useState } from 'react';
import { DeborahBlob, OVERLAY_HOST_ID } from '@mobile/ui';
import { cx } from '@shared/utils';
import { LiveRoot } from './parts/live';
import { NAV, SECTIONS } from './parts/nav';
import styles from './DesignSystem.module.css';

export default function DesignSystem() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [active, setActive] = useState(SECTIONS[0].id);

  // Stay at Overview on mount (hash/deep-link not used); demos must not steal scroll.
  useEffect(() => {
    if (!scroller) return;
    scroller.scrollTop = 0;
    setActive(SECTIONS[0].id);
  }, [scroller]);

  // Highlight the section nearest the top of the scroll area (document order, not callback batch).
  useEffect(() => {
    if (!scroller) return;
    const sections = Array.from(scroller.querySelectorAll<HTMLElement>('section[id]'));
    const pick = () => {
      const rootTop = scroller.getBoundingClientRect().top;
      let best: HTMLElement | null = null;
      let bestDist = Infinity;
      for (const s of sections) {
        const dist = Math.abs(s.getBoundingClientRect().top - rootTop);
        if (dist < bestDist) {
          bestDist = dist;
          best = s;
        }
      }
      if (best?.id) setActive(best.id);
    };
    const io = new IntersectionObserver(pick, { root: scroller, rootMargin: '0px 0px -70% 0px' });
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [scroller]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div ref={setRoot} className={styles.root} data-xref="LAB · Design system">
      <aside className={styles.sidebar} aria-label="Design system">
        <div className={styles.brand}>
          <DeborahBlob size={36} label="The Oracle" />
          <div>
            <p className={styles.brandName}>Your Oracle</p>
            <p className={styles.brandSub}>Mobile design system</p>
          </div>
        </div>
        <nav className={styles.nav}>
          {NAV.map((g) => (
            <div key={g.title} className={styles.navGroup}>
              <p className={styles.navTitle}>{g.title}</p>
              {g.items.map((s) => (
                <button key={s.id} type="button" className={cx(styles.navItem, active === s.id && styles.navActive)} aria-current={active === s.id ? 'location' : undefined} onClick={() => go(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      {/* data-ds-scroll: ChatPatterns demos wait until visible in this scroller (no preload jump). */}
      <div ref={setScroller} className={styles.scroll} data-ds-scroll>
        <main className={styles.content}>
          <LiveRoot.Provider value={root}>
            {root && SECTIONS.map(({ id, Component }) => <Component key={id} />)}
          </LiveRoot.Provider>
        </main>
      </div>
      {/* Host for overlays some patterns portal into, as the app's Navigator provides. */}
      <div id={OVERLAY_HOST_ID} className={styles.overlayHost} />
    </div>
  );
}
