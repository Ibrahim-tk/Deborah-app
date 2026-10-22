/**
 * @pattern UploadCard — add a lab report in the chat: a dashed drop area, a simulated upload (no network),
 *          then the file as a one-line record. Prototype only: no file is read or sent.
 * @usedBy  widget lab (/wid)
 */
import { useEffect, useRef, useState } from 'react';
import { Icon, ProgressBar } from '@web/ui';
import styles from './UploadCard.module.css';

const FILE = 'Thyroid panel, March.pdf';

export interface UploadCardProps {
  onUploaded?: (file: string) => void;
  /** Real app consumers open the existing picker/review flow instead of running the lab simulation. */
  onAdd?: () => void;
  label?: string;
  disabled?: boolean;
}

export function UploadCard({ onUploaded, onAdd, label = 'Add a lab report', disabled }: UploadCardProps) {
  const [progress, setProgress] = useState<number>();
  useEffect(() => {
    if (progress === undefined || progress >= 1) return;
    const id = window.setTimeout(() => setProgress((p) => Math.min(1, (p ?? 0) + 0.2)), 260);
    return () => window.clearTimeout(id);
  }, [progress]);
  // Reports the upload exactly once, even if the parent passes a new callback on every render.
  const reported = useRef(false);
  const latest = useRef(onUploaded);
  useEffect(() => { latest.current = onUploaded; });
  useEffect(() => {
    if (progress !== 1 || reported.current) return;
    reported.current = true;
    latest.current?.(FILE);
  }, [progress]);

  if (progress === undefined)
    return (
      <button type="button" className={styles.drop} disabled={disabled} onClick={() => onAdd ? onAdd() : setProgress(0)}>
        <Icon name="upload" size={24} />
        <span className={styles.label}>{label}</span>
        <span className={styles.hint}>PDF or photo · stays private</span>
      </button>
    );
  return (
    <section className={styles.root} aria-label="Uploading lab report">
      <p className={styles.file}><Icon name="file" size={18} /> {FILE}</p>
      {progress < 1 ? <ProgressBar value={progress} label="Uploading" /> : <p className={styles.done}><Icon name="check" size={16} /> Added to your labs</p>}
    </section>
  );
}
