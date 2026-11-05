/** @ui FileDrop — a large drop zone plus a big "Choose a file" button (many people don't drag files), then a
 *  preview card with the file's name and size and a Remove button, so a wrong file is caught before saving.
 *  `state` shows the upload as it happens: uploading → uploaded, or the error. */
import { useRef, useState } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import styles from './FileDrop.module.css';

export interface PickedFile { name: string; size: number }

interface FileDropProps {
  file: PickedFile | null;
  onPick: (file: File) => void;
  onRemove: () => void;
  accept: string;
  hint: string;
  error?: string;
  state?: 'idle' | 'uploading' | 'done';
}

const size = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

export function FileDrop({ file, onPick, onRemove, accept, hint, error, state = 'idle' }: FileDropProps) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const pick = (f?: File | null) => f && onPick(f);

  if (file) {
    return (
      <div className={styles.card} data-error={error ? '' : undefined}>
        <span className={styles.fileIcon}><Icon name={/\.pdf$/i.test(file.name) ? 'pdf' : 'file'} size={24} /></span>
        <span className={styles.meta}>
          <span className={styles.name}>{file.name}</span>
          <span className={styles.sub}>
            {error ?? (state === 'uploading' ? 'Uploading…' : state === 'done' ? `Uploaded ✓ · ${size(file.size)}` : `${size(file.size)} · ready to upload`)}
          </span>
        </span>
        <Button variant="ghost" size="sm" disabled={state === 'uploading'} onClick={onRemove}>Remove</Button>
      </div>
    );
  }

  return (
    <div
      className={styles.zone}
      data-over={over || undefined}
      data-error={error ? '' : undefined}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]); }}
    >
      <Icon name="upload" size={28} />
      <p className={styles.title}>Drag a file here</p>
      <p className={styles.sub}>{hint}</p>
      <Button variant="secondary" className={styles.choose} onClick={() => input.current?.click()}>Choose a file</Button>
      <input ref={input} type="file" accept={accept} hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
