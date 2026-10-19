/** Step 3 — title, date on the document (optional, not in the future), description (optional). */
import { useId } from 'react';
import { Input, TextArea } from '@mobile/ui';
import type { DocumentDetails } from './saveDocument';
import styles from '../UploadDocument.module.css';

export interface DetailsStepProps {
  details: DocumentDetails;
  placeholderTitle: string;
  /** yyyy-mm-dd: the latest allowed date. */
  maxDate: string;
  dateError?: string;
  onChange: (patch: Partial<DocumentDetails>) => void;
}

export function DetailsStep({ details, placeholderTitle, maxDate, dateError, onChange }: DetailsStepProps) {
  const descId = useId();
  return (
    <div className={styles.body}>
      <Input label="Title" value={details.title} placeholder={placeholderTitle} onChange={(e) => onChange({ title: e.target.value })} />
      <Input
        label="Date on the document"
        type="date"
        max={maxDate}
        value={details.date}
        hint="Optional"
        error={dateError}
        onChange={(e) => onChange({ date: e.target.value })}
      />
      <div className={styles.field}>
        <label htmlFor={descId} className={styles.label}>Description</label>
        <TextArea
          id={descId}
          label="Description"
          minRows={2}
          maxRows={5}
          value={details.description}
          placeholder="Optional — what it is, or why you’re adding it"
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>
      <p className={styles.hint}>Upload time is added automatically.</p>
    </div>
  );
}
