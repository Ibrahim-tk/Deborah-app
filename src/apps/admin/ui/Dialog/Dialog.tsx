/** @ui Dialog — Base UI Dialog (always open while mounted): backdrop, focus trap, Esc and outside click close it. */
import type { ReactNode } from 'react';
import { Dialog as Base } from '@base-ui/react/dialog';
import { IconButton } from '../IconButton';
import { overlayRef } from '../Overlay';
import styles from './Dialog.module.css';

export interface DialogProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md';
}

export function Dialog({ title, onClose, children, footer, width = 'sm' }: DialogProps) {
  return (
    <Base.Root open onOpenChange={(open) => !open && onClose()}>
      <Base.Portal container={overlayRef}>
        <Base.Backdrop className={styles.scrim} />
        <Base.Popup className={styles.panel} data-width={width}>
          <header className={styles.head}>
            <Base.Title className={styles.title}>{title}</Base.Title>
            <Base.Close render={<IconButton icon="close" label="Close" />} />
          </header>
          <div className={styles.body}>{children}</div>
          {footer && <footer className={styles.foot}>{footer}</footer>}
        </Base.Popup>
      </Base.Portal>
    </Base.Root>
  );
}
