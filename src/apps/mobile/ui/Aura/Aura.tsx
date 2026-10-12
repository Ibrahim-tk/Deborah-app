/**
 * @ui Aura — the shared screen backdrop: the Splash photo (Figma 139:876), a grainy violet/gold
 * sky melting into parchment, lifted by --backdrop-lift so content gets more calm space.
 * `rise` starts it in the Splash position and glides it up once, so a Splash → screen hand-off
 * reads as one continuous backdrop. Used by Welcome (M-1.2) and Home (M-2.0).
 */
import { cx } from '@shared/utils';
import styles from './Aura.module.css';

export interface AuraProps {
  /** Glide up from the unshifted Splash position on mount. */
  rise?: boolean;
  className?: string;
}

export function Aura({ rise, className }: AuraProps) {
  return <span className={cx(styles.root, rise && styles.rise, className)} aria-hidden />;
}
