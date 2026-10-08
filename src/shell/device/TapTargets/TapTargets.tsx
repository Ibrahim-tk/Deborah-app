/**
 * @shell TapTargets — dev toggle "Show tap targets": outlines interactive elements smaller
 * than the minimum inside the phone. ASSUMPTION: threshold is 48 px (DESIGN.md / PRODUCT.md),
 * stricter than the 44 px named in docs/03-prototype-shell.md §4.
 */
import { useEffect, useState, type CSSProperties, type RefObject } from 'react';
import styles from './TapTargets.module.css';

const MIN_TARGET = 48;
const SELECTOR = 'button, a[href], input, select, textarea, [role="button"], [role="tab"], [role="option"], [tabindex]:not([tabindex="-1"])';

interface Box {
  key: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface TapTargetsProps {
  /** The phone screen element; boxes are measured relative to it. */
  containerRef: RefObject<HTMLElement | null>;
  scale: number;
}

export function TapTargets({ containerRef, scale }: TapTargetsProps) {
  const [boxes, setBoxes] = useState<Box[]>([]);

  useEffect(() => {
    const measure = () => {
      const root = containerRef.current;
      if (!root) return;
      const origin = root.getBoundingClientRect();
      const next: Box[] = [];
      root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const width = r.width / scale;
        const height = r.height / scale;
        if (width === 0 || height === 0) return;
        if (width >= MIN_TARGET && height >= MIN_TARGET) return;
        next.push({ key: String(i), top: (r.top - origin.top) / scale, left: (r.left - origin.left) / scale, width, height });
      });
      setBoxes(next);
    };
    measure();
    // Polling keeps this dev overlay simple; it only runs while the toggle is on.
    const id = window.setInterval(measure, 500);
    return () => window.clearInterval(id);
  }, [containerRef, scale]);

  return (
    <div className={styles.root} aria-hidden="true">
      {boxes.map((b) => (
        <span
          key={b.key}
          className={styles.box}
          style={{ '--top': `${b.top}px`, '--left': `${b.left}px`, '--w': `${b.width}px`, '--h': `${b.height}px` } as CSSProperties}
        />
      ))}
    </div>
  );
}
