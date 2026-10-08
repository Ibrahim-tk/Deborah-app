/**
 * @ui   Button — DESIGN.web.md › Buttons. primary · secondary · ghost · destructive · emergency · link.
 *       Fully rounded; md 44 px, lg 48 px (page-level primaries). Hover: primary → accent-pressed,
 *       secondary → accent-tint-pressed, ghost/link → underline. Loading keeps the label and width.
 * @xref mobile: apps/mobile/ui/Button
 */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '@shared/utils';
import { Icon, type IconName } from '../Icon';
import { Spinner } from '../Spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'emergency' | 'link';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: ButtonVariant;
  /** md 44 px (default) · lg 48 px for page-level primaries. */
  size?: 'md' | 'lg';
  fullWidth?: boolean;
  /** Shows a spinner in place of the icon, keeps the label, blocks clicks. */
  loading?: boolean;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = 'primary', size = 'md', fullWidth = false, loading = false, leadingIcon, trailingIcon, className, type = 'button', disabled, onClick, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(styles.root, styles[variant], styles[size], fullWidth && styles.fullWidth, loading && styles.loading, className)}
      aria-busy={loading || undefined}
      disabled={disabled}
      onClick={loading ? undefined : onClick}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : leadingIcon && <Icon name={leadingIcon} size={20} />}
      <span className={styles.label}>{children}</span>
      {trailingIcon && !loading && <Icon name={trailingIcon} size={18} />}
    </button>
  );
});
