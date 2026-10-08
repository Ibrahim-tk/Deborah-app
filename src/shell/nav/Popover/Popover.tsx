/** @shell Popover — trigger + floating panel for TopNav menus. Closes on outside click and Escape. */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import styles from './Popover.module.css';

export interface PopoverProps {
  trigger: ReactNode;
  /** Accessible name for the trigger when its content is not descriptive enough. */
  label?: string;
  align?: 'start' | 'end';
  width?: 'sm' | 'md' | 'lg';
  children: (close: () => void) => ReactNode;
}

export function Popover({ trigger, label, align = 'end', width = 'md', children }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
      </button>
      {open && (
        <div id={panelId} className={styles.panel} data-align={align} data-width={width} role="dialog">
          {children(close)}
        </div>
      )}
    </div>
  );
}
