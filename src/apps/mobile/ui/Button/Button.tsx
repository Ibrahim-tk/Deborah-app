/**
 * @ui Button — DESIGN.md › Buttons. primary · secondary · ghost (tertiary text) · destructive ·
 * emergency · link. Fully rounded, 56 pt (lg) / 48 pt (md); sm keeps a 48 pt hit area.
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@shared/utils';
import { Icon, type IconName } from '../Icon';
import { Spinner } from '../Spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'emergency' | 'link';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: 'lg' | 'md' | 'sm';
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: IconName;
}

export function Button({
  children,
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  loading = false,
  leadingIcon,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.root, styles[variant], styles[size], fullWidth && styles.fullWidth, className)}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : leadingIcon && <Icon name={leadingIcon} size={22} />}
      <span className={styles.label}>{children}</span>
    </button>
  );
}
