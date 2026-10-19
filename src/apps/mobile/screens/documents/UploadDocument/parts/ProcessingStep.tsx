/** Uploading securely… → Reading key details… (simulated; nothing leaves the browser). */
import { Button, ProgressBar, ProgressStatus } from '@mobile/ui';
import { FileLine } from './FileLine';
import type { PickedDocument } from './saveDocument';
import styles from '../UploadDocument.module.css';

const LABEL = { uploading: 'Uploading securely…', reading: 'Reading key details…' } as const;

export function ProcessingStep({ file, phase, progress, onStop }: { file: PickedDocument; phase: 'uploading' | 'reading'; progress: number; onStop: () => void }) {
  return (
    <div className={styles.processing}>
      <FileLine file={file} />
      <ProgressBar value={progress} label={LABEL[phase].replace('…', '')} />
      <ProgressStatus label={LABEL[phase]} />
      <Button variant="ghost" size="md" onClick={onStop}>Stop</Button>
    </div>
  );
}
