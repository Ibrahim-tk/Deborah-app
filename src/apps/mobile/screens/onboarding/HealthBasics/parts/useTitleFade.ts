import { useLayoutEffect, useRef, useState } from 'react';

/** Feather above the title (px): the blur ramps in over this band and is at full strength behind the text. */
const FEATHER = 72;

/**
 * Height for the screen-level blur layer so it reaches from the bottom of the screen to just above the
 * question title. Re-measures when the question (and so the title's position) changes or the screen resizes.
 */
export function useTitleFade(key: string) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const title = titleRef.current;
    const root = title?.closest('[data-xref]');
    if (!title || !root) return;
    const measure = () => {
      const bottom = root.getBoundingClientRect().bottom;
      setHeight(Math.round(bottom - title.getBoundingClientRect().top + FEATHER));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    ro.observe(title);
    return () => ro.disconnect();
  }, [key]);

  return { titleRef, height, feather: FEATHER };
}
