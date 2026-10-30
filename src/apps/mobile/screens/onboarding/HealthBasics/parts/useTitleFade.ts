import { useLayoutEffect, useState, type RefObject } from 'react';

/** Feather above the title (px): the blur ramps in over this band and is at full strength behind the text. */
const FEATHER = 72;
/** Extra reach above the title so the blur is at full strength by its first line (design 2026-10-20). */
const LIFT = 40;

/**
 * Height for the screen-level blur layer so it reaches from the bottom of the screen to just above the
 * question title. Re-measures when the question (and so the title's position) changes or the screen resizes.
 * Pass a caller-owned `titleRef` so the hook return is not mixed with a RefObject (react-hooks/refs).
 */
export function useTitleFade(key: string, titleRef: RefObject<HTMLHeadingElement | null>) {
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const title = titleRef.current;
    const root = title?.closest('[data-xref]');
    if (!title || !root) return;
    const measure = () => {
      const bottom = root.getBoundingClientRect().bottom;
      setHeight(Math.round(bottom - title.getBoundingClientRect().top + FEATHER + LIFT));
    };
    measure();
    const ro = new ResizeObserver(measure);
    // Answers growing (e.g. added medicine tiles) push the title up without resizing it: watch every
    // block between the title and the screen, and the scroller's movement, so the blur follows.
    for (let el: Element | null = title; el && el !== root; el = el.parentElement) ro.observe(el);
    ro.observe(root);
    const body = title.parentElement?.parentElement;
    if (body) for (const child of Array.from(body.children)) ro.observe(child);
    root.addEventListener('scroll', measure, true);
    return () => { ro.disconnect(); root.removeEventListener('scroll', measure, true); };
  }, [key, titleRef]);

  return { height, feather: FEATHER };
}
