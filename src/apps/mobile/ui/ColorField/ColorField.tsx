/** @ui ColorField — opaque tonal surface (linen / lilac / rose / paper / lift). No stroke, no shadow. */
import type { ReactNode } from 'react';
import { cx } from '@shared/utils';
import styles from './ColorField.module.css';

export type ColorFieldTone = 'lilac' | 'linen' | 'rose' | 'paper' | 'lift';

export interface ColorFieldProps {
  children: ReactNode;
  tone?: ColorFieldTone;
  pad?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  className?: string;
  label?: string;
  as?: 'section' | 'div';
}

export function ColorField({
  children,
  tone = 'lilac',
  pad = 'md',
  onPress,
  className,
  label,
  as = 'section',
}: ColorFieldProps) {
  const padClass = pad === 'sm' ? styles.padSm : pad === 'lg' ? styles.padLg : undefined;
  const cls = cx(styles.root, styles[tone], padClass, onPress && styles.pressable, className);
  if (onPress) {
    return (
      <button type="button" className={cls} onClick={onPress} aria-label={label}>
        {children}
      </button>
    );
  }
  const Tag = as;
  return (
    <Tag className={cls} aria-label={label}>
      {children}
    </Tag>
  );
}
