/** @ui Modal — full-screen container with its own header (close ×) and scrolling body. */
import type { ReactNode } from 'react';
import { Header } from '../Header';
import { IconButton } from '../IconButton';
import styles from './Modal.module.css';

export interface ModalProps {
  title?: string;
  onClose?: () => void;
  /** Replaces the close × (e.g. a "Done" text button). */
  right?: ReactNode;
  left?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ title, onClose, right, left, children, footer }: ModalProps) {
  return (
    <div className={styles.root}>
      <Header
        title={title}
        left={left}
        right={right ?? (onClose && <IconButton icon="close" label="Close" onClick={onClose} />)}
      />
      <div className={styles.body} data-scroll-body>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
