/** @ui Popover — Base UI Popover: a floating panel anchored to a ref-forwarding trigger. Controlled. */
import type { ReactElement, ReactNode } from 'react';
import { Popover as Base } from '@base-ui/react/popover';
import { overlayRef } from '../Overlay';
import styles from './Popover.module.css';

export interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactElement;
  label: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
}

export function Popover({ open, onOpenChange, trigger, label, children, side = 'bottom', align = 'end' }: PopoverProps) {
  return (
    <Base.Root open={open} onOpenChange={onOpenChange}>
      <Base.Trigger render={trigger} />
      <Base.Portal container={overlayRef}>
        <Base.Positioner side={side} align={align} sideOffset={8} collisionPadding={12} className={styles.positioner}>
          <Base.Popup className={styles.popup} aria-label={label}>{children}</Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
