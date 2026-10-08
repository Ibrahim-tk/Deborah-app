/** Read-only lab values (M-9.5): marker · value unit, "edited" as plain text. */
import type { LabValue } from '@shared/types/domain';
import styles from '../LabReport.module.css';

export function LabValueList({ values }: { values: LabValue[] }) {
  if (values.length === 0) return <p className={styles.muted}>No values on this report.</p>;
  return (
    <dl className={styles.values}>
      {values.map((v) => (
        <div key={v.id} className={styles.row}>
          <dt className={styles.marker}>
            {v.marker}
            {v.edited && <span className={styles.edited}> · edited</span>}
          </dt>
          <dd className={styles.value}>
            {v.value}
            {v.unit && <span className={styles.unit}> {v.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
