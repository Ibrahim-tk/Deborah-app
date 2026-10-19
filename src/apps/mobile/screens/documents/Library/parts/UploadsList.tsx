/** My Uploads: the profile's documents, newest first, or the empty state. */
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { documentConfig } from '@shared/data';
import { selectDocuments, useAppStore } from '@shared/store';
import type { HealthDocument } from '@shared/types/domain';
import { formatShortDate } from '@shared/utils';
import { ActionSheet, Divider } from '@mobile/ui';
import { DocumentRow, EmptyState } from '@mobile/patterns/health';
import { useNav } from '@mobile/navigation';
import { useDeleteDocument } from '../../useDeleteDocument';
import styles from './Lists.module.css';

const formatLabel = (d: HealthDocument) => documentConfig.formats.find((f) => f.format === d.format)?.label ?? d.format.toUpperCase();

const sizeLabel = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

// The title already carries type and document date, so the subtitle says when and what was uploaded.
const documentMeta = (d: HealthDocument) => [`Uploaded ${formatShortDate(d.uploadedAt)}`, formatLabel(d), sizeLabel(d.sizeBytes)].join(' · ');

export function UploadsList({ profileId, onUpload }: { profileId: string; onUpload: () => void }) {
  const { push } = useNav();
  const docs = useAppStore(useShallow((s) => selectDocuments(s, profileId)));
  const name = useAppStore((s) => s.profiles.byId[profileId]);
  const [menuFor, setMenuFor] = useState<HealthDocument>();
  const remove = useDeleteDocument();

  if (docs.length === 0) {
    return (
      <div className={styles.empty}>
        <EmptyState
          icon="file"
          title="No documents yet"
          text={
            name && name.relationship !== 'self'
              ? `Lab results, imaging reports, prescriptions and visit notes you add for ${name.name} live here.`
              : 'Lab results, imaging reports, prescriptions and visit notes you add live here.'
          }
          actionLabel="Upload a document"
          actionIcon="upload"
          onAction={onUpload}
        />
      </div>
    );
  }
  return (
    <>
      <ul className={styles.list}>
        {docs.map((d) => (
          <li key={d.id}>
            <DocumentRow
              title={d.title}
              type={d.type}
              meta={documentMeta(d)}
              onPress={() => push('M-11.2', { documentId: d.id })}
              onLongPress={() => setMenuFor(d)}
            />
            <Divider />
          </li>
        ))}
      </ul>
      <ActionSheet
        open={Boolean(menuFor)}
        title={menuFor?.title}
        actions={[
          { label: 'Open', onSelect: () => { const d = menuFor; setMenuFor(undefined); if (d) push('M-11.2', { documentId: d.id }); } },
          { label: 'Delete document', destructive: true, onSelect: () => { const d = menuFor; setMenuFor(undefined); if (d) remove(d); } },
        ]}
        onClose={() => setMenuFor(undefined)}
      />
    </>
  );
}
