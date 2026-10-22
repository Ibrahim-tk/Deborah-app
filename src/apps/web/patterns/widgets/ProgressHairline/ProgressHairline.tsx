/** Thin progress line (0–1) for Home / hub color fields. */
import type { CSSProperties } from 'react';
import { cx } from '@shared/utils';
import field from '../homeField.module.css';

export function ProgressHairline({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cx(field.bar, className)} aria-hidden>
      <span
        className={field.fill}
        style={{ '--p': Math.max(0.02, Math.min(1, value)) } as CSSProperties}
      />
    </span>
  );
}
