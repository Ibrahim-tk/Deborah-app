/** @ui Sheet — Base UI Dialog as a panel sliding in from the leading edge (phone navigation). Controlled. */
import type { ReactNode } from 'react';
import { Dialog as Base } from '@base-ui/react/dialog';
import { overlayRef } from '../Overlay';
import styles from './Sheet.module.css';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  children: ReactNode;
}

export function Sheet({ open, onOpenChange, label, children }: SheetProps) {
  return (
    <Base.Root open={open} onOpenChange={onOpenChange}>
      <Base.Portal container={overlayRef}>
        <Base.Backdrop className={styles.scrim} />
        <Base.Popup className={styles.sheet} aria-label={label}>
          {children}
        </Base.Popup>
      </Base.Portal>
    </Base.Root>
  );
}
