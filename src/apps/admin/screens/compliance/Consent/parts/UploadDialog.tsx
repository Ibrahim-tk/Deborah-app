/** Upload a new consent version: pick a PDF (read locally only) and name the version. */
import { useRef, useState } from 'react';
import { useAdminStore } from '@shared/admin';
import { Button, Dialog, Input } from '@admin/ui';
import { useSim } from '@admin/hooks/useSim';
import styles from './UploadDialog.module.css';

export function UploadDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState<string>('');
  const input = useRef<HTMLInputElement>(null);
  const { busy, run } = useSim();
  const upload = () => run(() => { useAdminStore.getState().uploadConsent(name.trim()); onClose(); }, 'Version uploaded', 1200);

  return (
    <Dialog
      title="Upload consent version"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={busy} disabled={!name.trim() || !file} onClick={upload}>Upload version</Button>
        </>
      }
    >
      <Input label="Version name" placeholder="Consent 2026.4" value={name} onChange={(e) => setName(e.target.value)} />
      <input ref={input} type="file" accept="application/pdf" hidden onChange={(e) => setFile(e.target.files?.[0]?.name ?? '')} />
      <div className={styles.file}>
        <span className={styles.fileName}>{file || 'No file chosen'}</span>
        <Button variant="secondary" size="sm" leadingIcon="file" onClick={() => input.current?.click()}>{file ? 'Change file' : 'Choose PDF'}</Button>
      </div>
    </Dialog>
  );
}
