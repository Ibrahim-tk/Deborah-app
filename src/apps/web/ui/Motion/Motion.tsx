/**
 * @ui      Motion — adapter → motion/react. The ONLY web file that imports the animation library.
 *          Durations/easings mirror the DESIGN.md motion tokens. Desktop motion: fades and small
 *          (8–12 px) rises only; routes change instantly (DESIGN.web.md › Motion).
 * @xref    mobile: apps/mobile/ui/Motion
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';

export const MotionDiv = motion.div;
export const MotionSpan = motion.span;
export { AnimatePresence };
export type { Transition };

export const EASE_IOS = [0.32, 0.72, 0, 1] as const;
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const DURATION = { quick: 0.16, base: 0.24, screen: 0.32, dialog: 0.24, reduced: 0.12 } as const;

const query = '(prefers-reduced-motion: reduce)';
const readReduced = () =>
  typeof window !== 'undefined' &&
  (document.documentElement.classList.contains('reduced-motion') || window.matchMedia(query).matches);

/** True when the OS asks for reduced motion or the shell's Reduced motion toggle (`html.reduced-motion`) is on. */
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

/** Fade + small rise (dialogs, popovers, toasts). Collapses to a 120 ms crossfade with reduced motion. */
export function riseIn(reduced: boolean, distance = 8) {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: DURATION.reduced },
    };
  }
  return {
    initial: { opacity: 0, y: distance },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: distance / 2 },
    transition: { duration: DURATION.dialog, ease: EASE_OUT },
  };
}

/** Plain crossfade (scrims, status text). */
export function fade(reduced: boolean) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: reduced ? DURATION.reduced : DURATION.quick },
  };
}
