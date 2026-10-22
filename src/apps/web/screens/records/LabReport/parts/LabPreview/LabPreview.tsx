/**
 * The report at a glance, centred at the top of M-9.5: the report photo for every report (design 2026-10-20).
 * Prototype: the real file is never stored, so one sample photo stands in.
 */
import type { LabReport } from '@shared/types/domain';
import styles from './LabPreview.module.css';

const PHOTO = '/images/labs/camera-preview.jpg';

export function LabPreview(_props: { report: LabReport }) {
  // Design 2026-10-20: always the report photo (the drawn miniature read worse).
  return (
    <figure className={styles.frame}>
      <img className={styles.photo} src={PHOTO} alt="Your lab report" />
    </figure>
  );
}
