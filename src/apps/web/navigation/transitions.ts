/** Web transitions: one standard page fade for all route changes; dialog + sheet for overlays. */
import { DURATION, EASE_IOS, REDUCED_FADE, SHEET_SPRING } from '@web/ui';
import type { NavAction } from './types';

/**
 * Standard web page change for every route swap (push / pop / replace / tab / root): the outgoing page
 * is removed at once and the incoming page fades in. No slides, no overlap — not the iOS stack.
 */
export function pageTransition(reduced: boolean) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0 } },
    transition: { duration: reduced ? DURATION.reduced : 0.18, ease: 'easeOut' as const },
  };
}

export function stackTransition(reduced: boolean, _action: NavAction, isTop: boolean) {
  // Only the top screen paints and takes taps; screens under it stay mounted but hidden.
  const pe = { pointerEvents: isTop ? ('auto' as const) : ('none' as const) };
  const page = pageTransition(reduced);
  return {
    ...page,
    animate: { opacity: isTop ? 1 : 0, ...pe, transition: isTop ? page.transition : { duration: 0 } },
    exit: { opacity: 0, pointerEvents: 'none' as const, transition: { duration: 0 } },
  };
}

export function modalTransition(reduced: boolean) {
  if (reduced) return REDUCED_FADE;
  const t = { duration: DURATION.modal, ease: EASE_IOS };
  // Desktop dialog: scale/fade — not the iOS full-screen slide-up.
  return {
    initial: { opacity: 0, scale: 0.96, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: 4 },
    transition: t,
  };
}

export function sheetTransition(reduced: boolean) {
  if (reduced) return REDUCED_FADE;
  return { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: SHEET_SPRING };
}
