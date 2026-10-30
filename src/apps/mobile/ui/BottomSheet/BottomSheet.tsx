/**
 * @ui BottomSheet — the one bottom sheet (docs/plans/bottom-sheet-migration.md). Owns the whole interaction:
 * scrim, spring slide-in, drag down (> 30 % or a fast flick) to close, scrim tap and Escape to close,
 * focus in on open and back on close, reduced motion = fade. Same behaviour for every sheet.
 *
 * - `BottomSheetFrame`: the frame alone, always "open" — the navigator renders it for routed sheets inside
 *   its own AnimatePresence. Children are the route's screen (which renders `<Sheet>`).
 * - `BottomSheet`: frame + `open` switch + portal, for sheets opened from inside a component. Pass `title` /
 *   `footer` (or nothing) and children become a standard `<Sheet>`; pass `bare` to draw your own surface.
 *
 * height: 'auto' fits content (default, up to near full screen) · 'medium' ≈ 55 % · 'large' near full · px · '70%'.
 * variant: 'default' · 'actions' (iOS grouped action list, own surface) · 'system' (simulated Apple sheet).
 */
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { cx } from '@shared/utils';
import { AnimatePresence, MotionDiv, REDUCED_FADE, SHEET_SPRING, useReducedMotionPref, type PanInfo } from '../Motion';
import { Overlay } from '../Overlay';
import { Sheet } from '../Sheet';
import { SheetCloseContext } from '../Sheet/sheetClose';
import styles from './BottomSheet.module.css';

export type SheetHeight = 'auto' | 'medium' | 'large' | number | `${number}%`;
export type SheetVariant = 'default' | 'actions' | 'system';

export interface BottomSheetFrameProps {
  onClose: () => void;
  height?: SheetHeight;
  /** false: no drag, scrim tap or Escape (the sheet closes itself). */
  dismissible?: boolean;
  variant?: SheetVariant;
  /** Accessible name for the dialog. */
  label?: string;
  /** Close button in the sheet's title row (drawn by ui/Sheet). Off by default; sheets opt in by context
   *  (docs/plans/sheet-close-button.md). */
  showClose?: boolean;
  children: ReactNode;
}

const DRAG_CLOSE = 0.3;
const FLICK_CLOSE = 600;

export function BottomSheetFrame({ onClose, height = 'auto', dismissible = true, variant = 'default', label, showClose, children }: BottomSheetFrameProps) {
  const closeButton = Boolean(showClose);
  const closeFromButton = () => close.current();
  const reduced = useReducedMotionPref();
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);

  // Escape closes; focus moves into the sheet and returns to whatever opened it.
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    // Keep an autofocused field (e.g. a search or confirm input); otherwise focus the sheet itself.
    if (!panel.current?.contains(document.activeElement)) panel.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => dismissible && e.key === 'Escape' && close.current();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      before?.focus?.({ preventScroll: true });
    };
  }, [dismissible]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const h = panel.current?.offsetHeight ?? 1;
    if (info.offset.y > h * DRAG_CLOSE || info.velocity.y > FLICK_CLOSE) close.current();
  };

  const preset = typeof height === 'string' && ['auto', 'medium', 'large'].includes(height) ? height : 'custom';
  const custom = preset === 'custom' ? ({ height: typeof height === 'number' ? `${height}px` : height } as CSSProperties) : undefined;
  const slide = reduced ? REDUCED_FADE : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: SHEET_SPRING };

  return (
    // The root is a motion element so AnimatePresence always finishes the exit and removes the layer.
    <MotionDiv className={styles.layer} initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { delay: 0.36, duration: 0 } }}>
      <MotionDiv
        className={cx(styles.scrim, variant === 'system' && styles.scrimSystem)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={dismissible ? () => close.current() : undefined}
      />
      <MotionDiv
        ref={panel}
        className={styles.panel}
        data-height={preset}
        data-variant={variant}
        style={custom}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        {...slide}
        drag={dismissible && !reduced ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 1 }}
        onDragEnd={onDragEnd}
      >
        <SheetCloseContext.Provider value={closeButton ? closeFromButton : null}>{children}</SheetCloseContext.Provider>
      </MotionDiv>
    </MotionDiv>
  );
}

export interface BottomSheetProps extends Omit<BottomSheetFrameProps, 'children'> {
  open: boolean;
  title?: string;
  titleEnd?: ReactNode;
  footer?: ReactNode;
  /** Children draw their own surface (no standard `<Sheet>` around them). */
  bare?: boolean;
  children: ReactNode;
}

export function BottomSheet({ open, title, titleEnd, footer, bare, children, ...frame }: BottomSheetProps) {
  const own = bare || frame.variant === 'actions' || frame.variant === 'system';
  return (
    <Overlay>
      <AnimatePresence>
        {open && (
          <BottomSheetFrame key="bottom-sheet" label={frame.label ?? title} {...frame}>
            {own ? (
              children
            ) : (
              <Sheet title={title} titleEnd={titleEnd} footer={footer} detent={frame.height === 'auto' || !frame.height ? 'medium' : 'large'}>
                {children}
              </Sheet>
            )}
          </BottomSheetFrame>
        )}
      </AnimatePresence>
    </Overlay>
  );
}
