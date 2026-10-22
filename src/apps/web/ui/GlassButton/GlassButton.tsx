/**
 * @ui GlassButton — iOS 26 "Liquid Glass" control: clear, heavily blurred, with a hairline
 * specular rim (bright top edge, softer bottom) and a faint lift shadow. 44 pt.
 * Circle when icon-only; capsule when it has a label or custom children (e.g. avatar + chevron).
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@shared/utils';
import { Icon, type IconName } from '../Icon';
import styles from './GlassButton.module.css';

export interface GlassButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon?: IconName;
  /** Visible text; when absent (and no children) the button is a circle and `aria-label` is required. */
  label?: string;
  children?: ReactNode;
}

export function GlassButton({ icon, label, children, className, type = 'button', ...rest }: GlassButtonProps) {
  const capsule = Boolean(label || children);
  return (
    <button type={type} className={cx(styles.root, capsule ? styles.capsule : styles.circle, className)} {...rest}>
      {icon && <Icon name={icon} size={20} strokeWidth={1.75} />}
      {label && <span className={styles.label}>{label}</span>}
      {children}
    </button>
  );
}
