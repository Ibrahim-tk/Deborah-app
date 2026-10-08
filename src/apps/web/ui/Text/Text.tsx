/**
 * @ui   Text — the desktop type roles as one primitive (DESIGN.web.md › Typography). Cormorant only for
 *       display / title-1 / title-2 (≥ 28 px here); everything else SF Pro. Weight comes from the role.
 * @xref mobile: apps/mobile/styles/mobile.tokens.css (.t-* utility classes)
 */
import type { ElementType, ReactNode } from 'react';
import { cx } from '@shared/utils';
import styles from './Text.module.css';

export type TextVariant =
  | 'display'
  | 'title-1'
  | 'title-2'
  | 'title-3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subhead'
  | 'footnote'
  | 'caption'
  | 'data';

export type TextTone = 'ink' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'warning' | 'gold' | 'rose' | 'onSignature' | 'inherit';

export interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  tone?: TextTone;
  /** Element to render (default: h1 for display, h2 for title-1/2, h3 for title-3, p otherwise). */
  as?: ElementType;
  italic?: boolean;
  className?: string;
  id?: string;
}

const defaultTag: Partial<Record<TextVariant, ElementType>> = { display: 'h1', 'title-1': 'h2', 'title-2': 'h2', 'title-3': 'h3' };

export function Text({ children, variant = 'body', tone = 'ink', as, italic, className, id }: TextProps) {
  const Tag = as ?? defaultTag[variant] ?? 'p';
  return (
    <Tag id={id} className={cx(styles.root, styles[variant.replace('-', '')], styles[tone], italic && styles.italic, className)}>
      {children}
    </Tag>
  );
}
