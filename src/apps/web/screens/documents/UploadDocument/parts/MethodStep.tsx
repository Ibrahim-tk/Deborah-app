/** Step 1 — Take a photo or Choose a file; an unsupported file shows its error inline here. */
import { Button, OptionList, OptionRow } from '@web/ui';
import styles from '../UploadDocument.module.css';

export interface RejectedFile {
  fileName: string;
  message: string;
}

export function MethodStep({ rejected, onCamera, onPick }: { rejected?: RejectedFile; onCamera: () => void; onPick: () => void }) {
  return (
    <div className={styles.body}>
      {rejected ? (
        <div className={styles.rejected} role="alert">
          <p className={styles.rejectedName}>{rejected.fileName}</p>
          <p className={styles.error}>{rejected.message}</p>
          <Button variant="secondary" size="md" leadingIcon="upload" onClick={onPick}>Choose another file</Button>
        </div>
      ) : null}
      <OptionList label="How would you like to add it?">
        <OptionRow leadingIcon="camera" chevron onSelect={onCamera}>Take a photo</OptionRow>
        <OptionRow leadingIcon="upload" chevron onSelect={onPick}>Choose a file</OptionRow>
      </OptionList>
      <p className={styles.hint}>PDF, JPG, PNG or TXT, up to 20 MB.</p>
    </div>
  );
}
