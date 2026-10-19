/** The picked file: format icon, name (wraps), size. */
import { Icon } from '@mobile/ui';
import type { PickedDocument } from './saveDocument';
import styles from '../UploadDocument.module.css';

const sizeLabel = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export function FileLine({ file }: { file: Pick<PickedDocument, 'fileName' | 'sizeBytes' | 'format' | 'source'> }) {
  const icon = file.source === 'camera' ? 'camera' : file.format === 'pdf' ? 'pdf' : file.format === 'txt' ? 'file' : 'image';
  return (
    <p className={styles.file}>
      <Icon name={icon} size={22} />
      <span className={styles.fileName}>{file.fileName}</span>
      <span className={styles.fileSize}>{sizeLabel(file.sizeBytes)}</span>
    </p>
  );
}
