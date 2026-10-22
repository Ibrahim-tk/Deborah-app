/** The document's kind at a glance: large type icon, file name, format. The file is never read. */
import type { DocumentFormat, DocumentType, HealthDocument } from '@shared/types/domain';
import { Icon } from '@web/ui';
import { DOCUMENT_ICON } from '@web/patterns/health';
import styles from '../DocumentPreview.module.css';

export interface FileSurfaceProps {
  type: DocumentType;
  format: DocumentFormat;
  source: HealthDocument['source'];
  fileName: string;
}

export function FileSurface({ type, format, source, fileName }: FileSurfaceProps) {
  const kind = source === 'camera' ? 'Photo' : format === 'pdf' ? 'PDF document' : format === 'txt' ? 'Text file' : 'Image';
  return (
    <div className={styles.surface}>
      <span className={styles.surfaceIcon} aria-hidden>
        <Icon name={DOCUMENT_ICON[type]} size={32} />
      </span>
      <p className={styles.fileName}>{fileName}</p>
      <p className={styles.fileKind}>{kind}</p>
    </div>
  );
}
