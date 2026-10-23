/**
 * @ui Aura — shared screen backdrop. Web: soft lavender mist photo (cream → purple foot).
 * `rise` glides the wash up on mount. Used by Conversation (and other gradient screens).
 */
import { cx } from '@shared/utils';
import styles from './Aura.module.css';

export interface AuraProps {
  /** Glide up from the unshifted Splash position on mount. */
  rise?: boolean;
  className?: string;
}

export function Aura({ rise, className }: AuraProps) {
  return <span className={cx(styles.root, rise && styles.rise, className)} aria-hidden data-bg-layer />;
}
