/**
 * Auto-scroll follows new content unless the user scrolled up; then a scroll-to-latest button
 * appears (docs/07-ai-simulation.md §2). Pinned to the bottom, the list also keeps its position
 * when the keyboard resizes the viewport.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const PIN_THRESHOLD = 80;

export function useAutoScroll(contentKey: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const [showLatest, setShowLatest] = useState(false);

  const toBottom = useCallback((smooth = false) => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    pinned.current = true;
    setShowLatest(false);
  }, []);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < PIN_THRESHOLD;
    pinned.current = atBottom;
    setShowLatest(!atBottom);
  }, []);

  useLayoutEffect(() => {
    if (pinned.current) toBottom();
  }, [contentKey, toBottom]);

  // Keep the bottom in view when the scroll area resizes (keyboard, composer growth).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => pinned.current && toBottom());
    observer.observe(el);
    return () => observer.disconnect();
  }, [toBottom]);

  return { ref, onScroll, showLatest, toBottom };
}
