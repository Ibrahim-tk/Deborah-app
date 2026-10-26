/**
 * Auto-scroll follows new content unless the user scrolled up; then a scroll-to-latest button
 * appears (docs/07-ai-simulation.md §2). Pinned to the bottom, the list also keeps its position
 * when the keyboard resizes the viewport. Used by M-2.1 and M-2.12 (standard chat scrolling everywhere).
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const PIN_THRESHOLD = 80;

export function useAutoScroll(contentKey: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const [showLatest, setShowLatest] = useState(false);
  /** True while our own smooth scroll is in flight, so its scroll events don't read as the user scrolling up. */
  const gliding = useRef(false);

  const toBottom = useCallback((smooth = false) => {
    const el = ref.current;
    if (!el) return;
    gliding.current = smooth;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    pinned.current = true;
    setShowLatest(false);
  }, []);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < PIN_THRESHOLD;
    if (gliding.current) {
      if (atBottom) gliding.current = false;
      return;
    }
    pinned.current = atBottom;
    setShowLatest(!atBottom);
  }, []);

  // First paint jumps straight to the latest; after that, follow new content with a smooth glide so
  // a reply arriving (a section card mounting, text streaming) never snaps the thread (design 2026-10-26).
  const mounted = useRef(false);
  useLayoutEffect(() => {
    if (pinned.current) toBottom(mounted.current);
    mounted.current = true;
  }, [contentKey, toBottom]);

  // Keep the bottom in view when the scroll area resizes (keyboard, composer growth).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => pinned.current && toBottom(true));
    observer.observe(el);
    // …and when the content itself grows (a widget opening, text streaming, a card expanding).
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    // Any real user input ends a glide, so scrolling up mid-glide still unpins.
    const userInput = () => { gliding.current = false; };
    el.addEventListener('wheel', userInput, { passive: true });
    el.addEventListener('touchstart', userInput, { passive: true });
    el.addEventListener('keydown', userInput);
    return () => {
      observer.disconnect();
      el.removeEventListener('wheel', userInput);
      el.removeEventListener('touchstart', userInput);
      el.removeEventListener('keydown', userInput);
    };
  }, [toBottom]);

  return { ref, onScroll, showLatest, toBottom };
}
