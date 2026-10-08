/** @ui IconButton — icon-only control with a required accessible label (also the tooltip). 44 px; sm 36 px visual. @xref mobile: apps/mobile/ui/IconButton */
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx } from '@shared/utils';
import { Icon, type IconName } from '../Icon';
import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconName;
  /** Required: icon-only controls need an accessible name. */
  label: string;
  size?: 'sm' | 'md' | 'lg';
  /** plain (hover Lilac) · accent (send) · tint (Lilac fill) · surface (floating, float-sm). */
  tone?: 'plain' | 'accent' | 'tint' | 'surface';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, size = 'md', tone = 'plain', className, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-label={label} title={label} className={cx(styles.root, styles[size], styles[tone], className)} {...rest}>
      <Icon name={icon} size={size === 'lg' ? 24 : size === 'sm' ? 18 : 22} />
    </button>
  );
});
