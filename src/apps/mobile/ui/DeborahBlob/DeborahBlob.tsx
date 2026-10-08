/**
 * @ui DeborahBlob — Deborah's AI presence: real portrait inside a lavender glass drop.
 * Figma: Genesis › Deborah/AI blob (node 69:2527). Sizes in use: 160 hero, 40 chat avatar, 24 chat bar.
 * Layers are exported from Figma into /images/deborah/blob and scale with `size`.
 */
import type { CSSProperties } from 'react';
import { cx } from '@shared/utils';
import styles from './DeborahBlob.module.css';

const BASE = '/images/deborah/blob';

export interface DeborahBlobProps {
  size?: number;
  label?: string;
  className?: string;
}

export function DeborahBlob({ size = 40, label, className }: DeborahBlobProps) {
  return (
    <span
      className={cx(styles.root, className)}
      style={{ '--blob-size': `${size}px` } as CSSProperties}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <img src={`${BASE}/halo.svg`} alt="" className={styles.halo} />
      <img src={`${BASE}/photo.png`} alt="" className={styles.drop} />
      <img src={`${BASE}/glass.svg`} alt="" className={styles.drop} />
      <img src={`${BASE}/rim.svg`} alt="" className={styles.drop} />
      <img src={`${BASE}/specular.svg`} alt="" className={styles.specular} />
      <img src={`${BASE}/specular-dot.svg`} alt="" className={styles.dot} />
    </span>
  );
}
