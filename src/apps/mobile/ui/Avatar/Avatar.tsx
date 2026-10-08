/** @ui Avatar — Deborah: photo in a circle with a 2 px Signature Gold ring. Profiles: Cormorant initial on Lilac Mist. */
import type { CSSProperties } from 'react';
import { cx } from '@shared/utils';
import styles from './Avatar.module.css';

export interface AvatarProps {
  /** Image for Deborah's portrait; when absent the initial is shown. */
  image?: string;
  initial?: string;
  size?: number;
  /** Gold ring (Deborah only). */
  ring?: boolean;
  label?: string;
  className?: string;
}

export function Avatar({ image, initial, size = 40, ring = false, label, className }: AvatarProps) {
  return (
    <span
      className={cx(styles.root, ring && styles.ring, className)}
      style={{ '--avatar-size': `${size}px` } as CSSProperties}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {image ? <img src={image} alt="" className={styles.image} /> : <span className={styles.initial}>{initial?.slice(0, 1).toUpperCase()}</span>}
    </span>
  );
}
