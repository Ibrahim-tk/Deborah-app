/** @ui Divider — 1 px hairline; optional 16 px inset (list separators). @xref mobile: apps/mobile/ui/Divider */
import { cx } from '@shared/utils';
import styles from './Divider.module.css';

export function Divider({ inset = false, className }: { inset?: boolean; className?: string }) {
  return <hr className={cx(styles.root, inset && styles.inset, className)} />;
}
