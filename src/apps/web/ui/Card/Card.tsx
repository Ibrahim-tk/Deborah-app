/** @ui Card — Paper on Parchment, 16 pt radius, hairline border, no shadow (it scrolls, so it's flat). */
import type { ReactNode } from 'react';
import { cx } from '@shared/utils';
import styles from './Card.module.css';

export interface CardProps {
  children: ReactNode;
  tone?: 'default' | 'subtle' | 'emphasis' | 'danger';
  /** Renders as a button with pressed feedback. */
  onPress?: () => void;
  className?: string;
}

export function Card({ children, tone = 'default', onPress, className }: CardProps) {
  const cls = cx(styles.root, styles[tone], onPress && styles.pressable, className);
  return onPress ? (
    <button type="button" className={cls} onClick={onPress}>{children}</button>
  ) : (
    <div className={cls}>{children}</div>
  );
}
