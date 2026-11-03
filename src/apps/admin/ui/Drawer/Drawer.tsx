/** @ui Drawer — Base UI Dialog as a right-hand side panel (always open while mounted): scrim, focus trap,
 *  Esc and outside click close it. Header (title, optional subtitle and trailing slot) stays put; body scrolls. */
import { useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { DrawerPresence } from './presence';
import { Dialog as Base } from '@base-ui/react/dialog';
import { IconButton } from '../IconButton';
import { overlayRef } from '../Overlay';
import styles from './Drawer.module.css';

export interface DrawerProps {
  title: string;
  subtitle?: ReactNode;
  /** Inline after the title on the same line, e.g. a status pill. */
  meta?: ReactNode;
  /** Row of actions under the header. */
  actions?: ReactNode;
  /** Sits just before the close button, e.g. a ⋮ menu of actions. */
  headerControls?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({ title, subtitle, meta, actions, headerControls, onClose, children }: DrawerProps) {
  const presence = useContext(DrawerPresence);
  // Mount closed, open on the next frame, so the slide-in transition actually runs.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const open = entered && (presence?.open ?? true);
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <Base.Root
      // Trap focus but skip Base UI's scroll lock: locking hides the scrollbar and shifts the page (a visible jerk).
      modal="trap-focus"
      open={open}
      onOpenChange={(next) => !next && onClose()}
      onOpenChangeComplete={(isOpen) => !isOpen && entered && presence?.onExited()}
    >
      <Base.Portal container={overlayRef}>
        <Base.Backdrop className={styles.scrim} />
        {/* Focus the panel itself (Base UI focuses it without scrolling) rather than its first button, which is
            still off-screen mid-slide and would make the browser scroll the page to reach it. */}
        <Base.Popup ref={panelRef} initialFocus={panelRef} className={styles.panel}>
          <header className={styles.head}>
            <div className={styles.titles}>
              <div className={styles.titleRow}>
                <Base.Title className={styles.title}>{title}</Base.Title>
                {meta && <div className={styles.meta}>{meta}</div>}
              </div>
              {subtitle && <Base.Description className={styles.subtitle}>{subtitle}</Base.Description>}
            </div>
            <div className={styles.controls}>
              {headerControls}
              <Base.Close render={<IconButton icon="close" label="Close" />} />
            </div>
          </header>
          {actions && <div className={styles.actions}>{actions}</div>}
          <div className={styles.body}>{children}</div>
        </Base.Popup>
      </Base.Portal>
    </Base.Root>
  );
}
