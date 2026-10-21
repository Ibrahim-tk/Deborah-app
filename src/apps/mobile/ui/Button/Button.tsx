/**
 * @ui Button — MUI Button anatomy (contained · outlined · text), Oracle tokens.
 * Variants: primary · secondary · outline · ghost · link · destructive · emergency.
 * Fully rounded; heights from `--button-h`. `deborah` leading icon renders the orb.
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@shared/utils';
import { Icon, type IconName } from '../Icon';
import { Spinner } from '../Spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'emergency' | 'link' | 'outline';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: 'lg' | 'md' | 'sm';
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: IconName;
}

const iconSize = (size: NonNullable<ButtonProps['size']>, name?: IconName) => {
  if (name === 'deborah') return size === 'sm' ? 22 : 26;
  return size === 'sm' ? 18 : size === 'md' ? 20 : 22;
};

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
      {loading ? <Spinner size={16} /> : leadingIcon && <Icon name={leadingIcon} size={iconSize(size, leadingIcon)} />}
      <span className={styles.label}>{children}</span>
    </button>
  );
}
