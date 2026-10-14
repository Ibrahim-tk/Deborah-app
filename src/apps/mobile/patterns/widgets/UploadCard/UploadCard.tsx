/**
 * @pattern UploadCard — add a lab report in the chat: a dashed drop area, a simulated upload (no network),
 *          then the file as a one-line record. Prototype only: no file is read or sent.
 * @usedBy  widget lab (/wid)
 */
import { useEffect, useState } from 'react';
import { Icon, ProgressBar } from '@mobile/ui';
import styles from './UploadCard.module.css';

const FILE = 'Thyroid panel, March.pdf';

export interface UploadCardProps {
  onUploaded: (file: string) => void;
}

export function UploadCard({ onUploaded }: UploadCardProps) {
  const [progress, setProgress] = useState<number>();
  useEffect(() => {
    if (progress === undefined || progress >= 1) return;
    const id = window.setTimeout(() => setProgress((p) => Math.min(1, (p ?? 0) + 0.2)), 260);
    return () => window.clearTimeout(id);
  }, [progress]);
  useEffect(() => {
    if (progress === 1) onUploaded(FILE);
  }, [progress, onUploaded]);

  if (progress === undefined)
    return (
      <button type="button" className={styles.drop} onClick={() => setProgress(0)}>
        <Icon name="upload" size={24} />
        <span className={styles.label}>Add a lab report</span>
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
