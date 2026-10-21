/**
 * @ui Header — iOS app bar. `large`: display title on tab roots, folding into the inline title-3
 * title when `collapsed` (the screen has scrolled). Otherwise an inline header with a centred
 * title; `onBack` shows a round glass back chevron (iOS 26). Titles wrap rather than
 * truncate at large text sizes (DESIGN.md › Text size control).
 *
 * Large titles are OFF app-wide (design 2026-10-21): the title always sits inline in the bar.
 * Previously — auto large title (design direction 2026-10-20): on plain-background screens ([data-bg='plain']), a titled
 * header with no explicit `large` shows the large title just under the back button and folds it into the
 * bar by itself once the screen's content scrolls (no per-screen wiring).
 */
import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { cx } from '@shared/utils';
import { GlassButton } from '../GlassButton';
import styles from './Header.module.css';

export interface HeaderProps {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  large?: boolean;
  transparent?: boolean;
  /** Back button; `backLabel` is the previous screen's title. */
  onBack?: () => void;
  backLabel?: string;
  /** Pad for the status bar (screens at the top of the phone). */
  safeTop?: boolean;
  /** Large title only: the content has scrolled, so the title moves into the bar. */
  collapsed?: boolean;
}

const COLLAPSE_AT = 12;

/** Large title + scroll collapse for headers on plain screens (see file header). */
function useAutoLarge(enabled: boolean) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState({ on: false, collapsed: false });
  useLayoutEffect(() => {
    const screen = enabled ? ref.current?.closest("[data-bg='plain']") : null;
    if (!screen) return;
    setState((s) => ({ ...s, on: true }));
    const onScroll = (e: Event) => {
      const t = e.target;
      // Vertical scrollers only: horizontal rails would otherwise reset the title.
      if (!(t instanceof HTMLElement) || t.scrollHeight <= t.clientHeight + 1) return;
      const collapsed = t.scrollTop > COLLAPSE_AT;
      setState((s) => (s.collapsed === collapsed ? s : { on: true, collapsed }));
    };
    screen.addEventListener('scroll', onScroll, true);
    return () => screen.removeEventListener('scroll', onScroll, true);
  }, [enabled]);
  return { ref, ...state };
}

/**
 * Native iOS bar on plain screens: the scroller right after the header slides up underneath it (negative
 * margin = header height, padding-top raised by the same amount), so content scrolls behind a transparent,
 * lightly faded bar. Inline styles because the height is dynamic; restored on unmount.
 */
function useUnderlay(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useLayoutEffect(() => {
    const header = ref.current;
    const next = header?.nextElementSibling;
    if (!enabled || !header || !(next instanceof HTMLElement) || !header.closest("[data-bg='plain']")) return;
    const base = parseFloat(getComputedStyle(next).paddingTop) || 0;
    // Tallest height seen (large title open), so folding the title doesn't shift content mid-scroll.
    let tallest = 0;
    const apply = () => {
      const h = (tallest = Math.max(tallest, header.offsetHeight));
      next.style.marginTop = `${-h}px`;
      next.style.paddingTop = `${base + h}px`;
      next.style.scrollPaddingTop = `${h}px`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(header);
    return () => {
      ro.disconnect();
      next.style.marginTop = '';
      next.style.paddingTop = '';
      next.style.scrollPaddingTop = '';
    };
  }, [ref, enabled]);
}

export function Header({ title, left, right, large: largeProp, transparent, onBack, backLabel = 'Back', safeTop = true, collapsed: collapsedProp = false }: HeaderProps) {
  // No large titles anywhere (design 2026-10-21): the title only ever sits small in the bar. `large` /
  // `collapsed` are still accepted from screens but ignored; the auto large title is off.
  void largeProp;
  void collapsedProp;
  const auto = useAutoLarge(false);
  useUnderlay(auto.ref, !transparent);
  const large = false;
  const collapsed = false;
  // iOS 26 nav bar: a round Liquid Glass back button with only the chevron; the previous
  // title lives in the accessible name (and the button's tooltip).
  const back = onBack && <GlassButton icon="back" aria-label={`Back to ${backLabel}`} title={backLabel} onClick={onBack} />;
  const inlineTitle = title && (!large || collapsed);
  return (
    <header
      ref={auto.ref}
      className={cx(styles.root, transparent && styles.transparent, safeTop && styles.safeTop)}
      data-scrolled={(large && collapsed) || undefined}
    >
      <div className={styles.bar}>
        <div className={styles.side}>{back ?? left}</div>
        {large ? (
          // Same text as the large title, so it stays out of the accessibility tree.
          <span className={styles.title} data-inline-large data-shown={inlineTitle || undefined} aria-hidden="true">
            {title}
          </span>
        ) : (
          inlineTitle && <h1 className={styles.title}>{title}</h1>
        )}
        <div className={cx(styles.side, styles.right)}>{right}</div>
      </div>
      {large && title && (
        <div className={styles.largeWrap} data-collapsed={collapsed || undefined}>
          <h1 className={styles.large}>{title}</h1>
        </div>
      )}
    </header>
  );
}
