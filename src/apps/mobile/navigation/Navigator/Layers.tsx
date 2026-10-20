/** Sheet and modal layers above Main (docs/04-navigation.md §2, §5). */
import { BottomSheetFrame, MotionDiv, useReducedMotionPref } from '@mobile/ui';
import { useNavStore } from '../nav.store';
import { meta } from '../registry';
import { modalTransition } from '../transitions';
import type { Layer, NavAction } from '../types';
import { ScreenHost } from './ScreenHost';
import { StackView } from './StackView';
import styles from './Navigator.module.css';

/** Routed sheets use the shared frame (ui/BottomSheet): same drag, scrim, Escape and focus as every sheet. */
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

export function ModalLayer({ layer, action }: { layer: Extract<Layer, { kind: 'modal' }>; action: NavAction }) {
  const reduced = useReducedMotionPref();
  const pop = useNavStore((s) => s.pop);
  return (
    <MotionDiv className={styles.modal} role="dialog" aria-modal="true" {...modalTransition(reduced)}>
      <StackView routes={layer.routes} action={action} container="modal" onBack={pop} />
    </MotionDiv>
  );
}
