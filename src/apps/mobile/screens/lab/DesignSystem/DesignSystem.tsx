/**
 * @screen  LAB · Design system (route /design-system) — not a product screen
 * @flow    — design tool
 * @states  one long page: foundations (live tokens) · components (ui) · patterns · do's and don'ts
 * @spec    DESIGN.md · deborah-design-system.md · docs/12-design-system.md
 * @xref    web: — not built
 *
 * The living design system. Every value is read from the app's stylesheets at runtime and every specimen is
 * the real component from ui/ or patterns/, so this page always matches what the phone renders.
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

  // Highlight the section nearest the top of the scroll area.
  useEffect(() => {
    if (!scroller) return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { root: scroller, rootMargin: '0px 0px -70% 0px' },
    );
    scroller.querySelectorAll('section[id]').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [scroller]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div ref={setRoot} className={styles.root} data-xref="LAB · Design system">
      <aside className={styles.sidebar} aria-label="Design system">
        <div className={styles.brand}>
          <DeborahBlob size={36} label="Deborah" />
          <div>
            <p className={styles.brandName}>Oracle Clinician</p>
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
      <div ref={setScroller} className={styles.scroll}>
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
