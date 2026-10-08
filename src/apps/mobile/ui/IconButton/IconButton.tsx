/** @ui IconButton — icon-only control with a required accessible label; 48 pt hit area. */
import type { ButtonHTMLAttributes } from 'react';
import { cx } from '@shared/utils';
import { Icon, type IconName } from '../Icon';
import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconName;
  /** Required: icon-only controls need an accessible name. */
  label: string;
  size?: 'md' | 'lg';
  tone?: 'plain' | 'accent' | 'tint' | 'surface';
}

export function IconButton({ icon, label, size = 'md', tone = 'plain', className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button type={type} aria-label={label} title={label} data-icon-button="" className={cx(styles.root, styles[size], styles[tone], className)} {...rest}>
      <Icon name={icon} size={size === 'lg' ? 26 : 24} />
    </button>
  );
}
