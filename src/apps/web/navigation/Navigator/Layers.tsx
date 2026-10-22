/** Sheet and modal layers above Main (docs/04-navigation.md §2, §5). Web: both are centered dialogs. */
import { useEffect, useRef } from 'react';
import { BottomSheetFrame, MotionDiv, trapFocus, useReducedMotionPref } from '@web/ui';
import { useNavStore } from '../nav.store';
import { meta } from '../registry';
import { modalTransition } from '../transitions';
import type { Layer, NavAction } from '../types';
import { ScreenHost } from './ScreenHost';
import { StackView } from './StackView';
import styles from './Navigator.module.css';

/** Routed sheets use the shared frame (ui/BottomSheet): centered dialog, Esc, focus. */
export function SheetLayer({ layer }: { layer: Extract<Layer, { kind: 'sheet' }> }) {
  const dismiss = useNavStore((s) => s.dismissSheet);
  return (
    <BottomSheetFrame
      onClose={dismiss}
      height={layer.detent === 'large' ? 'large' : 'auto'}
      dismissible={layer.dismissible}
      showClose={Boolean(meta(layer.route.id)?.closeButton)}
    >
      <ScreenHost route={layer.route} container="sheet" />
    </BottomSheetFrame>
  );
}

/** Routed modals: centered dialog over scrim (L-modal), not a full-bleed phone card. */
export function ModalLayer({ layer, action }: { layer: Extract<Layer, { kind: 'modal' }>; action: NavAction }) {
  const reduced = useReducedMotionPref();
  const pop = useNavStore((s) => s.pop);
  const dismissModal = useNavStore((s) => s.dismissModal);
  const topId = layer.routes.at(-1)?.id;
  const rootId = layer.routes[0]?.id;
  const dismissible = meta(rootId ?? '')?.dismissible ?? true;
  const panel = useRef<HTMLDivElement>(null);
  const alone = layer.routes.length === 1;

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const el = panel.current;
    if (el && !el.contains(document.activeElement)) el.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!alone) pop();
        else if (dismissible) dismissModal();
      }
      if (el) trapFocus(el, e);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      before?.focus?.({ preventScroll: true });
    };
  }, [alone, dismissible, dismissModal, pop]);

  return (
    <MotionDiv
      className={styles.modalLayer}
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { delay: 0.2, duration: 0 } }}
    >
      <MotionDiv
        className={styles.modalScrim}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          if (alone && dismissible) dismissModal();
        }}
      />
      <MotionDiv
        ref={panel}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={meta(topId ?? '')?.title ?? 'Dialog'}
        tabIndex={-1}
        {...modalTransition(reduced)}
      >
        <StackView routes={layer.routes} action={action} container="modal" onBack={pop} />
      </MotionDiv>
    </MotionDiv>
  );
}
