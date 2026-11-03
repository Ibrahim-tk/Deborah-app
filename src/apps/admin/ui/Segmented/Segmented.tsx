/** @ui Segmented — the app's own segmented control (web ui/Segmented: white outlined track, soft accent pick),
 *  borrowed one way from web. Admin only sizes it to its content, since the web one spans its container. */
import { Segmented as WebSegmented, type SegmentedProps } from '@web/ui';
import styles from './Segmented.module.css';

export type { SegmentedProps };

export function Segmented<T extends string>(props: SegmentedProps<T>) {
  return (
    <div className={styles.fit}>
      <WebSegmented {...props} />
    </div>
  );
}
