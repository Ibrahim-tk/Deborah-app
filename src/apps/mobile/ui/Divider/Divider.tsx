/** @ui Divider — 1 px hairline; inset 20 pt by default (list separators). */
import styles from './Divider.module.css';

export function Divider({ inset = true }: { inset?: boolean }) {
  return <hr className={styles.root} data-inset={inset} />;
}
