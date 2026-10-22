/**
 * @ui Aura — the shared screen backdrop: Wispr Flow (grainy violet → cream), lifted by
 * `--backdrop-lift` so content gets more calm space. `rise` starts it in the Splash position
 * and glides it up once, so a Splash → screen hand-off reads as one continuous backdrop.
 * Used by Welcome, Home, Conversation, and the rest of the Aura screens.
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
