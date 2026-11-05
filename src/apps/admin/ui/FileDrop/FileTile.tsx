/** @ui FileTile — an uploaded file shown as a file, not as text: type icon, name, kind, and clear actions. */
import { Button } from '../Button';
import { Icon } from '../Icon';
import styles from './FileDrop.module.css';

const KIND: Record<string, string> = { pdf: 'PDF document', docx: 'Word document', txt: 'Text file' };

export function FileTile({ name, detail, onOpen, onDownload }: { name: string; detail?: string; onOpen?: () => void; onDownload?: () => void }) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return (
    <div className={styles.tile}>
      <span className={styles.tileIcon} data-ext={ext}><Icon name={ext === 'pdf' ? 'pdf' : 'file'} size={28} /></span>
      <span className={styles.meta}>
        <span className={styles.name}>{name}</span>
        <span className={styles.sub}>{[KIND[ext] ?? 'File', detail].filter(Boolean).join(' · ')}</span>
      </span>
      <span className={styles.tileActions}>
        {onDownload && <Button variant="ghost" size="sm" leadingIcon="download" onClick={onDownload}>Download</Button>}
        {onOpen && <Button variant="secondary" size="sm" leadingIcon="external" onClick={onOpen}>Open</Button>}
      </span>
    </div>
  );
}
