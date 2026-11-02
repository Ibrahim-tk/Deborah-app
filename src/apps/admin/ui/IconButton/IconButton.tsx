/** @ui IconButton — Base UI Button with an icon only; the label is its accessible name and native tooltip.
 *  Forwards its ref so it can be a Menu trigger. */
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Button as Base } from '@base-ui/react/button';
import { Icon, type IconName } from '../Icon';
import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'> {
  icon: IconName;
  label: string;
  size?: 'sm' | 'md';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({ icon, label, size = 'md', className, ...rest }, ref) {
  return (
    <Base ref={ref} {...rest} aria-label={label} title={label} data-size={size} className={[styles.root, className].filter(Boolean).join(' ')}>
      <Icon name={icon} size={size === 'sm' ? 18 : 20} />
    </Base>
  );
});
