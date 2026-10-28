/**
 * Auto-scroll follows new content unless the user scrolled up; then a scroll-to-latest button
 * appears (docs/07-ai-simulation.md §2). Pinned to the bottom, the list also keeps its position
 * when the keyboard resizes the viewport. Used by M-2.1 and M-2.12 (standard chat scrolling everywhere).
 *
 * Eye-level turns (designer, 2026-10-28), opt-in via `anchorKey` (count of user messages): when the user
 * sends something, the thread glides so their message sits just under the header and the Oracle's reply
 * grows below it, in the top half of the screen, instead of hugging the composer. A bottom spacer
 * (`--anchor-space` on the content) makes that position reachable while the reply is still short.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const PIN_THRESHOLD = 80;

/** Layout offset of `node` inside the scrolled content of `container`. Uses offsetTop chains, so neither entrance
 *  transforms nor the prototype's scaled phone frame skew it. */
function offsetWithin(node: HTMLElement, container: HTMLElement): number {
  const pageTop = (el: HTMLElement | null) => {
    let top = 0;
    for (let e = el; e; e = e.offsetParent as HTMLElement | null) top += e.offsetTop;
    return top;
  };
  return pageTop(node) - pageTop(container);
}

const content = (el: HTMLElement | null) => el?.firstElementChild as HTMLElement | null | undefined;
const spaceOf = (el: HTMLElement | null) => parseFloat(content(el)?.style.getPropertyValue('--anchor-space') || '0') || 0;
const setSpace = (el: HTMLElement | null, px: number) => content(el)?.style.setProperty('--anchor-space', `${Math.max(0, Math.round(px))}px`);

/** Scroll position that puts the latest user message just under the header; resizes the spacer to allow it. */
function fitAnchor(el: HTMLElement | null): number | null {
  const col = content(el);
  if (!el || !col) return null;
  const users = col.querySelectorAll<HTMLElement>('[data-role="user"]');
  const last = users[users.length - 1];
  if (!last) return null;
  const inset = parseFloat(getComputedStyle(col).paddingTop) || 0;
  const target = Math.max(0, offsetWithin(last, el) - inset);
  const natural = el.scrollHeight - spaceOf(el);
  setSpace(el, target + el.clientHeight - natural);
  // Flush layout so a scroll issued right after sees the taller content (otherwise it clamps at the old end).
  void el.scrollHeight;
  return target;
}

/** Re-aim at the anchor as the reply lays out (the target moves while bubbles and widgets mount, and the spacer
 *  may not be laid out yet on the first try). Re-issued at most every 450 ms: restarting a smooth scroll on every
 *  resize keeps it from ever moving. */
const glideUntil = new WeakMap<HTMLElement, number>();
function aimAt(el: HTMLElement, target: number) {
  glideUntil.set(el, performance.now() + 450);
  el.scrollTo({ top: target, behavior: 'smooth' });
}
function holdAnchor(el: HTMLElement | null, stillAnchored: () => boolean) {
  if (!stillAnchored()) return;
  const target = fitAnchor(el);
  if (!el || target === null || Math.abs(el.scrollTop - target) <= 2) return;
  if (performance.now() < (glideUntil.get(el) ?? 0)) {
    // Mid-glide: check again once it should have landed.
    window.setTimeout(() => holdAnchor(el, stillAnchored), 460);
    return;
  }
  aimAt(el, target);
}

export function useAutoScroll(contentKey: unknown, anchorKey?: number) {
  const ref = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const anchored = useRef(false);
  const lastAnchor = useRef(anchorKey);
  const [showLatest, setShowLatest] = useState(false);

  const toBottom = useCallback((smooth = false) => {
    const el = ref.current;
    if (!el) return;
    anchored.current = false;
    setSpace(el, 0);
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    pinned.current = true;
    setShowLatest(false);
  }, []);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Measured against the real content, not the spacer below it.
    const below = el.scrollHeight - spaceOf(el) - el.scrollTop - el.clientHeight;
    const atBottom = below < PIN_THRESHOLD;
    pinned.current = atBottom && !anchored.current;
    setShowLatest(!atBottom);
  }, []);

  // A new user message: glide it to eye level and hold there while the reply streams in.
  useLayoutEffect(() => {
    if (anchorKey === undefined) return;
    const prev = lastAnchor.current;
    lastAnchor.current = anchorKey;
    if (prev === undefined || anchorKey === prev) return;
    if (anchorKey < prev) return toBottom(); // switched or new conversation
    const target = fitAnchor(ref.current);
    if (target === null) return;
    anchored.current = true;
    pinned.current = false;
    // The glide's own scroll events update the scroll-to-latest button.
    if (ref.current) aimAt(ref.current, target);
  }, [anchorKey, toBottom]);

  useLayoutEffect(() => {
    if (anchored.current) holdAnchor(ref.current, () => anchored.current);
    else if (pinned.current) toBottom();
  }, [contentKey, toBottom]);

  // Keep the bottom (or the anchor) in view when the scroll area resizes (keyboard, composer growth)…
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const follow = () => {
      if (anchored.current) holdAnchor(el, () => anchored.current);
      else if (pinned.current) toBottom();
    };
    const observer = new ResizeObserver(follow);
    observer.observe(el);
    // …and when the content itself grows (a widget opening, text streaming, a card expanding).
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    // Real user scrolling releases the anchor (the spacer stays until the next turn or scroll-to-latest).
    const release = () => { anchored.current = false; };
    el.addEventListener('wheel', release, { passive: true });
    el.addEventListener('touchmove', release, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener('wheel', release);
      el.removeEventListener('touchmove', release);
    };
  }, [toBottom]);

  return { ref, onScroll, showLatest, toBottom };
}
