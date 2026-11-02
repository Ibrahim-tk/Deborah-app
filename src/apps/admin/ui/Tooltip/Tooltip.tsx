/** @ui Tooltip — Base UI Tooltip around a ref-forwarding trigger. Used for collapsed-rail labels and cut-off text. */
import type { ReactElement } from 'react';
import { Tooltip as Base } from '@base-ui/react/tooltip';
import { overlayRef } from '../Overlay';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  label: string;
  children: ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Skip the tooltip (e.g. when the label is already visible). */
  disabled?: boolean;
}

export function Tooltip({ label, children, side = 'top', disabled }: TooltipProps) {
  if (disabled) return children;
  return (
    <Base.Root>
      <Base.Trigger render={children} />
      <Base.Portal container={overlayRef}>
        <Base.Positioner side={side} sideOffset={8} className={styles.positioner}>
          <Base.Popup className={styles.popup}>{label}</Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
