/** Step 2 — what kind of document this is. Option rows, never chips. */
import { documentConfig } from '@shared/data';
import type { DocumentType } from '@shared/types/domain';
import { OptionList, OptionRow } from '@web/ui';
import { FileLine } from './FileLine';
import type { PickedDocument } from './saveDocument';
import styles from '../UploadDocument.module.css';

export function TypeStep({ file, value, onSelect }: { file: PickedDocument; value?: DocumentType; onSelect: (t: DocumentType) => void }) {
  return (
    <div className={styles.body}>
      <FileLine file={file} />
      <OptionList label="What kind of document is it?">
        {documentConfig.types.map((t) => (
          <OptionRow key={t.id} selected={value === t.id} onSelect={() => onSelect(t.id)}>
            {t.label}
          </OptionRow>
        ))}
      </OptionList>
    </div>
  );
}
