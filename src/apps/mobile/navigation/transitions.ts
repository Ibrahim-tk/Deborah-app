/** Push / sheet / modal / fade variants (docs/04-navigation.md §5). Reduced motion → 120 ms fades. */
import { DURATION, EASE_IOS, REDUCED_FADE, SHEET_SPRING } from '@mobile/ui';
import type { NavAction } from './types';

export function stackTransition(reduced: boolean, action: NavAction, isTop: boolean) {
  if (reduced) return { ...REDUCED_FADE, animate: { opacity: isTop ? 1 : 0 } };
  const t = { duration: DURATION.screen, ease: EASE_IOS };
  const initial = action === 'push' ? { x: '100%' } : action === 'fade' || action === 'replace' ? { opacity: 0 } : false;
  return {
    initial,
    animate: isTop ? { x: 0, opacity: 1, filter: 'brightness(1)' } : { x: '-30%', opacity: 1, filter: 'brightness(0.94)' },
    exit: action === 'pop' ? { x: '100%', transition: t } : { opacity: 0, transition: { duration: DURATION.fade } },
    transition: action === 'fade' ? { duration: DURATION.fade } : t,
  };
}

export function modalTransition(reduced: boolean) {
  if (reduced) return REDUCED_FADE;
  const t = { duration: DURATION.modal, ease: EASE_IOS };
  return { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: t };
}

export function sheetTransition(reduced: boolean) {
  if (reduced) return REDUCED_FADE;
  return { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: SHEET_SPRING };
}
