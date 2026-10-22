/**
 * @ui Motion — adapter → motion/react. The ONLY file that imports the animation library.
 * Durations and easing mirror the DESIGN.md motion tokens (tokens.primitives.css).
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, type PanInfo, type Transition } from 'motion/react';

export const MotionDiv = motion.div;
export const MotionSpan = motion.span;
export { AnimatePresence };
export type { PanInfo, Transition };

export const EASE_IOS = [0.32, 0.72, 0, 1] as const;
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const DURATION = { quick: 0.16, base: 0.24, screen: 0.32, modal: 0.38, sheet: 0.36, fade: 0.4, reduced: 0.12 } as const;

/** Critically damped: no overshoot (DESIGN.md › Motion bans bounce). */
export const SHEET_SPRING: Transition = { type: 'spring', stiffness: 400, damping: 40 };

const query = '(prefers-reduced-motion: reduce)';
const readReduced = () =>
  document.documentElement.classList.contains('reduced-motion') || window.matchMedia(query).matches;

/** True when the OS asks for reduced motion or the shell's Reduced motion toggle is on. */
export function useReducedMotionPref(): boolean {
  const [reduced, setReduced] = useState(readReduced);
  useEffect(() => {
    const update = () => setReduced(readReduced());
    const mq = window.matchMedia(query);
    mq.addEventListener('change', update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      mq.removeEventListener('change', update);
      observer.disconnect();
    };
  }, []);
  return reduced;
}

/** Every movement collapses to a short crossfade when reduced motion is on. */
export const REDUCED_FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.reduced },
};
