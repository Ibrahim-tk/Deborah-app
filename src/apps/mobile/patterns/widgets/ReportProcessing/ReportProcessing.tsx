/**
 * @pattern ReportProcessing — full-screen "reading your report" step after a lab photo or file is added
 *          (design 2026-10-20): serif title, the report blurred in a rounded card with a slow turning icon,
 *          and one plain status line that moves through the steps. No progress bar, no sheet.
 * @usedBy  M-5.3 Add your lab results (also fits document uploads)
 */
import { Icon, Overlay } from '@mobile/ui';
import styles from './ReportProcessing.module.css';

export interface ReportProcessingProps {
  /** 0–1: picks the status line. */
  progress: number;
  /** Image shown blurred (prototype: a sample photo — the real file is never read). */
  image?: string;
  title?: string;
}

const STEPS = ['Finding the results on your report…', 'Checking each value and its range…', 'Getting your results ready…'];

export function ReportProcessing({ progress, image = '/images/labs/camera-preview.jpg', title = 'Reading your report' }: ReportProcessingProps) {
  const step = STEPS[Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length))];
  return (
    <Overlay>
      <div className={styles.root} role="status" aria-live="polite" aria-label={`${title}. ${step}`}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.card}>
          <img className={styles.image} src={image} alt="" />
          <span className={styles.spin} aria-hidden><Icon name="refresh" size={44} strokeWidth={2} /></span>
        </div>
        <p className={styles.step}>{step}</p>
      </div>
    </Overlay>
  );
}
