/**
 * @ui BottomSheet (web) — same API as mobile, presented as a centered dialog (sheet → modal migration).
 * Scrim tap + Escape dismiss when `dismissible`. No drag-to-dismiss.
 *
 * - `BottomSheetFrame`: frame for navigator-routed sheets.
 * - `BottomSheet`: portal + open switch for in-component sheets.
 */
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { cx } from '@shared/utils';
import { trapFocus } from '../focusTrap';
import { AnimatePresence, MotionDiv, REDUCED_FADE, SHEET_SPRING, useReducedMotionPref } from '../Motion';
import { Overlay } from '../Overlay';
import { Sheet } from '../Sheet';
import { SheetCloseContext } from '../Sheet/sheetClose';
import styles from './BottomSheet.module.css';

export type SheetHeight = 'auto' | 'medium' | 'large' | number | `${number}%`;
export type SheetVariant = 'default' | 'actions' | 'system';

export interface BottomSheetFrameProps {
  onClose: () => void;
  height?: SheetHeight;
  /** false: scrim tap and Escape do not close. */
  dismissible?: boolean;
  variant?: SheetVariant;
  label?: string;
  showClose?: boolean;
  children: ReactNode;
}

export function BottomSheetFrame({ onClose, height = 'auto', dismissible = true, variant = 'default', label, showClose, children }: BottomSheetFrameProps) {
  const closeButton = Boolean(showClose);
  const closeFromButton = () => close.current();
  const reduced = useReducedMotionPref();
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);

  useEffect(() => {
    close.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const el = panel.current;
    if (el && !el.contains(document.activeElement)) el.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (dismissible && e.key === 'Escape') close.current();
      if (el) trapFocus(el, e);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      before?.focus?.({ preventScroll: true });
    };
  }, [dismissible]);

  const preset = typeof height === 'string' && ['auto', 'medium', 'large'].includes(height) ? height : 'custom';
  const custom = preset === 'custom' ? ({ height: typeof height === 'number' ? `${height}px` : height } as CSSProperties) : undefined;
  const slide = reduced
    ? REDUCED_FADE
    : {
        initial: { opacity: 0, scale: 0.96, y: 8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.98, y: 4 },
        transition: SHEET_SPRING,
      };

  return (
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
