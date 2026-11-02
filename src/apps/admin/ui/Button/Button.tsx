/** @ui Button — Base UI Button skinned with our tokens: pill shape, five variants, optional icon and loading state. */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Button as Base } from '@base-ui/react/button';
import { Icon, type IconName } from '../Icon';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'link';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: IconName;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = 'primary', size = 'md', fullWidth, loading, leadingIcon, className, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <Base
      ref={ref}
      {...rest}
      type={type}
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      data-full={fullWidth || undefined}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      {loading ? <span className={styles.spinner} aria-hidden /> : leadingIcon && <Icon name={leadingIcon} size={18} />}
      <span>{children}</span>
    </Base>
  );
});
