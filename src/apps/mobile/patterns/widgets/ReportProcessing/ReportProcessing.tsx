/**
 * @pattern ReportProcessing — full-screen "reading your report" step after a lab photo or file is added
 *          (design 2026-10-21): animated phase title (FluxLabel), the blurred report card with a turning icon,
 *          and a FluxBar progress at the bottom. No sheet.
 * @usedBy  M-5.3 Add your lab results (also fits document uploads)
 */
import { FluxBar, FluxLabel, fluxLabel, Icon, Overlay, type FluxPhase } from '@mobile/ui';
import styles from './ReportProcessing.module.css';

export interface ReportProcessingProps {
  /** 0–1: picks the status line. */
  progress: number;
  /** Image shown blurred (prototype: a sample photo — the real file is never read). */
  image?: string;
  title?: string;
}

/* Animated title phases (design 2026-10-21): the top line changes as the report is read; the bar sits at the bottom. */
const PHASES: FluxPhase[] = [
  { at: 0, label: 'Reading your report' },
  { at: 50, label: 'Getting your results ready' },
]

export function ReportProcessing({ progress, image = '/images/labs/camera-preview.jpg', title = 'Reading your report' }: ReportProcessingProps) {
  const pct = Math.min(100, Math.max(0, progress * 100));
  const step = pct === 0 ? title : fluxLabel(pct, PHASES);
  return (
    <Overlay>
      <div className={styles.root} role="status" aria-live="polite" aria-label={`${title}. ${step}`}>
        <h1 className={styles.srOnly}>{title}</h1>
        <FluxLabel label={step} />
        <div className={styles.card}>
          <img className={styles.image} src={image} alt="" />
          <span className={styles.spin} aria-hidden><Icon name="refresh" size={44} strokeWidth={2} /></span>
        </div>
        <div className={styles.bar}><FluxBar value={pct} label={title} valueText={`${Math.round(pct)}% · ${step}`} /></div>
      </div>
    </Overlay>
  );
}
