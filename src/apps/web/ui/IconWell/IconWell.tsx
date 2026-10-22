/** @ui IconWell — flat Hugeicon in a soft circular disc (AI-native overhaul). */
import { cx } from '@shared/utils';
import { Icon, type IconName } from '../Icon';
import styles from './IconWell.module.css';

export type IconWellTint = 'default' | 'lilac' | 'linen' | 'rose' | 'accent';

export interface IconWellProps {
  icon: IconName;
  size?: number;
  well?: 'sm' | 'md';
  tint?: IconWellTint;
  className?: string;
}

const TINT: Record<IconWellTint, string | undefined> = {
  default: undefined,
  lilac: styles.tintLilac,
  linen: styles.tintLinen,
  rose: styles.tintRose,
  accent: styles.tintAccent,
};

export function IconWell({ icon, size = 20, well = 'md', tint = 'default', className }: IconWellProps) {
  return (
    <span className={cx(styles.root, well === 'sm' && styles.sm, TINT[tint], className)} aria-hidden>
      <Icon name={icon} size={size} />
    </span>
  );
}
