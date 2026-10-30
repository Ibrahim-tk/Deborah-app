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
import { useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
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

/**
 * Native iOS bar on plain screens: the scroller right after the header slides up underneath it (negative
 * margin = header height, padding-top raised by the same amount), so content scrolls behind a transparent,
 * lightly faded bar. Inline styles because the height is dynamic; restored on unmount.
 */
function useUnderlay(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useLayoutEffect(() => {
    const header = ref.current;
    const sibling = header?.nextElementSibling;
    if (!enabled || !header || !(sibling instanceof HTMLElement) || !header.closest("[data-bg='plain']")) return;
    const surface: HTMLElement = sibling;
    const base = parseFloat(getComputedStyle(surface).paddingTop) || 0;
    // Tallest height seen (large title open), so folding the title doesn't shift content mid-scroll.
    let tallest = 0;
    const apply = () => {
      const h = (tallest = Math.max(tallest, header.offsetHeight));
      // DOM underlay sync — not React state; compiler immutability rule does not apply.
      /* eslint-disable react-hooks/immutability -- intentional style writes on sibling scroller */
      surface.style.marginTop = `${-h}px`;
      surface.style.paddingTop = `${base + h}px`;
      surface.style.scrollPaddingTop = `${h}px`;
      /* eslint-enable react-hooks/immutability */
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(header);
    return () => {
      ro.disconnect();
      /* eslint-disable react-hooks/immutability -- restore sibling styles on unmount */
      surface.style.marginTop = '';
      surface.style.paddingTop = '';
      surface.style.scrollPaddingTop = '';
      /* eslint-enable react-hooks/immutability */
    };
  }, [ref, enabled]);
}

export function Header({ title, left, right, large: largeProp, transparent, onBack, backLabel = 'Back', safeTop = true, collapsed: collapsedProp = false }: HeaderProps) {
  // No large titles anywhere (design 2026-10-21): the title only ever sits small in the bar. `large` /
  // `collapsed` are still accepted from screens but ignored; the auto large title is off.
  void largeProp;
  void collapsedProp;
  const headerRef = useRef<HTMLElement>(null);
  useUnderlay(headerRef, !transparent);
  const large = false;
  const collapsed = false;
  // iOS 26 nav bar: a round Liquid Glass back button with only the chevron; the previous
  // title lives in the accessible name (and the button's tooltip).
  const back = onBack && <GlassButton icon="back" aria-label={`Back to ${backLabel}`} title={backLabel} onClick={onBack} />;
  const inlineTitle = title && (!large || collapsed);
  return (
    <header
      ref={headerRef}
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
