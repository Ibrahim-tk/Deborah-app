/**
 * Specimen — one live component on a stage, with its name, source path and usage note.
 * `phone` constrains the stage to the 393 pt device width so layouts look as they do in the app.
 */
import type { ReactNode } from 'react';
import { cx } from '@shared/utils';
import styles from './parts.module.css';

export interface SpecimenProps {
  name: string;
  /** Source folder under src/apps/mobile, e.g. `ui/Button`. */
  path: string;
  note?: ReactNode;
  /** `phone`: 393 px column. `wide`: the full stage. */
  width?: 'phone' | 'wide';
  /** Stage background: the app canvas (default), Paper, or the Midnight signature surface. */
  stage?: 'canvas' | 'paper' | 'signature';
  children: ReactNode;
}

export function Specimen({ name, path, note, width = 'phone', stage = 'canvas', children }: SpecimenProps) {
  return (
    <figure className={styles.specimen}>
      <div className={styles.stage} data-stage={stage}>
        <div className={cx(styles.stageInner, width === 'phone' && styles.phoneWidth)}>{children}</div>
      </div>
      <figcaption className={styles.meta}>
        <span className={styles.metaName}>{name}</span>
        <code className={styles.metaPath}>src/apps/mobile/{path}</code>
        {note && <span className={styles.metaNote}>{note}</span>}
      </figcaption>
    </figure>
  );
}

/** A labelled variant inside a specimen ("primary", "selected", "error"). */
export function Variant({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.variant}>
      <span className={styles.variantLabel}>{label}</span>
      {children}
    </div>
  );
}

/** Lays variants out side by side, wrapping at the stage width. */
export function Row({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}

/** Two-up grid of specimens (one column on narrow windows). */
export function Grid({ children }: { children: ReactNode }) {
  return <div className={styles.grid2}>{children}</div>;
}
