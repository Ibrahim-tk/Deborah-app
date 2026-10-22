/** A TextArea with a visible label above it (TextArea's own label is accessible-only). */
import type { ComponentProps } from 'react';
import { TextArea } from '@web/ui';
import styles from '../LogVisit.module.css';

export function Area({ label, hideLabel, ...rest }: ComponentProps<typeof TextArea> & { hideLabel?: boolean }) {
  return (
    <div className={styles.area}>
      {!hideLabel && <span className={styles.fieldLabel} aria-hidden="true">{label}</span>}
      <TextArea label={label} {...rest} />
    </div>
  );
}
