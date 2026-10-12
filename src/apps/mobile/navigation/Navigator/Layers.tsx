/** Sheet and modal layers above Main (docs/04-navigation.md §2, §5). */
import { useRef } from 'react';
import { DURATION, MotionDiv, useReducedMotionPref, type PanInfo } from '@mobile/ui';
import { useNavStore } from '../nav.store';
import { modalTransition, sheetTransition } from '../transitions';
import type { Layer, NavAction } from '../types';
import { ScreenHost } from './ScreenHost';
import { StackView } from './StackView';
import styles from './Navigator.module.css';

export function SheetLayer({ layer }: { layer: Extract<Layer, { kind: 'sheet' }> }) {
  const reduced = useReducedMotionPref();
  const dismiss = useNavStore((s) => s.dismissSheet);
  const panel = useRef<HTMLDivElement>(null);
  const t = sheetTransition(reduced);

  // Drag down more than 30 % of the sheet's height to dismiss.
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const h = panel.current?.offsetHeight ?? 1;
    if (info.offset.y > h * 0.3) dismiss();
  };

  return (
    // The root is a motion element too, so AnimatePresence always finishes the exit and removes the
    // layer (a plain div could leave the scrim behind when sheets close back to back).
    <MotionDiv className={styles.layer} initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { delay: DURATION.sheet, duration: 0 } }}>
      <MotionDiv
        className={styles.scrim}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={layer.dismissible ? dismiss : undefined}
      />
      <MotionDiv
        ref={panel}
        className={styles.sheet}
        data-detent={layer.detent}
        role="dialog"
        aria-modal="true"
        {...t}
        drag={layer.dismissible && !reduced ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 1 }}
        onDragEnd={onDragEnd}
      >
        <ScreenHost route={layer.route} container="sheet" />
      </MotionDiv>
    </MotionDiv>
  );
}

export function ModalLayer({ layer, action }: { layer: Extract<Layer, { kind: 'modal' }>; action: NavAction }) {
  const reduced = useReducedMotionPref();
  const pop = useNavStore((s) => s.pop);
  return (
    <MotionDiv className={styles.modal} role="dialog" aria-modal="true" {...modalTransition(reduced)}>
      <StackView routes={layer.routes} action={action} container="modal" onBack={pop} />
    </MotionDiv>
  );
}
